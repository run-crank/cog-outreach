import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

import { Step as ProtoStep, StepDefinition, FieldDefinition, RunStepResponse, RecordDefinition, StepRecord } from '../../../src/proto/cog_pb';
import { Step } from '../../../src/steps/prospects/prospect-discover';

chai.use(sinonChai);

describe('DiscoverProspectStep', () => {
  const expect = chai.expect;
  let protoStep: ProtoStep;
  let stepUnderTest: Step;
  let apiClientStub: any;

  beforeEach(() => {
    // An example of how you can stub/mock API client methods.
    apiClientStub = sinon.stub();
    apiClientStub.getProspectByEmail = sinon.stub();
    stepUnderTest = new Step(apiClientStub);
    protoStep = new ProtoStep();
  });

  it('should return expected step metadata', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    expect(stepDef.getStepId()).to.equal('DiscoverProspect');
    expect(stepDef.getName()).to.equal('Discover fields on an Outreach prospect');
    expect(stepDef.getExpression()).to.equal('discover fields on outreach prospect (?<email>.+)');
    expect(stepDef.getType()).to.equal(StepDefinition.Type.ACTION);
  });

  it('should return expected step fields', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    const fields: any[] = stepDef.getExpectedFieldsList().map((field: FieldDefinition) => {
      return field.toObject();
    });

    // email field
    const email: any = fields.filter(f => f.key === 'email')[0];
    expect(email.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(email.type).to.equal(FieldDefinition.Type.EMAIL);
  });

  it('should respond with pass if prospect is found', async () => {
    // Stub a response that matches expectations.
    const expectedProspect: any = { id: 'someId', attributes: { someField: 'Expected Value' }, relationships: { someRelationshipField: { data: 'someData' } } };
    apiClientStub.getProspectByEmail.resolves(expectedProspect)

    // Set step data corresponding to expectations
    protoStep.setData(Struct.fromJavaScript({
      email: 'anyEmail',
    }));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.PASSED);
  });

  it('should respond with fail if prospect is not found', async () => {
    // Stub a response that does not match expectations.
    const expectedProspect: any = { id: 'someId', attributes: { someField: 'Expected Value' }, relationships: { someRelationshipField: { data: 'someData' } } };
    apiClientStub.getProspectByEmail.resolves(null)

    // Set step data corresponding to expectations
    protoStep.setData(Struct.fromJavaScript({
      email: 'anyEmail',
    }));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.FAILED);
  });

  it('should respond with error if API client throws error', async () => {
    // Stub a response that throws any exception.
    apiClientStub.getProspectByEmail.throws();
    protoStep.setData(Struct.fromJavaScript({
      operator: 'be',
    }));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
  });
});
