import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

// tslint:disable-next-line:max-line-length
import { Step as ProtoStep, StepDefinition, FieldDefinition, RunStepResponse } from '../../../src/proto/cog_pb';
import { Step } from '../../../src/steps/prospects/prospect-update';

chai.use(sinonChai);

describe('ProspectUpdateStep', () => {
  const expect = chai.expect;
  let protoStep: ProtoStep;
  let stepUnderTest: Step;
  let clientWrapperStub: any = {};

  beforeEach(() => {
    clientWrapperStub = sinon.stub();
    clientWrapperStub.updateProspect = sinon.stub();
    clientWrapperStub.getProspectByEmail = sinon.stub();
    stepUnderTest = new Step(clientWrapperStub);
    protoStep = new ProtoStep();
  });

  it('should return expected step metadata', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    expect(stepDef.getStepId()).to.equal('ProspectUpdateStep');
    expect(stepDef.getName()).to.equal('Update an Outreach Prospect');
    expect(stepDef.getExpression()).to.equal('update an outreach prospect');
    expect(stepDef.getType()).to.equal(StepDefinition.Type.ACTION);
  });

  it('should return expected step fields', () => {
    const stepDef: StepDefinition = stepUnderTest.getDefinition();
    const fields: any[] = stepDef.getExpectedFieldsList().map((field: FieldDefinition) => {
      return field.toObject();
    });

    const email: any = fields.filter(f => f.key === 'email')[0];
    expect(email.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(email.type).to.equal(FieldDefinition.Type.EMAIL);

    // Prospect field
    const prospect: any = fields.filter(f => f.key === 'prospect')[0];
    expect(prospect.optionality).to.equal(FieldDefinition.Optionality.REQUIRED);
    expect(prospect.type).to.equal(FieldDefinition.Type.MAP);
  });

  it('should respond with pass if prospect is updated.', async () => {
    // Stub a response that matches expectations.
    const sampleProspect = {
      email: 'anyField',
      prospect: {
        Name: 'sampleName',
        id: 'sampleId',
      },
    };
    const expectedResponse = {
      id: sampleProspect.prospect.id,
    };
    // Set step data corresponding to expectations
    clientWrapperStub.getProspectByEmail.resolves(sampleProspect.prospect);
    clientWrapperStub.updateProspect.resolves(expectedResponse);
    protoStep.setData(Struct.fromJavaScript(sampleProspect));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(clientWrapperStub.updateProspect).to.have.been.calledWith(sampleProspect.prospect.id, sampleProspect.prospect, {});
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.PASSED);
  });

  it('should respond with error if create method returns an error.', async () => {
    // Stub a response that matches expectations.
    const expectedError: Error = new Error('Any Error');
    clientWrapperStub.getProspectByEmail.rejects(expectedError);

    // Set step data corresponding to expectations
    const expectedProspect: any = [
      {
        Name: 'sampleName',
        d: 'sampleId',
      },
    ];
    protoStep.setData(Struct.fromJavaScript(expectedProspect));

    const response: RunStepResponse = await stepUnderTest.executeStep(protoStep);
    expect(response.getOutcome()).to.equal(RunStepResponse.Outcome.ERROR);
  });

});
