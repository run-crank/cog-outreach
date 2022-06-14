/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';

export class DiscoverProspect extends BaseStep implements StepInterface {

  protected stepName: string = 'Discover fields on an Outreach prospect';
  // tslint:disable-next-line:max-line-length
  protected stepExpression: string = 'discover fields on outreach prospect (?<email>.+)';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected expectedFields: Field[] = [{
    field: 'email',
    type: FieldDefinition.Type.EMAIL,
    description: "Prospect's Email",
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
    const email = stepData.email;

    try {
      const prospect = await this.client.getProspectByEmail(email);
      if (prospect == undefined || prospect == null) {
        return this.fail('No Prospect was found with email %s', [email]);
      }

      const record = this.createRecord(prospect);
      return this.pass('Successfully discovered fields on prospect', [], [record]);

    } catch (e) {
      return this.error('There was an error checking the prospect: %s', [e.toString()]);
    }
  }

  public createRecord(prospect): StepRecord {
    const obj = {};

    // Set attributes on structured data
    Object.keys(prospect.attributes).forEach(key => obj[key] = prospect.attributes[key]);
    obj['id'] = prospect.id;

    // Set relationship ids on structured data
    this.relationshipFields.forEach((key) => {
      if (Object.keys(prospect.relationships).includes(key) && Object.keys(prospect.relationships[key]).includes('data') && prospect.relationships[key].data !== null) {
        obj[key] = prospect.relationships[key].data.id || null;
      }
    });
    const record = this.keyValue('discoverProspect', 'Discovered Prospect', obj);
    return record;
  }
}

export { DiscoverProspect as Step };
