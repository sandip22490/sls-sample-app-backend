/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import { JOB_NOT_FOUND, NOT_FOUND, JOB_CREATE_FAILED, JOB_UPDATE_FAILED, JOB_DELETE_FAILED } from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getInsertedId, getRowCount } from '../common/utility';

export default class Job {
  static async list() {
    const jobs = await sequelize.query('EXEC [dbo].[sp_Jobs_SelectAll]', {
      type: QueryTypes.SELECT,
    });

    return jobs;
  }

  static async get(JobId) {
    const { params, replacements } = buildParams({ JobId });

    const [job] = await sequelize.query(`EXEC [dbo].[sp_Job_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (job) {
      return job;
    }

    throw new AppError(JOB_NOT_FOUND, `Job with JobId: ${JobId} does not exists.`, NOT_FOUND);
  }

  static async getJobDepartments(OrganizationId, FacilityId, DepartmentId) {
    const { params, replacements } = buildParams({ OrganizationId, FacilityId, DepartmentId });

    const job = await sequelize.query(`EXEC [dbo].[usp_Job_Select_ByFacilityId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (job) {
      return job;
    }

    throw new AppError(JOB_NOT_FOUND, `Job with OrganizationId: ${OrganizationId} and FacilityId: ${FacilityId} does not exists.`, NOT_FOUND);
  }

  static async create(record) {
    try {
      const { params, replacements } = buildParams(record, TABLES.JOB);

      const JobId = await sequelize.query(`EXEC [dbo].[sp_Job_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, JobId: getInsertedId(JobId) };
    } catch (error) {
      throw new AppError(JOB_CREATE_FAILED, error.message);
    }
  }

  static async update(JobId, record) {
    try {
      const { params, replacements } = buildParams({ JobId, ...record }, TABLES.JOB);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Job_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(JOB_UPDATE_FAILED, `Unable to find record with JobId: ${JobId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(JOB_UPDATE_FAILED, error.message);
    }
  }

  static async rm(JobId) {
    try {
      const { params, replacements } = buildParams({ JobId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Job_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(JOB_DELETE_FAILED, `Unable to find record with JobId: ${JobId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(JOB_DELETE_FAILED, error.message);
    }
  }

  static async bulkInsert(records = [], OrganizationId) {
    try {
      const insertedId = await sequelize.query('EXEC [dbo].[usp_Job_InsertUpdate] @json = :json, @OrganizationId = :OrganizationId, @JobId = :JobId', {
        type: QueryTypes.INSERT,
        replacements: { json: JSON.stringify(records), OrganizationId, JobId: null },
      });

      return { insertedId: getInsertedId(insertedId) };
    } catch (error) {
      throw new AppError(JOB_CREATE_FAILED, error.message);
    }
  }
}
