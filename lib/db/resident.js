/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  RESIDENT_NOT_FOUND, NOT_FOUND, RESIDENT_CREATE_FAILED, RESIDENT_UPDATE_FAILED, RESIDENT_DELETE_FAILED,
} from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getInsertedId, getRowCount } from '../common/utility';

export default class Resident {
  static async list() {
    const organizations = await sequelize.query('EXEC [dbo].[sp_Organizations_SelectAll]', {
      type: QueryTypes.SELECT,
    });

    return organizations;
  }

  static async get(InternalOrgID) {
    const { params, replacements } = buildParams({ InternalOrgID });

    const [organization] = await sequelize.query(`EXEC [dbo].[sp_Organization_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (organization) {
      return organization;
    }

    throw new AppError(RESIDENT_NOT_FOUND, `organization with InternalOrgID: ${InternalOrgID} does not exists.`, NOT_FOUND);
  }

  static async create(record) {
    try {
      const { params, replacements } = buildParams(record, TABLES.ORGANIZATION);

      const InternalOrgID = await sequelize.query(`EXEC [dbo].[sp_Organization_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, OrganizationId: getInsertedId(InternalOrgID) };
    } catch (error) {
      throw new AppError(RESIDENT_CREATE_FAILED, error.message);
    }
  }

  static async update(InternalOrgID, record) {
    try {
      const { params, replacements } = buildParams({ InternalOrgID, ...record }, TABLES.ORGANIZATION);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Organization_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(RESIDENT_UPDATE_FAILED, `Unable to find record with InternalOrgID: ${InternalOrgID}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(RESIDENT_UPDATE_FAILED, error.message);
    }
  }

  static async rm(InternalOrgID) {
    try {
      const { params, replacements } = buildParams({ InternalOrgID });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Organization_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(RESIDENT_UPDATE_FAILED, `Unable to find record with InternalOrgID: ${InternalOrgID}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(RESIDENT_DELETE_FAILED, error.message);
    }
  }

  static async bulkInsert(records, OrganizationId) {
    try {
      const insertedId = await sequelize.query('EXEC [dbo].[usp_Resident_InsertUpdate] @json = :json, @OrganizationId = :OrganizationId, @ResidentId = :ResidentId', {
        type: QueryTypes.INSERT,
        replacements: { json: JSON.stringify(records), OrganizationId, ResidentId: null },
      });

      return { insertedId: getInsertedId(insertedId) };
    } catch (error) {
      throw new AppError(RESIDENT_CREATE_FAILED, error.message);
    }
  }
}
