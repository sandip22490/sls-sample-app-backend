/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  SCHEDULE_NOT_FOUND, NOT_FOUND, SCHEDULE_CREATE_FAILED, SCHEDULE_METRICS_NOT_FOUND,
} from '../common/errorCodes';
import { getInsertedId } from '../common/utility';

export default class Schedule {
  static async list() {
    const schedules = await sequelize.query('EXEC [dbo].[sp_Schedules_SelectAll]', {
      type: QueryTypes.SELECT,
    });

    return schedules;
  }

  static async get(OrganizationId, FacilityId, DepartmentId, StartDate, EndDate) {
    const { params, replacements } = buildParams({ OrganizationId, FacilityId, DepartmentId, StartDate, EndDate });

    const schedule = await sequelize.query(`EXEC [dbo].[usp_Schedules_GetSchedule] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (schedule) {
      return schedule;
    }

    throw new AppError(SCHEDULE_NOT_FOUND, `schedule with OrganizationId: ${OrganizationId}  and FacilityId: ${FacilityId} does not exists.`, NOT_FOUND);
  }

  static async bulkInsert(records = [], OrganizationId) {
    try {
      const affectedRows = await sequelize.query('EXEC [dbo].[usp_Schedule_InsertUpdate] @json = :json, @OrganizationId = :OrganizationId', {
        type: QueryTypes.INSERT,
        replacements: { json: JSON.stringify(records), OrganizationId },
      });

      return { affectedRows: getInsertedId(affectedRows) };
    } catch (error) {
      throw new AppError(SCHEDULE_CREATE_FAILED, error.message);
    }
  }

  static async getMetrics(FacilityId, DepartmentId, StartDate, EndDate) {
    const { params, replacements } = buildParams({ FacilityId, DepartmentId, StartDate, EndDate });

    const [metrics] = await sequelize.query(`EXEC [dbo].[usp_Metrics_GetBy_FacilityId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (metrics) {
      return metrics;
    }

    throw new AppError(SCHEDULE_METRICS_NOT_FOUND, `schedule metrics data for FacilityId: ${FacilityId} and DepartmentId: ${DepartmentId} does not exists.`, NOT_FOUND);
  }
}
