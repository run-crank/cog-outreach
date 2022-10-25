import { ClientWrapper } from '../client/client-wrapper';
import { promisify } from 'util';
class CachingClientWrapper {
  // cachePrefix is scoped to the specific scenario, request, and requestor
  public cachePrefix = `${this.idMap.scenarioId}${this.idMap.requestorId}${this.idMap.connectionId}`;

  constructor(private client: ClientWrapper, public redisClient: any, public idMap: any) {
    this.redisClient = redisClient;
    this.idMap = idMap;
  }

  // account-aware methods
  // -------------------------------------------------------------------

  public async getAccountById(id: string) {
    const cachekey = `Outreach|Account|${id}|${this.cachePrefix}`;
    const stored = await this.getCache(cachekey);
    if (stored) {
      return stored;
    } else {
      const accounts = await this.client.getAccountById(id);
      if (accounts) {
        await this.setCache(cachekey, accounts);
      }
      return accounts;
    }
  }

  public async getAccountsByIdentifier(idField: string, identifier: string) {
    const cachekey = `Outreach|Account|${idField}|${identifier}|${this.cachePrefix}`;
    const stored = await this.getCache(cachekey);
    if (stored) {
      return stored;
    } else {
      const accounts = await this.client.getAccountsByIdentifier(idField, identifier);
      if (accounts) {
        await this.setCache(cachekey, accounts);
      }
      return accounts;
    }
  }

  public async createAccount(account: Record<string, any>, relationship: Record<string, any> = null) {
    await this.clearCache();
    return await this.client.createAccount(account, relationship);
  }

  public async updateAccount(id: string, account: Record<string, any>, relationship: Record<string, any> = null) {
    await this.clearCache();
    return await this.client.updateAccount(id, account, relationship);
  }

  public async deleteAccountById(id: string) {
    await this.clearCache();
    return await this.client.deleteAccountById(id);
  }

  // prospect-aware methods
  // -------------------------------------------------------------------

  public async getProspectByEmail(email: string) {
    const cachekey = `Outreach|Prospect|${email}|${this.cachePrefix}`;
    const stored = await this.getCache(cachekey);
    if (stored) {
      return stored;
    } else {
      const prospects = await this.client.getProspectByEmail(email);
      if (prospects) {
        await this.setCache(cachekey, prospects);
      }
      return prospects;
    }
  }

  public async createProspect(prospect: Record<string, any>, relationship: Record<string, any> = null) {
    await this.clearCache();
    return await this.client.createProspect(prospect, relationship);
  }

  public async updateProspect(id: string, prospect: Record<string, any>, relationship: Record<string, any> = null) {
    await this.clearCache();
    return await this.client.updateProspect(id, prospect, relationship);
  }

  public async deleteProspectById(id: string) {
    await this.clearCache();
    return await this.client.deleteProspectById(id);
  }

  // Redis methods for get, set, and delete
  // -------------------------------------------------------------------

  // Async getter/setter
  public getAsync = promisify(this.redisClient.get).bind(this.redisClient);
  public setAsync = promisify(this.redisClient.setex).bind(this.redisClient);
  public delAsync = promisify(this.redisClient.del).bind(this.redisClient);

  public async getCache(key: string) {
    try {
      const stored = await this.getAsync(key);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (err) {
      console.log(err);
    }
  }

  public async setCache(key: string, value: any) {
    try {
      // arrOfKeys will store an array of all cache keys used in this scenario run, so it can be cleared easily
      const arrOfKeys = await this.getCache(`cachekeys|${this.cachePrefix}`) || [];
      arrOfKeys.push(key);
      await this.setAsync(key, 55, JSON.stringify(value));
      await this.setAsync(`cachekeys|${this.cachePrefix}`, 55, JSON.stringify(arrOfKeys));
    } catch (err) {
      console.log(err);
    }
  }

  public async clearCache() {
    try {
      // clears all the cachekeys used in this scenario run
      const keysToDelete = await this.getCache(`cachekeys|${this.cachePrefix}`) || [];
      if (keysToDelete.length) {
        keysToDelete.forEach(async (key: string) => await this.delAsync(key));
      }
      await this.setAsync(`cachekeys|${this.cachePrefix}`, 55, '[]');
    } catch (err) {
      console.log(err);
    }
  }

}

export { CachingClientWrapper as CachingClientWrapper };
