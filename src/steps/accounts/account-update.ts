import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';
import * as moment from 'moment';
import { titleCase } from 'title-case';

export class AccountUpdateStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Update an Outreach account';
  protected stepExpression: string = 'update an outreach account';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected actionList: string[] = ['update'];
  protected targetObject: string = 'Account';
  protected expectedFields: Field[] = [{
    field: 'idField',
    type: FieldDefinition.Type.STRING,
    description: 'The field used to search/identify the account',
  }, {
    field: 'identifier',
    type: FieldDefinition.Type.ANYSCALAR,
    description: 'The value of the id field to use when searching',
  }, {
    field: 'account',
    type: FieldDefinition.Type.MAP,
    description: 'A map of field names to field values',
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

  private dateTimeFields = [
    'foundedAt',
  ];

  private listFields = [
    'tags',
  ];

  private relationshipFields = [
    'owner',
  ];

  private relationshipMap = {
    owner: 'user',
  };

  private relationship = {};

  async executeStep(step: Step): Promise<RunStepResponse> {
    const stepData: any = step.getData().toJavaScript();
    const idField = stepData.idField;
    const identifier = stepData.identifier;
    let account: any = stepData.account;

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

      account = this.validateObject(account);
      const result = await this.client.updateAccount(accounts[0].id, account, this.relationship);
      const record = this.createRecord(result);
      const orderedRecord = this.createOrderedRecord(result, stepData['__stepOrder']);
      return this.pass('Successfully updated Account with %s %s', [idField, identifier], [record, orderedRecord]);
    } catch (e) {
      return this.error('There was a problem updating the Account: %s', [e.toString()]);
    }
  }

  validateObject(account): any {
    Object.keys(account).forEach((key) => {
      if (this.dateTimeFields.includes(key)) {
        account[key] = this.formatDate(account[key]);
      } else if (this.listFields.includes(key)) {
        account[key] = this.formatList(account[key]);
      } else if (this.relationshipFields.includes(key)) {
        this.setRelationships(key, account);
        delete account[key];
      }
    });
    return account;
  }

  formatDate(date: string): string {
    return moment(date).format('YYYY-MM-DD');
  }

  formatList(list: string): string[] {
    return list.replace(' ', '').split(',');
  }

  setRelationships(key: string, account): void {
    const relationshipType = this.relationshipMap[key] || key;
    this.relationship[key] = {
      data: {
        type: relationshipType,
        id: account[key],
      },
    };
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

  public createRecord(account): StepRecord {
    return this.keyValue('account', 'Updated Account', { id: account.id });
  }

  public createOrderedRecord(account, stepOrder = 1): StepRecord {
    return this.keyValue(`account.${stepOrder}`, `Updated Account from Step ${stepOrder}`, { id: account.id });
  }
}

export { AccountUpdateStep as Step };
