// src/lib/payDunya.ts

interface PayDunyaItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  description?: string;
}

interface PayDunyaTax {
  name: string;
  amount: number;
}

interface PayDunyaCustomer {
  name?: string;
  email?: string;
  phone?: string;
}

interface PayDunyaInvoice {
  items?: Record<string, PayDunyaItem>;
  taxes?: Record<string, PayDunyaTax>;
  customer?: PayDunyaCustomer;
  channels?: string[] | string;
  total_amount: number;
  description?: string;
}

interface PayDunyaStore {
  name: string;
  tagline?: string;
  postal_address?: string;
  phone?: string;
  logo_url?: string;
  website_url?: string;
}

interface PayDunyaActions {
  cancel_url?: string;
  return_url?: string;
  callback_url?: string;
}

interface PayDunyaCustomData {
  [key: string]: any;
}

interface CreateInvoiceRequest {
  invoice: PayDunyaInvoice;
  store: PayDunyaStore;
  custom_data?: PayDunyaCustomData;
  actions?: PayDunyaActions;
}

interface CreateInvoiceResponse {
  response_code: string;
  response_text: string;
  description?: string;
  token?: string;
}

interface ConfirmPaymentResponse {
  response_code: string;
  response_text: string;
  hash: string;
  invoice: {
    token: string;
    total_amount: number;
    description?: string;
    items?: Record<string, PayDunyaItem>;
    taxes?: Record<string, PayDunyaTax>;
  };
  custom_data?: PayDunyaCustomData;
  actions?: PayDunyaActions;
  mode: string;
  status: "pending" | "completed" | "cancelled" | "failed";
  fail_reason?: string;
  customer?: PayDunyaCustomer;
  receipt_url?: string;
  errors?: {
    message: string;
    description: string;
  };
}

class PayDunyaAPI {
  private masterKey: string;
  private privateKey: string;
  private token: string;
  private mode: "test" | "live";

  constructor() {
    this.masterKey = process.env.PAYDUNYA_MASTER_KEY!;
    this.privateKey = process.env.PAYDUNYA_PRIVATE_KEY!;
    this.token = process.env.PAYDUNYA_TOKEN!;
    this.mode = (process.env.PAYDUNYA_MODE || "test") as "test" | "live";

    if (!this.masterKey || !this.privateKey || !this.token) {
      throw new Error("PayDunya credentials not configured");
    }
  }

  private getBaseUrl(): string {
    return this.mode === "live"
      ? "https://app.paydunya.com/api/v1"
      : "https://app.paydunya.com/sandbox-api/v1";
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "PAYDUNYA-MASTER-KEY": this.masterKey,
      "PAYDUNYA-PRIVATE-KEY": this.privateKey,
      "PAYDUNYA-TOKEN": this.token,
    };
  }

  async createInvoice(
    data: CreateInvoiceRequest,
  ): Promise<CreateInvoiceResponse> {
    const url = `${this.getBaseUrl()}/checkout-invoice/create`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `PayDunya API error: ${response.status} ${response.statusText}`,
      );
    }

    const result: CreateInvoiceResponse = await response.json();

    if (result.response_code !== "00") {
      throw new Error(`PayDunya error: ${result.response_text}`);
    }

    return result;
  }

  async confirmPayment(token: string): Promise<ConfirmPaymentResponse> {
    const url = `${this.getBaseUrl()}/checkout-invoice/confirm/${token}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `PayDunya API error: ${response.status} ${response.statusText}`,
      );
    }

    const result: ConfirmPaymentResponse = await response.json();

    if (result.response_code !== "00") {
      throw new Error(`PayDunya error: ${result.response_text}`);
    }

    return result;
  }
}

export { PayDunyaAPI };
export type {
  PayDunyaItem,
  PayDunyaTax,
  PayDunyaCustomer,
  PayDunyaInvoice,
  PayDunyaStore,
  PayDunyaActions,
  PayDunyaCustomData,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  ConfirmPaymentResponse,
};
