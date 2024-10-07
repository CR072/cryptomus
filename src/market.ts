import fetch from 'node-fetch';

class Market {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://api.cryptomus.com/v1/exchange/market';
  }

  private async request(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(result) || 'Cryptomus API error');
      }
      return result;
    } catch (error) {
      throw new Error(`Request Error: ${error.message}`);
    }
  }

  async getAssets(): Promise<any> {
    return await this.request('/assets');
  }

  async getOrderBook(data: { currency_pair: string; level: number }): Promise<any> {
    return await this.request(`/order-book/${data.currency_pair}?level=${data.level}`);
  }

  async getTickers(): Promise<any> {
    return await this.request('/tickers');
  }

  async getTrades(currencyPair: string): Promise<any> {
    return await this.request(`/trades/${currencyPair}`);
  }
}

export default Market;
