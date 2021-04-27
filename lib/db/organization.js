/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  ORG_NOT_FOUND, NOT_FOUND, ORG_CREATE_FAILED, ORG_UPDATE_FAILED, ORG_DELETE_FAILED,
} from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getInsertedId, getRowCount } from '../common/utility';

export default class Organization {
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

    throw new AppError(ORG_NOT_FOUND, `organization with InternalOrgID: ${InternalOrgID} does not exists.`, NOT_FOUND);
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
      throw new AppError(ORG_CREATE_FAILED, error.message);
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

      throw new AppError(ORG_UPDATE_FAILED, `Unable to find record with InternalOrgID: ${InternalOrgID}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(ORG_UPDATE_FAILED, error.message);
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

      throw new AppError(ORG_UPDATE_FAILED, `Unable to find record with InternalOrgID: ${InternalOrgID}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(ORG_DELETE_FAILED, error.message);
    }
  }
}
