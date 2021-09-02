import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';

export class ProspectCreateStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Create an Outreach Prospect';
  protected stepExpression: string = 'create an outreach prospect';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected expectedFields: Field[] = [{
    field: 'prospect',
    type: FieldDefinition.Type.MAP,
    description: 'A map of field names to field values',
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
    const prospect: any = stepData.prospect;

    try {
      const result = await this.client.createProspect(prospect);
      const record = this.keyValue('prospect', 'Created Prospect', { Id: result.data.id });
      return this.pass('Successfully created Prospect with ID %s', [result.data.id], [record]);
    } catch (e) {
      return this.error('There was a problem creating the Prospect: %s', [e.toString()]);
    }
  }

}

export { ProspectCreateStep as Step };
