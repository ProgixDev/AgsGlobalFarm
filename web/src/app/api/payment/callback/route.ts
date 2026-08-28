import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import crypto from "crypto";
import { z } from "zod";
import qs from "qs";
import Order from "@/lib/models/Order";
import OnlineFormationModel from "@/lib/models/OnlineFormation";
import PresentialFormationModel from "@/lib/models/PresentialFormation";
import { connectToDatabase } from "@/lib/db";
import { PayDunyaAPI } from "@/lib/payDunya";
import { sendEmail } from "@/lib/email";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import NewOrderNotificationEmail from "@/emails/NewOrderNotificationEmail";
import type {
  FormationSession,
  OrderItem,
  PaydunyaCallbackData,
} from "@/types";

// Zod schemas for validation
const PaydunyaActionsSchema = z.object({
  cancel_url: z.string().optional(),
  return_url: z.string().optional(),
  callback_url: z.string().optional(),
});

const PaydunyaCustomerSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  isDefault: z.coerce.boolean().optional(),
});

const CustomDataSchema = z.object({
  userId: z.string(),
  cart: z.array(z.any()),
  address: AddressSchema.optional(),
});

const InvoiceSchema = z
  .object({
    token: z.string().min(1),
    total_amount: z.coerce.number(),
  })
  .passthrough();

