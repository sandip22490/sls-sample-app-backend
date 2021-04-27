/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  USER_CREATE_FAILED, USER_DELETE_FAILED, USER_UPDATE_FAILED, USER_NOT_FOUND, NOT_FOUND,
} from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getInsertedId, getRowCount, getIsoDate } from '../common/utility';

export default class User {
  static async list() {
    const users = await sequelize.query('EXEC [dbo].[sp_Users_SelectAll]', {
      type: QueryTypes.SELECT,
    });

    return users;
  }

  static async get(UserId) {
    const { params, replacements } = buildParams({ UserId });

    const [user] = await sequelize.query(`EXEC [dbo].[usp_User_SelectBy_UserId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (user) {
      return user;
    }

    throw new AppError(USER_NOT_FOUND, `user with UserId: ${UserId} does not exists.`, NOT_FOUND);
  }

  static async getByEmail(Email) {
    const { params, replacements } = buildParams({ Email });

    const [user] = await sequelize.query(`EXEC [dbo].[usp_User_Select_ByEmail] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (user) {
      return user;
    }

    throw new AppError(USER_NOT_FOUND, `user with email: ${Email} does not exists.`, NOT_FOUND);
  }

  static async create(record, CreatedBy = null) {
    try {
      record.IsActive = true;
      record.LoginDateTime = getIsoDate();
      record.CreatedBy = CreatedBy;
      record.CreatedDateTime = getIsoDate();

      const { params, replacements } = buildParams(record, TABLES.USER);

      const UserId = await sequelize.query(`EXEC [dbo].[sp_User_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, UserId: getInsertedId(UserId) };
    } catch (error) {
      throw new AppError(USER_CREATE_FAILED, error.message);
    }
  }

  static async update(UserId, record) {
    try {
      const { params, replacements } = buildParams({ UserId, ...record }, TABLES.USER);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_User_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(USER_UPDATE_FAILED, `Unable to find record with UserId: ${UserId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(USER_UPDATE_FAILED, error.message);
    }
  }

  static async rm(UserId) {
    try {
      const { params, replacements } = buildParams({ UserId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_User_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(USER_DELETE_FAILED, `Unable to find record with UserId: ${UserId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(USER_DELETE_FAILED, error.message);
    }
  }

  static async getAccess(SubId) {
    const { params, replacements } = buildParams({ SubId });

    const accessPolicy = await sequelize.query(`EXEC [dbo].[usp_PolicyArea_SelectBy_SubId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (accessPolicy) {
      return accessPolicy;
    }

    throw new AppError(USER_NOT_FOUND, `user with SubId: ${SubId} does not exists.`, NOT_FOUND);
  }
}
