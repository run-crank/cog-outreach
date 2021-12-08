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
//       clientStub.post = sinon.stub(),
//       clientStub.patch = sinon.stub(),
//       clientStub.delete = sinon.stub(),
//       clientStub.post.resolves({ data: { access_token: 'anyToken' } })

//     constructorStub = sinon.stub();
//     constructorStub.default = sinon.stub();
//     constructorStub.default.returns(clientStub);
//     constructorStub.default.create = sinon.stub();
//     constructorStub.default.create.returns(clientStub);
//   });

//   describe('constructor', () => {
//     it('should authenticate', () => {
//       metadata = new Metadata();
//       metadata.add('clientId', 'sampleId');
//       metadata.add('clientSecret', 'sampleSecret');
//       metadata.add('redirectUrl', 'sampleUrl');
//       metadata.add('refreshToken', 'sampleToken');

//       clientWrapperUnderTest = new ClientWrapper(metadata, constructorStub);
//       expect(constructorStub.default.create).to.have.been.calledWith({
//         baseURL: 'https://api.outreach.io/api/v2',
//         headers: {
//           Authorization: `Bearer ${'anyToken'}`,
//         },
//       });
//     });
//   });
// });
