import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';

export class ProspectUpdateStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Update an Outreach Prospect';
  protected stepExpression: string = 'update an outreach prospect';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected expectedFields: Field[] = [{
    field: 'id',
    type: FieldDefinition.Type.STRING,
    description: "Prospect's Id",
  }, {
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
    const id: any = stepData.id;

    try {
      const result = await this.client.updateProspect(id, prospect);
      const record = this.keyValue('prospect', 'Updated Prospect', { Id: result.data.id });
      return this.pass('Successfully updated Prospect with ID %s', [result.data.id], [record]);
    } catch (e) {
      return this.error('There was a problem updated the Prospect: %s', [e.toString()]);
    }
  }

}

export { ProspectUpdateStep as Step };
