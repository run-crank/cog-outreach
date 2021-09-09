// import * as chai from 'chai';
// import { default as sinon } from 'ts-sinon';
// import * as sinonChai from 'sinon-chai';
// import 'mocha';

// import { Metadata } from 'grpc';
// import { ClientWrapper } from '../../src/client/client-wrapper';

// chai.use(sinonChai);

// describe('ClientWrapper', () => {
//   const expect = chai.expect;
//   let clientStub: any;
//   let constructorStub: any;
//   let metadata: Metadata;
//   let clientWrapperUnderTest: ClientWrapper;

//   beforeEach(() => {
//     clientStub = sinon.stub();
//     clientStub.get = sinon.stub(),
//     clientStub.post = sinon.stub(),
//     clientStub.patch = sinon.stub(),
//     clientStub.delete = sinon.stub(),
    
//     constructorStub = sinon.stub();
//     constructorStub.default = sinon.stub();
//     constructorStub.default.returns(clientStub);
//   });

//   describe('constructor', () => {
//     it('should authenticate', () => {
//       metadata = new Metadata();
//       metadata.add('clientId', 'sampleId');
//       metadata.add('clientSecret', 'sampleSecret');
//       metadata.add('redirectUrl', 'sampleUrl');
//       metadata.add('refreshToken', 'sampleToken');

//       clientWrapperUnderTest = new ClientWrapper(metadata, constructorStub);
//       expect(clientStub.post).to.have.been.calledWith('https://api.outreach.io/oauth/token', {
//         client_id: 'sampleId',
//         client_secret: 'sampleSecret',
//         redirect_uri: 'sampleUrl',
//         grant_type: 'refresh_token',
//         refresh_token: 'sampleToken',
//       });
//     });
//   });
// });
