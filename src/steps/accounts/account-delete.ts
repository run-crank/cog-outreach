import { titleCase } from 'title-case';
import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';

export class AccountDeleteStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Delete an Outreach account';
  protected stepExpression: string = 'delete the outreach account with (?<idField>[a-zA-Z0-9_]+) (?<identifier>.+)';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected actionList: string[] = ['delete'];
  protected targetObject: string = 'Account';
  protected expectedFields: Field[] = [{
    field: 'idField',
    type: FieldDefinition.Type.STRING,
    description: 'The field used to search/identify the account',
  }, {
    field: 'identifier',
    type: FieldDefinition.Type.ANYSCALAR,
    description: 'The value of the id field to use when searching',
  }];
  protected expectedRecords: ExpectedRecord[] = [{
    id: 'account',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'id',
      type: FieldDefinition.Type.STRING,
      description: "Account's Outreach ID",
    }],
    dynamicFields: false,
  }];

  async executeStep(step: Step): Promise<RunStepResponse> {
    const stepData: any = step.getData().toJavaScript();
    const idField = stepData.idField;
    const identifier = stepData.identifier;

    try {
      let accounts = [];
      if (idField === 'id') {
        const idAccount = await this.client.getAccountById(identifier);
        accounts.push(idAccount);
      } else {
        accounts = await this.client.getAccountsByIdentifier(idField, identifier);
      }

      if (accounts.length === 0) {
        // If the client does not return an account, return an error.
        return this.fail('No Account was found with %s %s', [idField, identifier]);
      } else if (accounts.length > 1) {
        // If the client returns more than one account, return an error.
        return this.fail('More than one account matches %s %s', [idField, identifier], [this.createRecords(accounts)]);
      }

      await this.client.deleteAccountById(accounts[0].id);
      const record = this.keyValue('account', 'Deleted Account', { id: accounts[0].id });
      return this.pass('Successfully deleted Account with %s %s', [idField, identifier], [record]);
    } catch (e) {
      return this.error('There was a problem deleting the Account: %s', [e.toString()]);
    }
  }

  createRecords(accounts: Record<string, any>[]) {
    const records = [];
    accounts.forEach((account) => {
      delete account.relationships;
      account.attributes['id'] = account.id;
      records.push(account.attributes);
    });
    const headers = {};
    headers['id'] = 'Id';
    Object.keys(accounts[0].attributes).forEach(key => headers[key] = titleCase(key));
    return this.table('matchedAccounts', 'Matched Accounts', headers, records);
  }

}

export { AccountDeleteStep as Step };
