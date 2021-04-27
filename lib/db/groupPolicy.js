/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  GROUP_POLICY_NOT_FOUND, NOT_FOUND, GROUP_POLICY_CREATE_FAILED, GROUP_POLICY_UPDATE_FAILED, GROUP_POLICY_DELETE_FAILED,
} from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getIsoDate, getInsertedId, getRowCount } from '../common/utility';

export default class GroupPolicy {
  static async list(GroupId) {
    const { params, replacements } = buildParams({ GroupId });

    const groupPolicies = await sequelize.query(`EXEC [dbo].[sp_GroupPolicies_SelectBy_GroupId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (groupPolicies) {
      return groupPolicies;
    }
    throw new AppError(GROUP_POLICY_NOT_FOUND, `group policy with groupId: ${GroupId} does not exists.`, NOT_FOUND);
  }

  static async get(GroupId, PolicyAreaId) {
    const { params, replacements } = buildParams({ GroupId, PolicyAreaId });

    const groupPolicies = await sequelize.query(`EXEC [dbo].[usp_GroupPolicies_SelectBy_GroupIdPolicyAreaId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (groupPolicies) {
      return groupPolicies;
    }

    throw new AppError(GROUP_POLICY_NOT_FOUND, `group policy with groupId: ${GroupId} policyId: ${PolicyAreaId} does not exists.`, NOT_FOUND);
  }

  static async create(record, UserId) {
    try {
      record.CreatedBy = UserId;
      record.CreatedDateTime = getIsoDate();
      const { params, replacements } = buildParams(record, TABLES.GROUPPOLICY);

      const GroupPolicyId = await sequelize.query(`EXEC [dbo].[sp_GroupPolicy_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, GroupPolicyId: getInsertedId(GroupPolicyId) };
    } catch (error) {
      throw new AppError(GROUP_POLICY_CREATE_FAILED, error.message);
    }
  }

  static async update(GroupId, record, UserId) {
    try {
      if (record.action === 'A') {
        record.CreatedBy = UserId;
        record.CreatedDateTime = getIsoDate();
      } else if (record.action === 'U') {
        record.UpdatedBy = UserId;
        record.UpdatedDateTime = getIsoDate();
      }
      const { params, replacements } = buildParams({ GroupId, ...record }, TABLES.GROUPPOLICY);

      let rowCount = await sequelize.query(`EXEC [dbo].[usp_GroupPolicy_InsertUpdate] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }
      throw new AppError(GROUP_POLICY_UPDATE_FAILED, `Unable to find record with GroupId: ${GroupId} `, NOT_FOUND);
    } catch (error) {
      throw new AppError(GROUP_POLICY_UPDATE_FAILED, error.message);
    }
  }

  static async rm(GroupId) {
    try {
      const { params, replacements } = buildParams({ GroupId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_GroupPolicies_DeleteBy_GroupID] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(GROUP_POLICY_DELETE_FAILED, `Unable to find record with GroupId: ${GroupId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(GROUP_POLICY_DELETE_FAILED, error.message);
    }
  }

  static async GetGroupPolicies(GroupId) {
    const { params, replacements } = buildParams({ GroupId });

    const groupPolicies = await sequelize.query(`EXEC [dbo].[usp_GroupPolicies_SelectBy_GroupId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (groupPolicies) {
      return groupPolicies;
    }
    throw new AppError(GROUP_POLICY_NOT_FOUND, `group policy with groupId: ${GroupId} does not exists.`, NOT_FOUND);
  }
}
