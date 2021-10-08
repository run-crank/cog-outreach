/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';
import * as util from '@run-crank/utilities';
import { baseOperators } from '../../client/constants/operators';

export class ProspectFieldEqualsStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Check a field on an Outreach prospect';
  // tslint:disable-next-line:max-line-length
  protected stepExpression: string = 'the (?<field>[a-zA-Z0-9_-]+) field on outreach prospect (?<email>.+) should (?<operator>be set|not be set|be less than|be greater than|be one of|be|contain|not be one of|not be|not contain|match|not match) ?(?<expectation>.+)?';
  protected stepType: StepDefinition.Type = StepDefinition.Type.VALIDATION;
  protected expectedFields: Field[] = [{
    field: 'email',
    type: FieldDefinition.Type.EMAIL,
    description: "Prospect's Email",
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
    id: 'prospect',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'id',
      type: FieldDefinition.Type.STRING,
      description: "Prospect's Outreach ID",
    }, {
      field: 'name',
      type: FieldDefinition.Type.NUMERIC,
      description: 'The Prospect\'s ID',
    }, {
      field: 'createAt',
      type: FieldDefinition.Type.DATETIME,
      description: 'The Prospect\'s Create Date',
    }, {
      field: 'updatedAt',
      type: FieldDefinition.Type.DATETIME,
      description: 'The Prospect\'s Last Update Date',
    }],
    dynamicFields: true,
  }];

  private relationshipFields = [
    'owner',
    'stage',
    'account',
  ];

  private listFields = [
    'homePhones',
    'mobilePhones',
    'otherPhones',
    'tags',
    'voipPhones',
    'workPhones',
    'emails',
  ];

  async executeStep(step: Step) {
    const stepData: any = step.getData() ? step.getData().toJavaScript() : {};
    const expectation = stepData.expectation;
    const email = stepData.email;
    const field = stepData.field;
    const operator = stepData.operator || 'be';

    let actual = null;

    try {
      const prospect = await this.client.getProspectByEmail(email);
      if (prospect == undefined || prospect == null) {
        return this.fail('No Prospect was found with email %s', [email]);
      }

      // Handle email field check to so be operator can work instead of just include
      // It will automatically pass once a prospect is found
      if (this.listFields.includes(field) && operator.toLowerCase() === 'be') {
        const record = this.createRecord(prospect);
        if (prospect.attributes[field].includes(expectation)) {
          const result = this.assert(operator, expectation, expectation, field);
          return this.pass(result.message, [], [record]);
        }
      }

      // if the field is a relationship field handled the validation here
      if (this.relationshipFields.includes(field) && prospect.relationships && prospect.relationships[field] && prospect.relationships[field].data) {
        actual = prospect.relationships[field].data.id.toString();
      } else {
        if (!prospect.attributes.hasOwnProperty(field)) {
          const record = this.createRecord(prospect);
          return this.fail('The %s field does not exist on Prospect %s', [field, email], [record]);
        }
        // Since empty fields are not being returned by the API, default to undefined
        // so that checks that are expected to fail will behave as expected
        actual = prospect.attributes[field] ? prospect.attributes[field] : null;
      }

      const record = this.createRecord(prospect);
      const result = this.assert(operator, actual, expectation, field);

      return result.valid ? this.pass(result.message, [], [record])
        : this.fail(result.message, [], [record]);

    } catch (e) {
      if (e instanceof util.UnknownOperatorError) {
        return this.error('%s Please provide one of: %s', [e.message, baseOperators.join(', ')]);
      }
      if (e instanceof util.InvalidOperandError) {
        return this.error('There was an error checking the prospect field: %s', [e.message]);
      }

      return this.error('There was an error checking the prospect field: %s', [e.toString()]);
    }
  }

  public createRecord(prospect): StepRecord {
    const obj = {};

    // Set attributes on structured data
    Object.keys(prospect.attributes).forEach(key => obj[key] = prospect.attributes[key]);
    obj['id'] = prospect.id;

    // Set relationship ids on structured data
    this.relationshipFields.forEach((key) => {
      if (Object.keys(prospect.relationships[key]).includes('data')) {
        obj[key] = prospect.relationships[key].data.id || null;
      }
    });
    const record = this.keyValue('prospect', 'Checked Prospect', obj);
    return record;
  }
}

export { ProspectFieldEqualsStep as Step };
