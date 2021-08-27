/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';
import * as util from '@run-crank/utilities';
import { baseOperators } from '../../client/constants/operators';

export class AccountFieldEquals extends BaseStep implements StepInterface {

  protected stepName: string = 'Check a field on a Outreach account';
  // tslint:disable-next-line:max-line-length
  protected stepExpression: string = 'the (?<field>[a-zA-Z0-9_-]+) field on outreach account (?<email>.+) should (?<operator>be set|not be set|be less than|be greater than|be one of|be|contain|not be one of|not be|not contain|match|not match) ?(?<expectation>.+)?';
  protected stepType: StepDefinition.Type = StepDefinition.Type.VALIDATION;
  protected expectedFields: Field[] = [{
    field: 'id',
    type: FieldDefinition.Type.STRING,
    description: "Account's Id",
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

  async executeStep(step: Step) {
    const stepData: any = step.getData() ? step.getData().toJavaScript() : {};
    const expectation = stepData.expectation;
    const id = stepData.id;
    const field = stepData.field;
    const operator = stepData.operator || 'be';

    try {
      const account = await this.client.getAccountById(id);

      // Since empty fields are not being returned by the API, default to undefined
      // so that checks that are expected to fail will behave as expected
      const actual = account.data.attributes[field]
        ? account.data.attributes[field] : null;

      const record = this.createRecord(account);
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

  public createRecord(account): StepRecord {
    const obj = {};
    Object.keys(account.data.attributes).forEach(key => obj[key] = account.data.attributes[key]);
    const record = this.keyValue('account', 'Checked Account', obj);
    return record;
  }
}

export { AccountFieldEquals as Step };