import fetch from 'node-fetch';
import { generateSignature } from './utils';

interface BusinessParams {
  paymentKey: string;
  payoutKey: string;
  merchantUuid: string;
}

interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string | null;
}

class Business {
  private paymentKey: string;
  private payoutKey: string;
  private merchantUuid: string;
  private baseUrl: string;

  constructor({ paymentKey, payoutKey, merchantUuid }: BusinessParams) {
    this.paymentKey = paymentKey;
    this.payoutKey = payoutKey
    this.merchantUuid = merchantUuid;
    this.baseUrl = 'https://api.cryptomus.com/v1/';
  }

  private async request(endpoint: string, data: Record<string, any> = {}, method: string = 'POST', apiKeyType = "payment"): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const signature = generateSignature(data, apiKeyType === "payment" ? this.paymentKey : this.payoutKey);

    const options: RequestOptions = {
      method,
      headers: {
        'merchant': this.merchantUuid,
        'sign': signature,
        'Content-Type': 'application/json'
      },
      body: method === 'GET' ? null : JSON.stringify(data)
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Cryptomus API error');
      }
      return result;
    } catch (error) {
      throw new Error(`Request Error: ${error.message}`);
    }
  }

  payments = {
    async create(data: Record<string, any>): Promise<any> {
      return await this.request('payment', data);
    },

    async createWallet(data: Record<string, any>): Promise<any> {
      return await this.request('wallet', data);
    },

    async createWalletQR(data: Record<string, any>): Promise<any> {
      return await this.request('wallet/qr', data);
    },

    async blockWallet(data: Record<string, any>): Promise<any> {
      return await this.request('wallet/block-address', data);
    },

    async refundPaymentOnBlockedWallet(data: Record<string, any>): Promise<any> {
      return await this.request('wallet/blocked-address-refund', data);
    },

    async getPaymentInfo(data: Record<string, any>): Promise<any> {
      return await this.request(`payment/info`, data);
    },

    async refundPayment(data: Record<string, any>): Promise<any> {
      return await this.request('payment/refund', data);
    },

    async resendWebhook(data: Record<string, any>): Promise<any> {
      return await this.request('payment/resend', data);
    },

    async testWebhook(data: Record<string, any>): Promise<any> {
      return await this.request('test-webhook/payment', data);
    },

    async listServices(data: Record<string, any>): Promise<any> {
      return await this.request('payment/services', data);
    },

    async getPaymentHistory(data: Record<string, any>): Promise<any> {
      return await this.request('payment/list', data);
    }
  };

  payout = {
    async create(data: Record<string, any>): Promise<any> {
      return await this.request('payout', data, "POST", "payout");
    },
    async getInfo(data: Record<string, any>): Promise<any> {
      return await this.request('payout/info', data, "POST", "payout");
    },
    async getHistory(data: Record<string, any>): Promise<any> {
      return await this.request('payout/list', data, "POST", "payout");
    },
    async getServices(data: Record<string, any>): Promise<any> {
      return await this.request('payout/services', data, "POST", "payout");
    },
    async transferToPersonal(data: Record<string, any>): Promise<any> {
      return await this.request('transfer/to-personal', data, "POST", "payout");
    },
    async transferToBusiness(data: Record<string, any>): Promise<any> {
      return await this.request('transfer/to-business', data, "POST", "payout");
    },
  };

  recurring = {
    async create(data: Record<string, any>): Promise<any> {
      return await this.request('recurrence/create', data);
    },
    async getInfo(data: Record<string, any>): Promise<any> {
      return await this.request('recurrence/info', data);
    },
    async getHistory(data: Record<string, any>): Promise<any> {
      return await this.request('recurrence/list', data);
    },
    async cancel(data: Record<string, any>): Promise<any> {
      return await this.request('recurrence/cancel', data);
    },
  };
}

export default Business;