const CallbackDataSchema = z
  .object({
    response_code: z.string().optional(),
    response_text: z.string().optional(),
    hash: z.string(),
    invoice: InvoiceSchema,
    custom_data: CustomDataSchema,
    actions: PaydunyaActionsSchema.optional(),
    mode: z.string().optional(),
    status: z.string(),
    customer: PaydunyaCustomerSchema.optional(),
    receipt_url: z.string().optional(),
    fail_reason: z.string().optional(),
    errors: z
      .object({
        message: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

// Helper function to convert objects with numeric keys to arrays
function objectToArray(obj: unknown): unknown {
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    const keys = Object.keys(obj);
    if (keys.every((key) => /^\d+$/.test(key))) {
      const arr: unknown[] = [];
      for (const key of keys.sort((a, b) => parseInt(a) - parseInt(b))) {
        arr[parseInt(key)] = objectToArray(
          (obj as Record<string, unknown>)[key],
        );
      }
      return arr;
    } else {
      const newObj: Record<string, unknown> = {};
      for (const key in obj) {
        newObj[key] = objectToArray((obj as Record<string, unknown>)[key]);
      }
      return newObj;
    }
  }
  return obj;
}

export async function POST(request: NextRequest) {
  console.log("Paydunya callback received");
  try {
    const formData = await request.formData();
    // console.log("Form data keys:", Array.from(formData.keys()));

    // Build query string from form data keys starting with 'data['
    const queryString = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("data["))
      .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
      .join("&");

    // Parse the query string into nested object
    const parsed = qs.parse(queryString, { allowDots: true });
    const data = parsed.data as Record<string, unknown>;

    // Convert objects with numeric keys to arrays
    const parsedData = objectToArray(data);

    // console.log("Parsed data:", JSON.stringify(parsedData, null, 2));

    // Validate the data with Zod
    let validatedData: PaydunyaCallbackData;
    try {
      validatedData = CallbackDataSchema.parse(parsedData);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 },
      );
    }

    const {
      invoice,
      hash,
      custom_data: postedCustomData,
      status: postedStatus,
    } = validatedData;

    // Verify the hash
    const masterKey = process.env.PAYDUNYA_MASTER_KEY;
    if (!masterKey) {
      return NextResponse.json(
        { error: "Paydunya master key not configured" },
        { status: 500 },
      );
    }
    const expectedHash = crypto
      .createHash("sha512")
      .update(masterKey)
      .digest("hex");
    // Never log either side of this comparison: PayDunya's IPN hash is a static
    // digest of the master key, so leaking it into logs is equivalent to
    // leaking the credential that authenticates callbacks.
    const hashBuffer = Buffer.from(hash, "utf8");
    const expectedBuffer = Buffer.from(expectedHash, "utf8");
    const hashMatches =
      hashBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(hashBuffer, expectedBuffer);
    if (!hashMatches) {
      console.error("Paydunya callback rejected: hash mismatch");
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
    }

    // Connect to MongoDB
    await connectToDatabase();

    // The hash above is the same value on every callback, so on its own it only
    // proves the caller knows a shared secret - not that a payment happened.
    // Ask PayDunya directly what the invoice's real state is and trust that.
    let confirmed;
    try {
      confirmed = await new PayDunyaAPI().confirmPayment(invoice.token);
    } catch (confirmError) {
      console.error("Paydunya invoice confirmation failed:", confirmError);
      // 502 keeps the callback in Paydunya's retry queue instead of marking it
      // delivered, so a transient outage does not silently drop a real payment.
      return NextResponse.json(
        { error: "Could not confirm invoice with Paydunya" },
        { status: 502 },
      );
    }

    const status = confirmed.status;
    const totalAmount = confirmed.invoice.total_amount;
    const receiptUrl = confirmed.receipt_url ?? validatedData.receipt_url;
    const customer = confirmed.customer ?? validatedData.customer;

    // Prefer the custom_data Paydunya echoes back over the posted body, so a
    // forged payload cannot swap in a different cart or user id. Paydunya can
    // return the cart as a numeric-keyed object, so normalise it the same way
    // the posted body is normalised before validating.
    const customDataResult = CustomDataSchema.safeParse(
      objectToArray(confirmed.custom_data),
    );
    const custom_data = customDataResult.success
      ? customDataResult.data
      : postedCustomData;
    if (!customDataResult.success) {
      console.warn(
        `Paydunya confirm returned no usable custom_data for ${invoice.token}; falling back to the posted payload`,
      );
    }

    if (postedStatus !== status) {
      console.warn(
        `Paydunya status mismatch for ${invoice.token}: posted "${postedStatus}", confirmed "${status}"`,
      );
    }

    // Paydunya retries a callback until it gets a success response, so the same
    // invoice can arrive several times. One order per invoice token.
    const existingOrder = await Order.findOne({ paydunyaToken: invoice.token });
    if (existingOrder) {
      console.log(
        `Paydunya callback for ${invoice.token} already processed (order ${existingOrder._id})`,
      );
      return NextResponse.json({ status: "success" });
    }

    // Check payment status
    if (status === "completed") {
      // Payment successful - create order and update formations
      const orderItems: OrderItem[] = [];
      for (const item of custom_data.cart) {
        const orderItem = { ...item } as OrderItem;

        // Ensure id field exists (required by Order model)
        if (!orderItem.id && item._id) {
          // Convert MongoDB _id to numeric id or use hash
          orderItem.id = parseInt(item._id.toString().substring(18, 24), 16);
        }

        if (item.title) {
          // Try to find the formation in both collections by _id
          const onlineFormation = await OnlineFormationModel.findById(item._id);
          const presentialFormation = await PresentialFormationModel.findById(
            item._id,
          );

          if (onlineFormation) {
            // It's an online formation
            console.log(
              `Found online formation: ${onlineFormation._id}, current owners:`,
              onlineFormation.owners,
            );
            await OnlineFormationModel.updateOne(
              {
                _id: onlineFormation._id,
                "owners.userId": { $ne: custom_data.userId },
              },
              {
                $push: {
                  owners: {
                    userId: custom_data.userId,
                    purchaseDate: new Date(),
                  },
                },
              },
            );
            console.log(
              `Added user ${custom_data.userId} to online formation ${onlineFormation._id} owners`,
            );
          } else if (presentialFormation) {
            // It's a presential formation
            console.log(
              `Found presential formation: ${presentialFormation._id}`,
            );
            const sessionId = item.selectedSessionId;
            if (sessionId) {
              // Update specific session with participant
              await PresentialFormationModel.updateOne(
                {
                  _id: presentialFormation._id,
                  sessions: {
                    $elemMatch: {
                      id: sessionId,
                      participants: { $ne: custom_data.userId },
                    },
                  },
                },
                {
                  $addToSet: {
                    "sessions.$.participants": custom_data.userId,
                  },
                  $inc: { "sessions.$.availableSpots": -1 },
                },
              );
              console.log(
                `Added user ${custom_data.userId} to presential formation ${presentialFormation._id} session ${sessionId}`,
              );
              orderItem.sessionId = sessionId;
            } else {
              // Fallback to first open session if no sessionId specified
              const openSession = presentialFormation.sessions?.find(
                (s: FormationSession) => s.status === "open",
              );
              if (openSession) {
                await PresentialFormationModel.updateOne(
                  {
                    _id: presentialFormation._id,
                    sessions: {
                      $elemMatch: {
                        id: openSession.id,
                        participants: { $ne: custom_data.userId },
                      },
                    },
                  },
                  {
                    $addToSet: {
                      "sessions.$.participants": custom_data.userId,
                    },
                    $inc: { "sessions.$.availableSpots": -1 },
                  },
                );
                console.log(
                  `Added user ${custom_data.userId} to presential formation ${presentialFormation._id} session ${openSession.id}`,
                );
                orderItem.sessionId = openSession.id;
              }
            }
          } else {
            console.error(
              `Formation not found in either collection with _id: ${item._id}`,
            );
          }
        }
        orderItems.push(orderItem);
      }

      const order = await Order.create({
        userId: custom_data.userId,
        items: orderItems,
        totalAmount,
        paymentStatus: "paid",
        paymentMethod: "paydunya",
        address: custom_data.address,
        paydunyaToken: invoice.token,
        paydunyaStatus: status,
        paydunyaReceiptUrl: receiptUrl,
        paydunyaCustomer: customer,
      });
      console.log("Order created successfully:", order._id);

      // Update user addresses if needed
      const client = new MongoClient(process.env.MONGODB_URI!);
      await client.connect();
      const db = client.db();
      if (custom_data.address) {
        await db.collection("users").updateOne(
          { id: custom_data.userId },
          {
            $addToSet: {
              addresses: custom_data.address,
            },
          },
        );
      }

      // Get user details for email
      const user = await db
        .collection("users")
        .findOne({ id: custom_data.userId });
      await client.close();

      // Send email notifications
      try {
        const customerName =
          customer?.name ||
          user?.name ||
          user?.firstName + " " + user?.lastName ||
          "Client";
        const customerEmail = user?.email || customer?.email;
        const customerPhone = customer?.phone || user?.phone;

        // Send confirmation email to client
        if (customerEmail) {
          await sendEmail({
            to: customerEmail,
            subject: "Confirmation de votre commande - GrowFarm",
            template: OrderConfirmationEmail({
              customerName,
              order: order.toObject(),
              receiptUrl,
            }),
          });
          console.log("Order confirmation email sent to client");
        }

        // Send notification email to owner/admin
        const ownerEmail = process.env.STORE_EMAIL;
        if (ownerEmail) {
          await sendEmail({
            to: ownerEmail,
            subject: `Nouvelle commande #${order._id} - ${customerName}`,
            template: NewOrderNotificationEmail({
              order: order.toObject(),
              customerName,
              customerEmail: customerEmail || "Non fourni",
              customerPhone,
            }),
          });
          console.log("Order notification email sent to owner");
        }
      } catch (emailError) {
        console.error("Error sending order emails:", emailError);
        // Don't fail the order if emails fail
      }

      // Clear cart or mark as processed (implement based on your cart logic)
    } else if (status === "failed" || status === "cancelled") {
      // Payment failed - create order with failed status (no formation updates)
      const orderItems: OrderItem[] = [];
      for (const item of custom_data.cart) {
        const orderItem = { ...item } as OrderItem;

        // Ensure id field exists (required by Order model)
        if (!orderItem.id && item._id) {
          // Convert MongoDB _id to numeric id or use hash
          orderItem.id = parseInt(item._id.toString().substring(18, 24), 16);
        }

        if (item.title && item.sessions && item.selectedSessionId) {
          // Presential formation - has sessions
          orderItem.sessionId = item.selectedSessionId;
        }
        orderItems.push(orderItem);
      }

      await Order.create({
        userId: custom_data.userId,
        items: orderItems,
        totalAmount,
        paymentStatus: "failed",
        paymentMethod: "paydunya",
        address: custom_data.address,
        paydunyaToken: invoice.token,
        paydunyaStatus: status,
        paydunyaReceiptUrl: receiptUrl,
        paydunyaCustomer: customer,
        paydunyaFailReason: confirmed.fail_reason ?? validatedData.fail_reason,
      });

      const client = new MongoClient(process.env.MONGODB_URI!);
      await client.connect();
      const db = client.db();
      await db.collection("failed_payments").insertOne({
        ...(parsedData as Record<string, unknown>),
        processedAt: new Date(),
      });
      await client.close();
    }

    // Return success response to Paydunya
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("IPN callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
