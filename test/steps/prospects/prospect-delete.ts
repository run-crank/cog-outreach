import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

// tslint:disable-next-line:max-line-length
import { Step as ProtoStep, StepDefinition, FieldDefinition, RunStepResponse } from '../../../src/proto/cog_pb';
import { Step } from '../../../src/steps/prospects/prospect-delete';

chai.use(sinonChai);

describe('ProspectDeleteStep', () => {
  const expect = chai.expect;
  let protoStep: ProtoStep;
  let stepUnderTest: Step;
  let clientWrapperStub: any = {};

  beforeEach(() => {
    clientWrapperStub = sinon.stub();
    clientWrapperStub.getProspectByEmail = sinon.stub();
    clientWrapperStub.deleteProspectById = sinon.stub();
    stepUnderTest = new Step(clientWrapperStub);
    protoStep = new ProtoStep();
  });

  it('should return expected step metadata', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    expect(stepDef.getStepId()).to.equal('ProspectDeleteStep');
    expect(stepDef.getName()).to.equal('Delete an Outreach prospect');
    expect(stepDef.getExpression()).to.equal('delete the outreach prospect with email (?<email>.+)');
    expect(stepDef.getType()).to.equal(StepDefinition.Type.ACTION);
  });

  it('should return expected step fields', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    const fields: any[] = stepDef.getExpectedFieldsList().map((field: FieldDefinition) => {
      return field.toObject();
    });

    // Fields
    const field: any = fields.filter(f => f.key === 'email')[0];
    expect(field.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(field.type).to.equal(FieldDefinition.Type.EMAIL);
  });

  it('should respond with pass if prospect is deleted', async () => {
    // Stub a response that matches expectations.
    const sampleProspect: any = {
      email: 'anyEmail',
      id: 'sampleId',
    };
    clientWrapperStub.getProspectByEmail.resolves(sampleProspect);
    clientWrapperStub.deleteProspectById.resolves(sampleProspect);

    // Set step data corresponding to expectations
    const expectations: any = {
      id: sampleProspect.id,
    };
    protoStep.setData(Struct.fromJavaScript(expectations));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(clientWrapperStub.deleteProspectById).to.have.been.calledWith(expectations.id);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.PASSED);
  });

  it('should respond with error if delete method returns an error.', async () => {
    // Stub a response that matches expectations.
    const error: Error = new Error('Any error');
    clientWrapperStub.getProspectByEmail.rejects(error);

    // Set step data corresponding to expectations
    const expectations: any = {
      email: 'anyField',
    };
    protoStep.setData(Struct.fromJavaScript(expectations));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
  });

});
