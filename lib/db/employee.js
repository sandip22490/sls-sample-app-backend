/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  EMPLOYEE_NOT_FOUND, NOT_FOUND, EMPLOYEE_CREATE_FAILED, EMPLOYEE_UPDATE_FAILED, EMPLOYEE_DELETE_FAILED,
} from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getInsertedId, getRowCount } from '../common/utility';

export default class Employee {
  static async list() {
    const employees = await sequelize.query('EXEC [dbo].[sp_Employees_SelectAll]', {
      type: QueryTypes.SELECT,
    });

    return employees;
  }

  static async get(EmployeeId) {
    const { params, replacements } = buildParams({ EmployeeId });

    const [employee] = await sequelize.query(`EXEC [dbo].[sp_Employee_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (employee) {
      return employee;
    }

    throw new AppError(EMPLOYEE_NOT_FOUND, `employee with EmployeeId: ${EmployeeId} does not exists.`, NOT_FOUND);
  }

  static async getByFacility(OrganizationId, FacilityId, DepartmentId) {
    const { params, replacements } = buildParams({ OrganizationId, FacilityId, DepartmentId });

    const employee = await sequelize.query(`EXEC [dbo].[usp_Employee_Select_ByFacilityId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (employee) {
      return employee;
    }

    throw new AppError(EMPLOYEE_NOT_FOUND, `employee with OrganizationId: ${OrganizationId} and FacilityId: ${FacilityId} does not exists.`, NOT_FOUND);
  }

  static async create(record) {
    try {
      const { params, replacements } = buildParams(record, TABLES.EMPLOYEE);

      const EmployeeId = await sequelize.query(`EXEC [dbo].[sp_Employee_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, EmployeeId: getInsertedId(EmployeeId) };
    } catch (error) {
      throw new AppError(EMPLOYEE_CREATE_FAILED, error.message);
    }
  }

  static async update(EmployeeId, record) {
    try {
      const { params, replacements } = buildParams({ EmployeeId, ...record }, TABLES.EMPLOYEE);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Employee_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(EMPLOYEE_UPDATE_FAILED, `Unable to find record with EmployeeId: ${EmployeeId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(EMPLOYEE_UPDATE_FAILED, error.message);
    }
  }

  static async rm(EmployeeId) {
    try {
      const { params, replacements } = buildParams({ EmployeeId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Employee_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(EMPLOYEE_UPDATE_FAILED, `Unable to find record with EmployeeId: ${EmployeeId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(EMPLOYEE_DELETE_FAILED, error.message);
    }
  }

  static async bulkInsert(records = [], OrganizationId) {
    try {
      const insertedId = await sequelize.query('EXEC [dbo].[usp_Employee_InsertUpdate] @json = :json, @OrganizationId = :OrganizationId, @EmployeeId = :EmployeeId', {
        type: QueryTypes.INSERT,
        replacements: { json: JSON.stringify(records), OrganizationId, EmployeeId: null },
      });

      return { insertedId: getInsertedId(insertedId) };
    } catch (error) {
      throw new AppError(EMPLOYEE_CREATE_FAILED, error.message);
    }
  }
}
