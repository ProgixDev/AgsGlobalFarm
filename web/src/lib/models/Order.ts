import mongoose, { Schema, Document } from "mongoose";
import type { OrderItem, PaydunyaCustomer } from "@/types";

export interface IOrder extends Document {
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paydunyaToken?: string;
  paydunyaStatus?: string;
  paydunyaReceiptUrl?: string;
  paydunyaCustomer?: PaydunyaCustomer;
  paydunyaFailReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    id: { type: Schema.Types.Mixed },
    _id: { type: String },
    name: { type: String },
    title: { type: String },
    category: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number },
    priceTTC: { type: Number },
    unit: { type: String },
    image: { type: String },
    imageUrl: { type: String },
    description: { type: String },
    shortDescription: { type: String },
    longDescription: { type: String },
    stockQty: { type: Number },
    isInStock: { type: Boolean },
    brand: { type: String },
    origin: { type: String },
    usage: { type: String },
    safety: { type: String },
    dosage: { type: String },
    selectedSessionId: { type: Number },
    sessionId: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      required: true,
    },
    paymentMethod: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    paydunyaToken: { type: String },
    paydunyaStatus: { type: String },
    paydunyaReceiptUrl: { type: String },
    paydunyaCustomer: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    paydunyaFailReason: { type: String },
  },
  {
    timestamps: true,
  },
);

// Prevent re-compilation of model in development
const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
