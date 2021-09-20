import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';

export class ProspectDeleteStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Delete an Outreach Prospect';
  protected stepExpression: string = 'delete the outreach prospect with email (?<email>.+)';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected expectedFields: Field[] = [{
    field: 'email',
    type: FieldDefinition.Type.EMAIL,
    description: "Prospect's Email",
  }];
  protected expectedRecords: ExpectedRecord[] = [{
    id: 'prospect',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'Id',
      type: FieldDefinition.Type.STRING,
      description: "Prospect's Outreach ID",
    }],
    dynamicFields: false,
  }];

  async executeStep(step: Step): Promise<RunStepResponse> {
    const stepData: any = step.getData().toJavaScript();

    try {
      const existingProspect = await this.client.getProspectByEmail(stepData.email);
      if (existingProspect == undefined || existingProspect == null) {
        return this.fail('No Account was found with email %s', [stepData.email]);
      }

      await this.client.deleteProspectById(existingProspect.id);
      const record = this.keyValue('prospect', 'Deleted Prospect', { Id: existingProspect.id });
      return this.pass('Successfully deleted Prospect with Id %s', [existingProspect.id], [record]);
    } catch (e) {
      return this.error('There was a problem deleting the Prospect: %s', [e.toString()]);
    }
  }

}

export { ProspectDeleteStep as Step };
