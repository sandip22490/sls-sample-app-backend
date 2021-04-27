/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  FACILITY_NOT_FOUND, NOT_FOUND, FACILITY_CREATE_FAILED,FACILITY_UPDATE_FAILED,
} from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getIsoDate, getInsertedId, getRowCount } from '../common/utility';

export default class Facility {
  
  static async getByOrganization(OrganizationId) {
    const { params, replacements } = buildParams({ OrganizationId });

    const schedule = await sequelize.query(`EXEC [dbo].[usp_Facility_Select_ByOrganizationId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (schedule) {
      return schedule;
    }

    throw new AppError(FACILITY_NOT_FOUND, `facility with OrganizationId: ${OrganizationId}  does not exists.`, NOT_FOUND);
  }

  static async getByFacilityOrganization(OrganizationId, FacilityId) {
    const { params, replacements } = buildParams({ OrganizationId, FacilityId });

    const schedule = await sequelize.query(`EXEC [dbo].[usp_Facility_Select_ByFacilityOrganizationId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (schedule) {
      return schedule;
    }

    throw new AppError(FACILITY_NOT_FOUND, `facility with OrganizationId: ${OrganizationId} and FacilityId: ${FacilityId} does not exists.`, NOT_FOUND);
  }

  static async update(record, FacilityId, UserId) {
    try {
      record.UpdatedBy = UserId;
      record.UpdatedDateTime = getIsoDate();

      const { params, replacements } = buildParams({ FacilityId, ...record }, TABLES.FACILITY);
console.log('executing database call');
console.log(JSON.stringify({params, replacements}));
      let rowCount = await sequelize.query(`EXEC [dbo].[usp_Facility_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(FACILITY_UPDATE_FAILED, `Unable to find record with FacilityId: ${FacilityId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(FACILITY_UPDATE_FAILED, error.message);
    }
  }

  static async bulkInsertUpdate(records = [], orgUuId) {
    try {
      console.log(JSON.stringify(records));
      const insertedId = await sequelize.query('EXEC [dbo].[usp_Facility_InsertUpdate] @json = :json, @orgUuId = :orgUuId, @FacilityId = :FacilityId', {
        type: QueryTypes.INSERT,
        replacements: { json: JSON.stringify(records), orgUuId, FacilityId: null },
      });

      return { insertedId: getInsertedId(insertedId) };
    } catch (error) {
      throw new AppError(FACILITY_CREATE_FAILED, error.message);
    }
  }

}
