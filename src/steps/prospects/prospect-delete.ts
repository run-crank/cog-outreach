import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';

export class ProspectDeleteStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Delete a Outreach Prospect';
  protected stepExpression: string = 'delete the outreach prospect with (?<field>[a-zA-Z0-9_]+) (?<identifier>.+)';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected expectedFields: Field[] = [{
    field: 'id',
    type: FieldDefinition.Type.STRING,
    description: "Prospect's Id",
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
      await this.client.deleteProspectById(stepData.id);
      const record = this.keyValue('prospect', 'Deleted Prospect', { Id: stepData.id });
      return this.pass('Successfully deleted Prospect with Id %s', [stepData.id], [record]);
    } catch (e) {
      return this.error('There was a problem deleting the Prospect: %s', [e.toString()]);
    }
  }

}

export { ProspectDeleteStep as Step };
