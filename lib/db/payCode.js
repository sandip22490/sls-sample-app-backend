/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  PAYCODE_NOT_FOUND, NOT_FOUND, PAYCODE_CREATE_FAILED, PAYCODE_UPDATE_FAILED, PAYCODE_DELETE_FAILED,
} from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getIsoDate, getInsertedId, getRowCount } from '../common/utility';

export default class PayCode {
  static async list(OrganizationId) {
    
    const { params, replacements } = buildParams({ OrganizationId });
    console.log(`EXEC [dbo].[sp_PayCodes_SelectBy_OrganizationId] ${params}`);
    const paycodes = await sequelize.query(`EXEC [dbo].[sp_PayCodes_SelectBy_OrganizationId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    return paycodes;
  }

  static async get(PayCodeId) {
    const { params, replacements } = buildParams({ PayCodeId });
    
    const [paycode] = await sequelize.query(`EXEC [dbo].[sp_PayCode_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if ([paycode]) {
      return [paycode];
    }

    throw new AppError(PAYCODE_NOT_FOUND, `paycode with PayCodeId: ${PayCodeId} does not exists.`, NOT_FOUND);
  }

  static async create(record, UserId) {
    try {
      record.CreatedBy = UserId;
      record.CreatedDateTime = getIsoDate();

      const { params, replacements } = buildParams(record, TABLES.PAYCODE);

      const PayCodeId = await sequelize.query(`EXEC [dbo].[sp_PayCode_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, PayCodeId: getInsertedId(PayCodeId) };
    } catch (error) {
      throw new AppError(PAYCODE_CREATE_FAILED, error.message);
    }
  }

  static async update(record, PayCodeId, UserId) {
    try {
      record.UpdatedBy = UserId;
      record.UpdatedDateTime = getIsoDate();

      const { params, replacements } = buildParams({ PayCodeId, ...record }, TABLES.PAYCODE);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_PayCode_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(PAYCODE_UPDATE_FAILED, `Unable to find record with PayCodeId: ${PayCodeId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(PAYCODE_UPDATE_FAILED, error.message);
    }
  }

  static async rm(PayCodeId) {
    try {
      const { params, replacements } = buildParams({ PayCodeId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_PayCode_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(PAYCODE_DELETE_FAILED, `Unable to find record with PayCodeId: ${PayCodeId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(PAYCODE_DELETE_FAILED, error.message);
    }
  }
}
