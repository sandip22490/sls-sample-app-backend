/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  GROUP_NOT_FOUND, NOT_FOUND, GROUP_CREATE_FAILED, GROUP_UPDATE_FAILED, GROUP_DELETE_FAILED,
} from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getIsoDate, getInsertedId, getRowCount } from '../common/utility';

export default class Groups {
  static async list() {
    const groups = await sequelize.query('EXEC [dbo].[sp_Groups_SelectAll]', {
      type: QueryTypes.SELECT,
    });

    return groups;
  }

  static async get(GroupId) {
    const { params, replacements } = buildParams({ GroupId });

    const [group] = await sequelize.query(`EXEC [dbo].[sp_Group_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (group) {
      return group;
    }

    throw new AppError(GROUP_NOT_FOUND, `group with GroupId: ${GroupId} does not exists.`, NOT_FOUND);
  }

  static async create(record, UserId) {
    try {
      record.CreatedBy = UserId;
      record.CreatedDateTime = getIsoDate();
      const { params, replacements } = buildParams(record, TABLES.GROUP);

      const GroupId = await sequelize.query(`EXEC [dbo].[usp_Group_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, GroupId: getInsertedId(GroupId) };
    } catch (error) {
      throw new AppError(GROUP_CREATE_FAILED, error.message);
    }
  }

  static async update(GroupId, record, UserId) {
    try {
      record.UpdatedBy = UserId;
      record.UpdatedDateTime = getIsoDate();
      const { params, replacements } = buildParams({ GroupId, ...record }, TABLES.GROUP);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Group_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(GROUP_UPDATE_FAILED, `Unable to find record with GroupId: ${GroupId} `, NOT_FOUND);
    } catch (error) {
      throw new AppError(GROUP_UPDATE_FAILED, error.message);
    }
  }

  static async rm(GroupId) {
    try {
      const { params, replacements } = buildParams({ GroupId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Group_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(GROUP_DELETE_FAILED, `Unable to find record with GroupId: ${GroupId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(GROUP_DELETE_FAILED, error.message);
    }
  }
}
