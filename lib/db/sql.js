import { Sequelize, DataTypes } from 'sequelize';
import * as tedious from 'tedious';

import { CONN_STR, TABLES, INVITATION_STATUS } from '../common/constant';
import { maskFields } from '../common/utility';

const schema = {
  [TABLES.ORGANIZATION]: {
    InternalOrgID: null,
    OrgName: null,
    EmrName: null,
    EmrOrgID: null,
    PayrollSystem: null,
    PayrollSystemOrgID: null,
  },
  [TABLES.INVITATION]: {
    InvitationId: null,
    InvitationCode: null,
    OrganizationId: null,
    FirstName: null,
    LastName: null,
    Email: null,
    Phone: null,
    Status: INVITATION_STATUS.INVITED,
    SubId: null,
    GroupId: null,
    UserId: null,
    InvitationExpireDate: null,
    CreatedBy: null,
    CreatedDateTime: null,
    UpdatedBy: null,
    UpdatedDateTime: null,
  },
  [TABLES.GROUP]: {
    GroupId: null,
    GroupName: null,
    Description: null,
    GroupLevel: null,
    CreatedBy: null,
    CreatedDateTime: null,
    UpdatedBy: null,
    UpdatedDateTime: null,
  },
  [TABLES.GROUPPOLICY]: {
    GroupPolicyId: null,
    GroupId: null,
    PolicyAreaId: null,
    AccessTypeId: null,
    CreatedBy: null,
    CreatedDateTime: null,
    UpdatedBy: null,
    UpdatedDateTime: null,
  },
  [TABLES.GROUPUSER]: {
    GroupUserId: null,
    GroupId: null,
    UserId: null,
    CreatedBy: null,
    CreatedDateTime: null,
    UpdatedBy: null,
    UpdatedDateTime: null,
  },
  [TABLES.USER]: {
    UserId: null,
    SubId: null,
    OrganizationId: null,
    IsActive: null,
    LoginDateTime: null,
    CreatedBy: null,
    CreatedDateTime: null,
    UpdatedBy: null,
    UpdatedDateTime: null,
  },
  [TABLES.BATCH_PROCESS]: {
    BatchId: null,
    OrganizationId: null,
    OperationName: null,
    EntityId: null,
    EntityType: null,
    Status: null,
    BatchTokenId: null,
    ErrorMessage: null,
    CreatedBy: null,
    CreatedDateTime: null,
    UpdatedBy: null,
    UpdatedDateTime: null,
  },
  [TABLES.PAYCODE]: {
    PayCodeId: null,
    PayCode: null,
    OrganizationId: null,
    InTimeWorked: null,
    InSchedule: null,
    InDollarCalc: null,
    CreatedBy: null,
    CreatedDateTime: null,
    UpdatedBy: null,
    UpdatedDateTime: null,
  },
  [TABLES.FACILITY]: {
    FacilityId: null,
    OrganizationId: null,
    OrgCode: null,
    FacilityCode: null,
    FacId: null,
    FacilityName: null,
    Address: null,
    City: null,
    ARStartDate: null,
    State: null,
    LineOfBusiness: null,
    Payroll_LocationID: null,
    CCN: null,
    Payroll_Start_Day: null,
    IsActive: null,	
    UpdatedBy: null,
    UpdatedDateTime: null,
  },
};

// eslint-disable-next-line no-underscore-dangle
DataTypes.DATE.prototype._stringify = function (date, options) {
  // eslint-disable-next-line no-underscore-dangle
  date = this._applyTimezone(date, options);
  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
}.bind(DataTypes.DATE.prototype);

export default new Sequelize(CONN_STR, {
  dialect: 'mssql',
  dialectModule: tedious,
  dialectOptions: {
    options: {
      encrypt: true,
      appName: 'SampleApp',
      requestTimeout: 300000,
      cancelTimeout: 300000,
    },
  },
  logging: (...msg) => console.log(JSON.stringify(msg, maskFields, 2)),
});

export const buildParams = (record, tableName) => {
  const newRecord = tableName ? { ...schema[tableName], ...record } : record;
  return { params: Object.keys(newRecord).map((key) => `@${key} = :${key}`).join(', '), replacements: newRecord };
};
