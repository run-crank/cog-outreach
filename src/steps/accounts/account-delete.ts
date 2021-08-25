import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';

export class AccountDeleteStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Delete a Outreach Account';
  protected stepExpression: string = 'delete the outreach account with (?<field>[a-zA-Z0-9_]+) (?<identifier>.+)';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected expectedFields: Field[] = [{
    field: 'id',
    type: FieldDefinition.Type.STRING,
    description: 'Account\'s Id',
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

    try {
      const result = await this.client.deleteAccountById(stepData.id);
      const record = this.keyValue('account', 'Deleted Account', { Id: result.id });
      return this.pass('Successfully deleted Account with %s %s', [stepData.field, stepData.identifier], [record]);
    } catch (e) {
      return this.error('There was a problem deleting the Account: %s', [e.toString()]);
    }
  }

}

export { AccountDeleteStep as Step };
