import * as grpc from 'grpc';
import * as axios from 'axios';
import { Field } from '../core/base-step';
import { AccountAwareMixin } from './mixins';

/**
 * This is a wrapper class around the API client for your Cog. An instance of
 * this class is passed to the constructor of each of your steps, and can be
 * accessed on each step as this.client.
 */
class ClientWrapper {

  /**
   * This is an array of field definitions, each corresponding to a field that
   * your API client requires for authentication. Depending on the underlying
   * system, this could include bearer tokens, basic auth details, endpoints,
   * etc.
   *
   * If your Cog does not require authentication, set this to an empty array.
   */
  public static expectedAuthFields: Field[] = [];
  public client: axios.AxiosInstance;
  public retry: any;
  public clientReady: Promise<boolean>;
  public authUrl = 'https://api.outreach.io/oauth/token';

  constructor(auth: grpc.Metadata, clientConstructor = axios) {
    this.client = clientConstructor.default;
    const delaySeconds = 10;
    this.clientReady = new Promise((resolve, reject) => {
      // Add a delay before requesting a new token since
      // Outreach only allows token generations supposedly every 60 seconds
      // but postman tests seems to allow to get every 10 seconds
      setTimeout(() => {
        if (auth.get('refreshToken').toString()) {
          this.client.post(`${this.authUrl}?`, {
            client_id: auth.get('clientId').toString(),
            client_secret: auth.get('clientSecret').toString(),
            redirect_uri: auth.get('redirectUrl').toString(),
            grant_type: 'refresh_token',
            refresh_token: auth.get('refreshToken').toString(),
          }).then((res: any) => {
            this.client = axios.default.create({
              baseURL: 'https://api.outreach.io/api/v2',
              headers: {
                Authorization: res.access_token,
              },
            });
            resolve(true);
          });
        }
      }, delaySeconds * 1000);
    });
  }

}

interface ClientWrapper extends AccountAwareMixin { }
applyMixins(ClientWrapper, [AccountAwareMixin]);

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      // tslint:disable-next-line:max-line-length
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}

export { ClientWrapper as ClientWrapper };
