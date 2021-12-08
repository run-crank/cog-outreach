import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

import { CachingClientWrapper } from '../../src/client/caching-client-wrapper';

chai.use(sinonChai);

describe('CachingClientWrapper', () => {
  const expect = chai.expect;
  let cachingClientWrapperUnderTest: CachingClientWrapper;
  let clientWrapperStub: any;
  let redisClientStub: any;
  let idMap: any;

  beforeEach(() => {
    clientWrapperStub = {
      getAccountById: sinon.spy(),
      getAccountsByIdentifier: sinon.spy(),
      createAccount: sinon.spy(),
      updateAccount: sinon.spy(),
      deleteAccountById: sinon.spy(),
    };

    redisClientStub = {
      get: sinon.spy(),
      setex: sinon.spy(),
      del: sinon.spy(),
    };

    idMap = {
      requestId: '1',
      scenarioId: '2',
      requestorId: '3',
    };
  });

  it('getAccountById using original function', (done) => {
    const sampleId = 'anyId';
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.getAsync = sinon.stub().returns(false);
    cachingClientWrapperUnderTest.getAccountById(sampleId);
    setTimeout(() => {
      expect(clientWrapperStub.getAccountById).to.have.been.calledWith(sampleId);
      done();
    });
  });

  it('getAccountById using cache', (done) => {
    const sampleId = 'anyId';
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.getAsync = sinon.stub().returns('"expectedCachedValue"');
    let actualCachedValue: string;
    (async () => {
      actualCachedValue = await cachingClientWrapperUnderTest.getAccountById(sampleId);
    })();

    setTimeout(() => {
      expect(clientWrapperStub.getAccountById).to.not.have.been.called;
      expect(actualCachedValue).to.equal('expectedCachedValue');
      done();
    });
  });

  it('getAccountsByIdentifier using original function', (done) => {
    const idField = 'anyField';
    const identifier = 'anyValue';
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.getAsync = sinon.stub().returns(false);
    cachingClientWrapperUnderTest.getAccountsByIdentifier(idField, identifier);

    setTimeout(() => {
      expect(clientWrapperStub.getAccountsByIdentifier).to.have.been.calledWith(idField, identifier);
      done();
    });
  });

  it('getAccountsByIdentifier using cache', (done) => {
    const idField = 'anyField';
    const identifier = 'anyValue';
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.getAsync = sinon.stub().returns('"expectedCachedValue"');
    let actualCachedValue: string;
    (async () => {
      actualCachedValue = await cachingClientWrapperUnderTest.getAccountsByIdentifier(idField, identifier);
    })();

    setTimeout(() => {
      expect(clientWrapperStub.getAccountsByIdentifier).to.not.have.been.called;
      expect(actualCachedValue).to.equal('expectedCachedValue');
      done();
    });
  });

  it('createAccount using original function', (done) => {
    const account = { field: 'value'};
    const relationship = { field: 'value'};
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.clearCache = sinon.spy();
    cachingClientWrapperUnderTest.createAccount(account, relationship);

    setTimeout(() => {
      expect(cachingClientWrapperUnderTest.clearCache).to.have.been.called;
      expect(clientWrapperStub.createAccount).to.have.been.calledWith(account, relationship);
      done();
    });
  });

  it('updateAccount using original function', (done) => {
    const id = 'anyId';
    const account = { field: 'value'};
    const relationship = { field: 'value'};
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.clearCache = sinon.spy();
    cachingClientWrapperUnderTest.updateAccount(id, account, relationship);

    setTimeout(() => {
      expect(cachingClientWrapperUnderTest.clearCache).to.have.been.called;
      expect(clientWrapperStub.updateAccount).to.have.been.calledWith(id, account, relationship);
      done();
    });
  });

  it('deleteAccountById using original function', (done) => {
    const id = 'anyId';
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.clearCache = sinon.spy();
    cachingClientWrapperUnderTest.deleteAccountById(id);

    setTimeout(() => {
      expect(clientWrapperStub.deleteAccountById).to.have.been.called;
      done();
    });
  });

  it('getCache', (done) => {
    redisClientStub.get = sinon.stub().yields();
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.getCache('expectedKey');

    setTimeout(() => {
      expect(redisClientStub.get).to.have.been.calledWith('expectedKey');
      done();
    });
  });

  it('setCache', (done) => {
    redisClientStub.setex = sinon.stub().yields(); 
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.getCache = sinon.stub().returns(null);
    cachingClientWrapperUnderTest.cachePrefix = 'testPrefix';
    cachingClientWrapperUnderTest.setCache('expectedKey', 'expectedValue');

    setTimeout(() => {
      expect(redisClientStub.setex).to.have.been.calledWith('expectedKey', 55, '"expectedValue"');
      expect(redisClientStub.setex).to.have.been.calledWith('cachekeys|testPrefix', 55, '["expectedKey"]');
      done();
    });
  });

  it('clearCache', (done) => {
    redisClientStub.del = sinon.stub().yields();
    cachingClientWrapperUnderTest = new CachingClientWrapper(clientWrapperStub, redisClientStub, idMap);
    cachingClientWrapperUnderTest.cachePrefix = 'testPrefix';
    cachingClientWrapperUnderTest.getCache = sinon.stub().returns(['testKey1', 'testKey2'])
    cachingClientWrapperUnderTest.clearCache();

    setTimeout(() => {
      expect(redisClientStub.del).to.have.been.calledWith('testKey1');
      expect(redisClientStub.del).to.have.been.calledWith('testKey2');
      expect(redisClientStub.setex).to.have.been.calledWith('cachekeys|testPrefix');
      done();
    });
  });
});
