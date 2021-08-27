
import * as axios from 'axios';

export class ProspectAwareMixin {
  client: axios.AxiosInstance;
  public clientReady: Promise<boolean>;

  public async getAllProspect(): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.get('/prospects');
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

  public async getProspectById(id: string): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.get(`/prospects/${id}`);
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

  public async createProspect(prospect: Record<string, any>): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.post('/prospects', {
          data: {
            type: 'prospect',
            attributes: prospect,
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

  public async deleteProspectById(id: string): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.client.delete(`/prospects/${id}`);
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
