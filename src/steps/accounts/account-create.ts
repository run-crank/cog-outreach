import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition, StepRecord } from '../../proto/cog_pb';
import * as moment from 'moment';
export class AccountCreateStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Create an Outreach account';
  protected stepExpression: string = 'create an outreach account';
  protected stepType: StepDefinition.Type = StepDefinition.Type.ACTION;
  protected actionList: string[] = ['create'];
  protected targetObject: string = 'Account';
  protected expectedFields: Field[] = [{
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
    let account: any = stepData.account;

    try {
      account = this.validateObject(account);
      const result = await this.client.createAccount(account, this.relationship);
      const record = this.createRecord(result);
      const passingRecord = this.createPassingRecord(result, Object.keys(account));
      const orderedRecord = this.createOrderedRecord(result, stepData['__stepOrder']);
      return this.pass('Successfully created Account with ID %s', [result.id], [record, passingRecord, orderedRecord]);
    } catch (e) {
      return this.error('There was a problem creating the Account: %s', [e.toString()]);
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

  public createRecord(account): StepRecord {
    const obj = {};
    Object.keys(account.attributes).forEach(key => obj[key] = account.attributes[key]);
    return this.keyValue('account', 'Created Account', obj);
  }
  
  public createPassingRecord(data, fields): StepRecord {
    const obj = {};
    Object.keys(data.attributes).forEach(key => obj[key] = data.attributes[key]);

    const filteredData = {};
    if (obj) {
      Object.keys(obj).forEach((key) => {
        if (fields.includes(key)) {
          filteredData[key] = obj[key];
        }
      });
    }
    return this.keyValue('exposeOnPass:account', 'Created Account', filteredData);
  }

  public createOrderedRecord(account, stepOrder = 1): StepRecord {
    const obj = {};
    Object.keys(account.attributes).forEach(key => obj[key] = account.attributes[key]);
    return this.keyValue(`account.${stepOrder}`, `Created Account from Step ${stepOrder}`, obj);
  }
}

export { AccountCreateStep as Step };
