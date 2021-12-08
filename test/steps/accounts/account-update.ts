import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

// tslint:disable-next-line:max-line-length
import { Step as ProtoStep, StepDefinition, FieldDefinition, RunStepResponse } from '../../../src/proto/cog_pb';
import { Step } from '../../../src/steps/accounts/account-update';

chai.use(sinonChai);

describe('AccountUpdateStep', () => {
  const expect = chai.expect;
  let protoStep: ProtoStep;
  let stepUnderTest: Step;
  let clientWrapperStub: any = {};

  beforeEach(() => {
    clientWrapperStub = sinon.stub();
    clientWrapperStub.updateAccount = sinon.stub();
    clientWrapperStub.getAccountsByIdentifier = sinon.stub();
    stepUnderTest = new Step(clientWrapperStub);
    protoStep = new ProtoStep();
  });

  it('should return expected step metadata', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    expect(stepDef.getStepId()).to.equal('AccountUpdateStep');
    expect(stepDef.getName()).to.equal('Update an Outreach Account');
    expect(stepDef.getExpression()).to.equal('update an outreach account');
    expect(stepDef.getType()).to.equal(StepDefinition.Type.ACTION);
  });

  it('should return expected step fields', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    const fields: any[] = stepDef.getExpectedFieldsList().map((field: FieldDefinition) => {
      return field.toObject();
    });

    const idField: any = fields.filter(f => f.key === 'idField')[0];
    expect(idField.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(idField.type).to.equal(FieldDefinition.Type.STRING);

    const identifier: any = fields.filter(f => f.key === 'identifier')[0];
    expect(identifier.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(identifier.type).to.equal(FieldDefinition.Type.ANYSCALAR);

    // Account field
    const account: any = fields.filter(f => f.key === 'account')[0];
    expect(account.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(account.type).to.equal(FieldDefinition.Type.MAP);
  });

  it('should respond with pass if account is updated.', async () => {
    // Stub a response that matches expectations.
    const sampleAccount = {
      idField: 'anyField',
      identifier: 'anyValue',
      account: {
        Name: 'sampleName',
        id: 'sampleId',
      },
    };
    const expectedResponse = {
      id: sampleAccount.account.id,
    };
    // Set step data corresponding to expectations
    clientWrapperStub.getAccountsByIdentifier.resolves([sampleAccount.account]);
    clientWrapperStub.updateAccount.resolves(expectedResponse);
    protoStep.setData(Struct.fromJavaScript(sampleAccount));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(clientWrapperStub.updateAccount).to.have.been.calledWith(sampleAccount.account.id, sampleAccount.account, {});
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.PASSED);
  });

  it('should respond with error if create method returns an error.', async () => {
    // Stub a response that matches expectations.
    const expectedError: Error = new Error('Any Error');
    clientWrapperStub.getAccountsByIdentifier.rejects(expectedError);

    // Set step data corresponding to expectations
    const expectedAccount: any = [
      {
        Name: 'sampleName',
        d: 'sampleId',
      },
    ];
    protoStep.setData(Struct.fromJavaScript(expectedAccount));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
  });

});
