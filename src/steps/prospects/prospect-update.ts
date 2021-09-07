import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';
import * as moment from 'moment';

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

  private dateFields = [
    'graduationDate',
    'jobStartDate',
  ];
  private dateTimeFields = [
    'trashedAt',
    'dateOfBirth',
    'availableAt',
  ];

  async executeStep(step: Step): Promise<RunStepResponse> {
    const stepData: any = step.getData().toJavaScript();
    const id: any = stepData.id;
    let prospect: any = stepData.prospect;

    try {
      prospect = this.validateObject(prospect);
      const result = await this.client.updateProspect(id, prospect);
      const record = this.keyValue('prospect', 'Updated Prospect', { Id: result.data.id });
      return this.pass('Successfully updated Prospect with ID %s', [result.data.id], [record]);
    } catch (e) {
      return this.error('There was a problem updated the Prospect: %s', [e.toString()]);
    }
  }

  validateObject(account): any {
    Object.keys(account).forEach((key) => {
      if (this.dateTimeFields.includes(key) || this.dateFields.includes(key)) {
        account[key] = this.formatDate(account[key]);
      }
    });
    return account;
  }

  formatDate(date: string): string {
    return moment(date).format('YYYY-MM-DD');
  }

}

export { ProspectUpdateStep as Step };
