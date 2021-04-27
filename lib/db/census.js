/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize from './sql';
import AppError from '../common/appError';
import {
  CENSUS_CREATE_FAILED,
} from '../common/errorCodes';
import { getInsertedId } from '../common/utility';

export default class Census {
  static async bulkInsert(OrganizationId, FacilityId, records) {
    try {
      const insertedId = await sequelize.query('EXEC [dbo].[usp_Census_InsertUpdate] @json = :json, @OrganizationId = :OrganizationId, @FacilityId = :FacilityId, @CensusId = :CensusId', {
        type: QueryTypes.INSERT,
        replacements: { json: JSON.stringify(records), OrganizationId, FacilityId, CensusId: null },
      });

      return { insertedId: getInsertedId(insertedId) };
    } catch (error) {
      throw new AppError(CENSUS_CREATE_FAILED, error.message);
    }
  }
}
