/* Global Imports */
import { QueryTypes } from 'sequelize';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import { DEPARTMENT_NOT_FOUND, NOT_FOUND, DEPARTMENT_CREATE_FAILED, DEPARTMENT_UPDATE_FAILED, DEPARTMENT_DELETE_FAILED } from '../common/errorCodes';
import { TABLES } from '../common/constant';
import { getInsertedId, getRowCount } from '../common/utility';

export default class Department {
  static async list() {
    const departments = await sequelize.query('EXEC [dbo].[sp_Departments_SelectAll]', {
      type: QueryTypes.SELECT,
    });

    return departments;
  }

  static async getByOrganization(OrganizationId) {
    const { params, replacements } = buildParams({ OrganizationId });

    const department = await sequelize.query(`EXEC [dbo].[sp_Department_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (department) {
      return department;
    }

    throw new AppError(DEPARTMENT_NOT_FOUND, `Department with DepartmentId: ${DepartmentId} does not exists.`, NOT_FOUND);
  }

  static async get(DepartmentId) {
    const { params, replacements } = buildParams({ DepartmentId });

    const [department] = await sequelize.query(`EXEC [dbo].[sp_Department_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (department) {
      return department;
    }

    throw new AppError(DEPARTMENT_NOT_FOUND, `Department with DepartmentId: ${DepartmentId} does not exists.`, NOT_FOUND);
  }

  static async create(record) {
    try {
      const { params, replacements } = buildParams(record, TABLES.DEPARTMENT);

      const DepartmentId = await sequelize.query(`EXEC [dbo].[sp_Department_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, DepartmentId: getInsertedId(DepartmentId) };
    } catch (error) {
      throw new AppError(DEPARTMENT_CREATE_FAILED, error.message);
    }
  }

  static async update(DepartmentId, record) {
    try {
      const { params, replacements } = buildParams({ DepartmentId, ...record }, TABLES.DEPARTMENT);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Department_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(DEPARTMENT_UPDATE_FAILED, `Unable to find record with DepartmentId: ${DepartmentId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(DEPARTMENT_UPDATE_FAILED, error.message);
    }
  }

  static async rm(DepartmentId) {
    try {
      const { params, replacements } = buildParams({ DepartmentId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Department_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(DEPARTMENT_DELETE_FAILED, `Unable to find record with DepartmentId: ${DepartmentId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(DEPARTMENT_DELETE_FAILED, error.message);
    }
  }

  static async bulkInsert(records = [], OrganizationId) {
    try {
      const insertedId = await sequelize.query('EXEC [dbo].[usp_Department_InsertUpdate] @json = :json, @OrganizationId = :OrganizationId, @DepartmentId = :DepartmentId', {
        type: QueryTypes.INSERT,
        replacements: { json: JSON.stringify(records), OrganizationId, DepartmentId: null },
      });

      return { insertedId: getInsertedId(insertedId) };
    } catch (error) {
      throw new AppError(DEPARTMENT_CREATE_FAILED, error.message);
    }
  }
}
