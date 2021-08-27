import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';

export class AccountCreateStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Create a Outreach Account';
  protected stepExpression: string = 'create a outreach account';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected expectedFields: Field[] = [{
    field: 'id',
    type: FieldDefinition.Type.STRING,
    description: "Account's Id",
  }, {
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

  async executeStep(step: Step): Promise<RunStepResponse> {
    const stepData: any = step.getData().toJavaScript();
    const account: any = stepData.account;
    const id: any = stepData.id;

    try {
      const result = await this.client.updateAccount(id, account);
      const record = this.keyValue('account', 'Created Account', { Id: result.data.id });
      return this.pass('Successfully created Account with ID %s', [result.data.id], [record]);
    } catch (e) {
      return this.error('There was a problem creating the Account: %s', [e.toString()]);
    }
  }

}

export { AccountCreateStep as Step };
