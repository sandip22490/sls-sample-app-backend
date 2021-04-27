/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import { NOT_FOUND, EMPLOYEE_HOUR_CREATE_FAILED, EMPLOYEE_HOUR_UPDATE_FAILED, EMPLOYEE_HOUR_DELETE_FAILED, EMPLOYEE_HOUR_NOT_FOUND, } from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getInsertedId, getRowCount } from '../common/utility';

export default class EmployeeHour {
  static async list() {
    const employeeHours = await sequelize.query('EXEC [dbo].[sp_EmployeeHours_SelectAll]', {
      type: QueryTypes.SELECT,
    });

    return employeeHours;
  }

  static async get(employeeHourId) {
    const { params, replacements } = buildParams({ employeeHourId });

    const [employeeHour] = await sequelize.query(`EXEC [dbo].[sp_EmployeeHour_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (employeeHour) {
      return employeeHour;
    }

    throw new AppError(EMPLOYEE_HOUR_NOT_FOUND, `EmployeeHour with employeeHourId: ${employeeHourId} does not exists.`, NOT_FOUND);
  }

  static async getByFacility(FacilityId, DepartmentId, StartDate, EndDate) {
    const { params, replacements } = buildParams({ FacilityId, DepartmentId, StartDate, EndDate });

    const employeeHour = await sequelize.query(`EXEC [dbo].[usp_EmployeeHour_GetBy_FacilityId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (employeeHour) {
      return employeeHour;
    }

    throw new AppError(EMPLOYEE_HOUR_NOT_FOUND, `EmployeeHour with FacilityId: ${FacilityId} does not exists.`, NOT_FOUND);
  }

  static async create(record) {
    try {
      const { params, replacements } = buildParams(record, TABLES.EMPLOYEE_HOUR);

      const EmployeeHourId = await sequelize.query(`EXEC [dbo].[sp_EmployeeHour_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, EmployeeHourId: getInsertedId(EmployeeHourId) };
    } catch (error) {
      throw new AppError(EMPLOYEE_HOUR_CREATE_FAILED, error.message);
    }
  }

  static async update(EmployeeHourId, record) {
    try {
      const { params, replacements } = buildParams({ EmployeeHourId, ...record }, TABLES.EMPLOYEE_HOUR);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_EmployeeHour_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(EMPLOYEE_HOUR_UPDATE_FAILED, `Unable to find record with EmployeeHourId: ${EmployeeHourId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(EMPLOYEE_HOUR_UPDATE_FAILED, error.message);
    }
  }

  static async rm(EmployeeHourId) {
    try {
      const { params, replacements } = buildParams({ EmployeeHourId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_EmployeeHour_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(EMPLOYEE_HOUR_DELETE_FAILED, `Unable to find record with EmployeeHourId: ${EmployeeHourId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(EMPLOYEE_HOUR_DELETE_FAILED, error.message);
    }
  }

  static async bulkInsert(records = [], BatchId, OrganizationId) {
    try {
      const insertedId = await sequelize.query('EXEC [dbo].[usp_TranEmployeeHours_Insert] @json = :json, @BatchId = :BatchId, @OrganizationId = :OrganizationId, @EmployeeHourId = :EmployeeHourId', {
        type: QueryTypes.INSERT,
        replacements: { json: JSON.stringify(records), BatchId, OrganizationId, EmployeeHourId: null },
      });

      return { insertedId: getInsertedId(insertedId) };
    } catch (error) {
      throw new AppError(EMPLOYEE_HOUR_CREATE_FAILED, error.message);
    }
  }

  static async rmEmployeeHoursByBatchId(BatchId) {
    try {
      await sequelize.query('EXEC [dbo].[usp_TranEmployeeHours_Delete_ByBatchId] @BatchId = :BatchId', {
        type: QueryTypes.DELETE,
        replacements: { BatchId },
      });
    } catch (error) {
      throw new AppError(EMPLOYEE_HOUR_CREATE_FAILED, error.message);
    }
  }

  static async processEmployeeHours(BatchId, OrganizationId) {
    try {
      await sequelize.query('EXEC [dbo].[usp_TranEmployeeHour_ProcessRecords] @BatchId = :BatchId, @OrganizationId = :OrganizationId', {
        type: QueryTypes.RAW,
        replacements: { BatchId, OrganizationId },
      });
    } catch (error) {
      throw new AppError(EMPLOYEE_HOUR_CREATE_FAILED, error.message);
    }
  }
}
