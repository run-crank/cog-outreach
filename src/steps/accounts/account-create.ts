import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';
import * as moment from 'moment';
export class AccountCreateStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Create an Outreach Account';
  protected stepExpression: string = 'create an outreach account';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected expectedFields: Field[] = [{
    field: 'account',
    type: FieldDefinition.Type.MAP,
    description: 'A map of field names to field values',
  }];
  protected expectedRecords: ExpectedRecord[] = [{
    id: 'account',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'Id',
      type: FieldDefinition.Type.STRING,
      description: "Account's Outreach ID",
    }],
    dynamicFields: false,
  }];

  private dateTimeFields = [
    'foundedAt',
  ]

  async executeStep(step: Step): Promise<RunStepResponse> {
    const stepData: any = step.getData().toJavaScript();
    let account: any = stepData.account;

    try {
      account = this.validateObject(account);
      const result = await this.client.createAccount(account);
      const record = this.keyValue('account', 'Created Account', { Id: result.data.id });
      return this.pass('Successfully created Account with ID %s', [result.data.id], [record]);
    } catch (e) {
      return this.error('There was a problem creating the Account: %s', [e.toString()]);
    }
  }

  validateObject(account): any {
    Object.keys(account).forEach(key => {
      if (this.dateTimeFields.includes(key)) {
        account[key] = this.formatDate(account[key]);
      }
    });
    return account;
  }

  formatDate(date: string): string {
    return moment(date).format('YYYY-MM-DD');
  }

}

export { AccountCreateStep as Step };
