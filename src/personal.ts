import fetch from 'node-fetch';
import { generateSignature } from './utils';

interface PersonalParams {
  apiKey: string;
  accountUuid: string;
}

class Personal {
  private apiKey: string;
  private accountUuid: string;
  private baseUrl: string;

  constructor({ apiKey, accountUuid }: PersonalParams) {
    this.apiKey = apiKey;
    this.accountUuid = accountUuid;
    this.baseUrl = 'https://api.cryptomus.com';
  }

  private async request(endpoint: string, data: Record<string, any> = {}, method: string = 'POST'): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const signature = generateSignature(data, this.apiKey);

    const options = {
      method,
      headers: {
        'userId': this.accountUuid,
        'sign': signature,
        'Content-Type': 'application/json'
      },
      body: method === 'GET' ? null : JSON.stringify(data)
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(result) || 'Cryptomus API error');
      }
      return result;
    } catch (error) {
      throw new Error(`Request Error: ${error.message}`);
    }
  }

  async getBalance(): Promise<any> {
    return await this.request('/v2/user-api/balance', {}, 'GET');
  }

  async calculateConvert(data: Record<string, any>): Promise<any> {
    return await this.request('/v2/user-api/convert/calculate', data);
  }

  async convert(data: Record<string, any>): Promise<any> {
    return await this.request('/v2/user-api/convert', data);
  }

  async createLimitOrder(data: Record<string, any>): Promise<any> {
    return await this.request('/v2/user-api/convert/limit', data);
  }

  async cancelLimitOrder(uuid: string): Promise<any> {
    return await this.request(`/v2/user-api/convert/${uuid}`, {}, 'DELETE');
  }

  async getDirectionsList(): Promise<any> {
    return await this.request('/v2/user-api/convert/direction-list', {}, 'GET');
  }

  async getOrders(data: Record<string, any>): Promise<any> {
    const params = new URLSearchParams(data).toString();
    return await this.request(`/v2/user-api/convert/order-list?${params}`, {}, 'GET');
  }

  async getAssets(): Promise<any> {
    return await this.request('/v1/exchange/market/assets', {}, 'GET');
  }

  async getOrderBook(data: { currency_pair: string; level: number }): Promise<any> {
    return await this.request(`/v1/exchange/market/order-book/${data.currency_pair}?level=${data.level}`, {}, 'GET');
  }

  async getTickers(): Promise<any> {
    return await this.request('/v1/exchange/market/tickers', {}, 'GET');
  }

  async getTrades(currencyPair: string): Promise<any> {
    return await this.request(`/v1/exchange/market/trades/${currencyPair}`, {}, 'GET');
  }
}

export default Personal;
