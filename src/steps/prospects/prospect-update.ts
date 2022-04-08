import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';
import * as moment from 'moment';

export class ProspectUpdateStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Update an Outreach Prospect';
  protected stepExpression: string = 'update an outreach prospect';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected expectedFields: Field[] = [{
    field: 'email',
    type: FieldDefinition.Type.EMAIL,
    description: "Prospect's Email",
  }, {
    field: 'prospect',
    type: FieldDefinition.Type.MAP,
    description: 'A map of field names to field values',
  }];
  protected expectedRecords: ExpectedRecord[] = [{
    id: 'prospect',
    type: RecordDefinition.Type.KEYVALUE,
    fields: [{
      field: 'id',
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

  private listFields = [
    'homePhones',
    'mobilePhones',
    'otherPhones',
    'tags',
    'voipPhones',
    'workPhones',
    'emails',
  ];

  private relationshipFields = [
    'owner',
    'stage',
    'account',
  ];

  private relationshipMap = {
    owner: 'user',
  };

  private relationship = {};

  async executeStep(step: Step): Promise<RunStepResponse> {
    const stepData: any = step.getData().toJavaScript();
    const email: any = stepData.email;
    let prospect: any = stepData.prospect;

    try {
      const existingProspect = await this.client.getProspectByEmail(email);

      if (existingProspect == undefined || existingProspect == null) {
        return this.fail('No Prospect was found with email %s', [email]);
      }

      prospect = this.validateObject(prospect);
      const result = await this.client.updateProspect(existingProspect.id, prospect, this.relationship);
      const record = this.createRecord(result);
      const orderedRecord = this.createOrderedRecord(result, stepData['__stepOrder']);
      return this.pass('Successfully updated Prospect with ID %s', [result.id], [record, orderedRecord]);
    } catch (e) {
      return this.error('There was a problem updating the Prospect: %s', [e.toString()]);
    }
  }

  validateObject(prospect): any {
    Object.keys(prospect).forEach((key) => {
      if (this.dateTimeFields.includes(key) || this.dateFields.includes(key)) {
        prospect[key] = this.formatDate(prospect[key]);
      } else if (this.listFields.includes(key)) {
        prospect[key] = this.formatList(prospect[key]);
      } else if (this.relationshipFields.includes(key)) {
        this.setRelationships(key, prospect);
        delete prospect[key];
      }
    });
    return prospect;
  }

  formatDate(date: string): string {
    return moment(date).format('YYYY-MM-DD');
  }

  formatList(list: string): string[] {
    return list.replace(' ', '').split(',');
  }

  setRelationships(key: string, prospect): void {
    const relationshipType = this.relationshipMap[key] || key;
    this.relationship[key] = {
      data: {
        type: relationshipType,
        id: prospect[key],
      },
    };
  }

  public createRecord(prospect): StepRecord {
    return this.keyValue('prospect', 'Updated Prospect', { id: prospect.id });
  }

  public createOrderedRecord(prospect, stepOrder = 1): StepRecord {
    return this.keyValue(`prospect.${stepOrder}`, `Updated Prospect from Step ${stepOrder}`, { id: prospect.id });
  }
}

export { ProspectUpdateStep as Step };
