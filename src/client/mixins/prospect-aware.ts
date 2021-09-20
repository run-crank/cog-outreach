
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

  public async getProspectByEmail(email: string): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        // const response = await this.client.get(`/prospects/${id}`);
        const response = await this.client.get(`/prospects?filter[emails]=${email}`);
        resolve(response.data.data[0]);
      } catch (e) {
        if (e.response.data) {
          reject(e.response.data.errors.map(error => error.detail).join(', '));
        } else {
          reject(e);
        }
      }
    });
  }

  public async createProspect(prospect: Record<string, any>, relationship: Record<string, any> = null): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const requestBody = {
          data: {
            type: 'prospect',
            attributes: prospect,
          },
        };

        if (relationship) {
          requestBody.data['relationships'] = relationship;
        }

        const response = await this.client.post('/prospects', requestBody);
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

  public async updateProspect(id: string, prospect: Record<string, any>, relationship: Record<string, any> = null): Promise<Record<string, any>> {
    await this.clientReady;
    return new Promise(async (resolve, reject) => {
      try {
        const requestBody = {
          data: {
            type: 'prospect',
            id: +id,
            attributes: prospect,
          },
        };

        if (relationship) {
          requestBody.data['relationships'] = relationship;
        }

        const response = await this.client.patch(`/prospects/${id}`, requestBody);
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
