import { BaseStep, Field, StepInterface, ExpectedRecord } from '../../core/base-step';
import { Step, RunStepResponse, FieldDefinition, StepDefinition, RecordDefinition } from '../../proto/cog_pb';
import * as moment from 'moment';

export class AccountUpdateStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Update an Outreach Account';
  protected stepExpression: string = 'update an outreach account';
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

  private dateTimeFields = [
    'foundedAt',
  ];

  private listFields = [
    'tags',
  ];

  private relationshipFields = [
    'owner',
  ]

  private relationshipMap = {
    owner: 'user',
  }
  
  private relationship = {};

  async executeStep(step: Step): Promise<RunStepResponse> {
    const stepData: any = step.getData().toJavaScript();
    const id: any = stepData.id;
    let account: any = stepData.account;

    try {
      account = this.validateObject(account);
      const result = await this.client.updateAccount(id, account, this.relationship);
      const record = this.keyValue('account', 'Created Account', { Id: result.data.id });
      return this.pass('Successfully created Account with ID %s', [result.data.id], [record]);
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
    let relationshipType = this.relationshipMap[key] || key;
    this.relationship[key] = {
      data: {
        type: relationshipType,
        id: account[key]
      }
    };
  }
  

}

export { AccountUpdateStep as Step };
