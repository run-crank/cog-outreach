import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

import { Step as ProtoStep, StepDefinition, FieldDefinition, RunStepResponse, RecordDefinition, StepRecord } from '../../../src/proto/cog_pb';
import { Step } from '../../../src/steps/accounts/account-field-equals';

chai.use(sinonChai);

describe('AccountFieldEqualsStep', () => {
  const expect = chai.expect;
  let protoStep: ProtoStep;
  let stepUnderTest: Step;
  let apiClientStub: any;

  beforeEach(() => {
    // An example of how you can stub/mock API client methods.
    apiClientStub = sinon.stub();
    apiClientStub.getAccountById = sinon.stub();
    apiClientStub.getAccountsByIdentifier = sinon.stub();
    stepUnderTest = new Step(apiClientStub);
    protoStep = new ProtoStep();
  });

  it('should return expected step metadata', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    expect(stepDef.getStepId()).to.equal('AccountFieldEqualsStep');
    expect(stepDef.getName()).to.equal('Check a field on an Outreach account');
    expect(stepDef.getExpression()).to.equal('the (?<field>[a-zA-Z0-9_-]+) field on outreach account with (?<idField>[a-zA-Z0-9_-]+) (?<identifier>.+) should (?<operator>be set|not be set|be less than|be greater than|be one of|be|contain|not be one of|not be|not contain|match|not match) ?(?<expectation>.+)?');
    expect(stepDef.getType()).to.equal(StepDefinition.Type.VALIDATION);
  });

  it('should return expected step fields', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    const fields: any[] = stepDef.getExpectedFieldsList().map((field: FieldDefinition) => {
      return field.toObject();
    });

    // idField field
    const idField: any = fields.filter(f => f.key === 'idField')[0];
    expect(idField.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(idField.type).to.equal(FieldDefinition.Type.STRING);

    // idField field
    const identifier: any = fields.filter(f => f.key === 'identifier')[0];
    expect(identifier.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(identifier.type).to.equal(FieldDefinition.Type.ANYSCALAR);

    // Field field
    const field: any = fields.filter(f => f.key === 'field')[0];
    expect(field.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(field.type).to.equal(FieldDefinition.Type.STRING);

    // Field field
    const operator: any = fields.filter(f => f.key === 'operator')[0];
    expect(operator.optionality).to.equal(FieldDefinition.Optionality.OPTIONAL);
    expect(operator.type).to.equal(FieldDefinition.Type.STRING);

    // Expected Value field
    const expectation: any = fields.filter(f => f.key === 'expectation')[0];
    expect(expectation.optionality).to.equal(FieldDefinition.Optionality.OPTIONAL);
    expect(expectation.type).to.equal(FieldDefinition.Type.ANYSCALAR);
  });

  it('should respond with pass if API client resolves expected data', async () => {
    // Stub a response that matches expectations.
    const expectedAccount: any = { id: 'someId', attributes: { someField: 'Expected Value' }, relationships: { someRelationshipField: { data: 'someData' } } };
    apiClientStub.getAccountsByIdentifier.resolves([expectedAccount])

    // Set step data corresponding to expectations
    protoStep.setData(Struct.fromJavaScript({
      idField: 'someIdField',
      identifier: 'someId',
      field: 'someField',
      expectation: expectedAccount.attributes.someField,
      operator: 'be',
    }));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    const records: StepRecord[] = response.getRecordsList();
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.PASSED);
  });

  it('should respond with fail if API client resolves unexpected data', async () => {
    // Stub a response that does not match expectations.
    const expectedAccount: any = { id: 'someId', attributes: { someField: 'Expected Value' }, relationships: { someRelationshipField: { data: 'someData' } } };
    apiClientStub.getAccountsByIdentifier.resolves([expectedAccount])

    // Set step data corresponding to expectations
    protoStep.setData(Struct.fromJavaScript({
      idField: 'someIdField',
      identifier: 'someId',
      field: 'someField',
      expectation: 'Not expected',
      operator: 'be',
    }));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.FAILED);
  });

  it('should respond with error if API client resolves no results', async () => {
    // Stub a response with no results in the body.
    apiClientStub.getAccountsByIdentifier.resolves([])
    protoStep.setData(Struct.fromJavaScript({
      idField: 'someIdField',
      identifier: 'someId',
      field: 'someField',
      expectation: 'someValue',
      operator: 'be',
    }));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.FAILED);
  });

  it('should respond with error if resolved account does not contain given field', async () => {
    // Stub a response with valid response, but no expected field.
    const expectedAccount: any = { id: 'someId', attributes: { someField: 'Expected Value' }, relationships: { someRelationshipField: { data: 'someData' } } };
    apiClientStub.getAccountsByIdentifier.resolves([expectedAccount])
    protoStep.setData(Struct.fromJavaScript({
      idField: 'someIdField',
      identifier: 'someId',
      field: 'anotherField',
      expectation: expectedAccount.attributes.someField,
      operator: 'be',
    }));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    const records: StepRecord[] = response.getRecordsList();
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.FAILED);
  });

  it('should respond with error if API client throws error', async () => {
    // Stub a response that throws any exception.
    apiClientStub.getAccountsByIdentifier.throws();
    protoStep.setData(Struct.fromJavaScript({
      operator: 'be',
    }));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
  });

  it('should respond with error if expectedValue was not provided and operator is not either "be set" or "not be set"', async () => {
    const expectedProspect: any = { id: 'someId', attributes: { someField: 'Expected Value' }, relationships: { someRelationshipField: { data: 'someData' } } };
    apiClientStub.getAccountsByIdentifier.resolves([expectedProspect]);
    protoStep.setData(Struct.fromJavaScript({
      idField: 'someIdField',
      identifier: 'someId',
      field: 'someField',
      operator: 'be',
    }));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.FAILED);
  });
});
