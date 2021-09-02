
import * as axios from 'axios';

export class AccountAwareMixin {
  client: axios.AxiosInstance;
  public clientReady: Promise<boolean>;

  public async getAllAccount(): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.get('/accounts');
        resolve(response.data);
      } catch (e) {
        if (e.response.data) {
          reject(e.response.data.errors.map(error => error.detail).join(', '));
        } else {
          reject(e);
        }
      }
    });
  }

  public async getAccountById(id: string): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.get(`/accounts/${id}`);
        resolve(response.data);
      } catch (e) {
        if (e.response.data) {
          reject(e.response.data.errors.map(error => error.detail).join(', '));
        } else {
          reject(e);
        }
      }
    });
  }

  public async createAccount(account: Record<string, any>): Promise<Record<string, any>> {
    await this.clientReady;
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
        if (e.response.data) {
          reject(e.response.data.errors.map(error => error.detail).join(', '));
        } else {
          reject(e);
        }
      }
    });
  }

  public async updateAccount(id: string, account: Record<string, any>): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.patch(`/accounts/${id}`, {
          data: {
            id,
            type: 'account',
            attributes: account,
          },
        });
        resolve(response.data);
      } catch (e) {
        if (e.response.data) {
          reject(e.response.data.errors.map(error => error.detail).join(', '));
        } else {
          reject(e);
        }
      }
    });
  }

  public async deleteAccountById(id: string): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.delete(`/accounts/${id}`);
        resolve(response.data);
      } catch (e) {
        if (e.response.data) {
          reject(e.response.data.errors.map(error => error.detail).join(', '));
        } else {
          reject(e);
        }
      }
    });
  }
}
