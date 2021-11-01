/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';
import * as util from '@run-crank/utilities';
import { baseOperators } from '../../client/constants/operators';
import { titleCase } from 'title-case';

export class AccountFieldEqualsStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Check a field on an Outreach account';
  // tslint:disable-next-line:max-line-length
  protected stepExpression: string = 'the (?<field>[a-zA-Z0-9_-]+) field on outreach account with (?<idField>[a-zA-Z0-9_-]+) (?<identifier>.+) should (?<operator>be set|not be set|be less than|be greater than|be one of|be|contain|not be one of|not be|not contain|match|not match) ?(?<expectation>.+)?';
  protected stepType: StepDefinition.Type = StepDefinition.Type.VALIDATION;
  protected expectedFields: Field[] = [{
    field: 'idField',
    type: FieldDefinition.Type.STRING,
    description: 'The field used to search/identify the account',
  }, {
    field: 'identifier',
    type: FieldDefinition.Type.ANYSCALAR,
    description: 'The value of the id field to use when searching',
  }, {
    field: 'field',
    type: FieldDefinition.Type.STRING,
    description: 'Field name to check',
  }, {
    field: 'operator',
    type: FieldDefinition.Type.STRING,
    optionality: FieldDefinition.Optionality.OPTIONAL,
    description: 'Check Logic (be, not be, contain, not contain, be greater than, be less than, be set, not be set, be one of, or not be one of)',
  },
  {
    field: 'expectation',
    type: FieldDefinition.Type.ANYSCALAR,
    description: 'Expected field value',
    optionality: FieldDefinition.Optionality.OPTIONAL,
  }];

  protected expectedRecords: ExpectedRecord[] = [{
    id: 'account',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'id',
      type: FieldDefinition.Type.STRING,
      description: "Account's Id",
    }, {
      field: 'name',
      type: FieldDefinition.Type.NUMERIC,
      description: 'The Account\'s ID',
    }, {
      field: 'domain',
      type: FieldDefinition.Type.EMAIL,
      description: 'The Account\'s Email',
    }, {
      field: 'createAt',
      type: FieldDefinition.Type.DATETIME,
      description: 'The Account\'s Create Date',
    }, {
      field: 'updatedAt',
      type: FieldDefinition.Type.DATETIME,
      description: 'The Account\'s Last Update Date',
    }],
    dynamicFields: true,
  }];

  private relationshipFields = [
    'owner',
  ];

  private listFields = [
    'tags',
  ];

  async executeStep(step: Step) {
    const stepData: any = step.getData() ? step.getData().toJavaScript() : {};
    const expectation = stepData.expectation;
    const idField = stepData.idField;
    const identifier = stepData.identifier;
    const field = stepData.field;
    const operator = stepData.operator || 'be';

    let actual = null;

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

      // Handle email field check to so be operator can work instead of just include
      // It will automatically pass once a prospect is found
      if (this.listFields.includes(field) && operator.toLowerCase() === 'be') {
        const record = this.createRecord(accounts[0]);
        if (accounts[0].attributes[field].includes(expectation)) {
          const result = this.assert(operator, expectation, expectation, field);
          return this.pass(result.message, [], [record]);
        }
      }

      // if the field is a relationship field handled the validation here
      if (this.relationshipFields.includes(field) && accounts[0].relationships && accounts[0].relationships[field] && accounts[0].relationships[field].data) {
        actual = accounts[0].relationships[field].data.id.toString();
      } else {
        if (!accounts[0].attributes.hasOwnProperty(field)) {
          const record = this.createRecord(accounts[0]);
          return this.fail('The %s field does not exist on Prospect with %s %s', [field, idField, identifier], [record]);
        }
        // Since empty fields are not being returned by the API, default to undefined
        // so that checks that are expected to fail will behave as expected
        actual = accounts[0].attributes[field] === null || accounts[0].attributes[field] === undefined ? 'null' : accounts[0].attributes[field];
      }

      const record = this.createRecord(accounts[0]);
      const result = this.assert(operator, actual, expectation, field);

      return result.valid ? this.pass(result.message, [], [record])
        : this.fail(result.message, [], [record]);

    } catch (e) {
      if (e instanceof util.UnknownOperatorError) {
        return this.error('%s Please provide one of: %s', [e.message, baseOperators.join(', ')]);
      }
      if (e instanceof util.InvalidOperandError) {
        return this.error('There was an error checking the account field: %s', [e.message]);
      }

      return this.error('There was an error checking the account field: %s', [e.toString()]);
    }
  }

  createRecord(account): StepRecord {
    const obj = {};

    // Set attributes on structured data
    Object.keys(account.attributes).forEach(key => obj[key] = account.attributes[key]);
    obj['id'] = account.id;

    // Set relationship ids on structured data
    this.relationshipFields.forEach((key) => {
      if (Object.keys(account.relationships).includes(key) && Object.keys(account.relationships[key]).includes('data') && account.relationships[key].data !== null) {
        obj[key] = account.relationships[key].data.id || null;
      }
    });
    const record = this.keyValue('account', 'Checked Account', obj);
    return record;
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

export { AccountFieldEqualsStep as Step };
