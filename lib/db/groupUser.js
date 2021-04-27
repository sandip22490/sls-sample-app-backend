/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  GROUP_USER_NOT_FOUND, NOT_FOUND, GROUP_USER_CREATE_FAILED, GROUP_USER_UPDATE_FAILED, GROUP_USER_DELETE_FAILED,
} from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getInsertedId, getRowCount, getIsoDate } from '../common/utility';

export default class GroupUser {
  static async list(GroupId) {
    const { params, replacements } = buildParams({ GroupId });

    const groupUser = await sequelize.query(`EXEC [dbo].[sp_GroupUsers_SelectBy_GroupId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (groupUser) {
      return groupUser;
    }

    throw new AppError(GROUP_USER_NOT_FOUND, `group users with GroupId: ${GroupId} does not exists.`, NOT_FOUND);
  }

  static async get(GroupId, UserId) {
    const { params, replacements } = buildParams({ GroupId, UserId });

    const groupUser = await sequelize.query(`EXEC [dbo].[usp_GroupUsers_SelectBy_GroupIdUserId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (groupUser) {
      return groupUser;
    }

    throw new AppError(GROUP_USER_NOT_FOUND, `group users with GroupId: ${GroupId} does not exists.`, NOT_FOUND);
  }

  static async create(record, UserId) {
    try {
      record.CreatedBy = UserId;
      record.CreatedDateTime = getIsoDate();

      const { params, replacements } = buildParams(record, TABLES.GROUPUSER);

      const GroupUserId = await sequelize.query(`EXEC [dbo].[sp_GroupUser_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, GroupUserId: getInsertedId(GroupUserId) };
    } catch (error) {
      throw new AppError(GROUP_USER_CREATE_FAILED, error.message);
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
      const { params, replacements } = buildParams({ GroupId, ...record }, TABLES.GROUPUSER);

      let rowCount = await sequelize.query(`EXEC [dbo].[usp_GroupUser_InsertUpdate] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }
      throw new AppError(GROUP_USER_UPDATE_FAILED, `Unable to find record with GroupId: ${GroupId} `, NOT_FOUND);
    } catch (error) {
      throw new AppError(GROUP_USER_UPDATE_FAILED, error.message);
    }
  }

  static async rm(GroupId) {
    try {
      const { params, replacements } = buildParams({ GroupId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_GroupUsers_DeleteBy_GroupId] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(GROUP_USER_DELETE_FAILED, `Unable to find record with GroupId: ${GroupId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(GROUP_USER_DELETE_FAILED, error.message);
    }
  }

  static async GetGroupUsers(GroupId) {
    const { params, replacements } = buildParams({ GroupId });

    const groupUser = await sequelize.query(`EXEC [dbo].[usp_Users_SelectBy_GroupId_Unassign] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (groupUser) {
      return groupUser;
    }

    throw new AppError(GROUP_USER_NOT_FOUND, `group users with GroupId: ${GroupId} does not exists.`, NOT_FOUND);
  }
}
