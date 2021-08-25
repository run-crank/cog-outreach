
import * as axios from 'axios';

export class AccountAwareMixin {
  client: axios.AxiosInstance;

  public async getAllAccount(): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.get('/accounts');
        resolve(response.data);
      } catch (e) {
        reject(e);
      }
    });
  }

  public async getAccountById(id: string): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.get(`/accounts/${id}`);
        resolve(response.data);
      } catch (e) {
        reject(e);
      }
    });
  }

  public async createAccount(account: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.post('/accounts', {
          data: {
            type: 'account',
            attributes: account,
          },
        });
        resolve(response.data);
      } catch (e) {
        reject(e);
      }
    });
  }

  public async deleteAccountById(id: string): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.delete(`/accounts/${id}`);
        resolve(response.data);
      } catch (e) {
        reject(e);
      }
    });
  }
}
