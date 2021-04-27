/* Global Imports */
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  BATCH_NOT_FOUND, NOT_FOUND, BATCH_CREATE_FAILED, BATCH_UPDATE_FAILED,
  BATCH_DELETE_FAILED, BATCH_STATUS_UPDATE_FAILED,
} from '../common/errorCodes';
import { TABLES, BATCH_PROCESS_STATUS } from '../common/constant';
import { getInsertedId, getRowCount, getIsoDate } from '../common/utility';

export default class BatchProcess {
  static async list() {
    const batches = await sequelize.query('EXEC [dbo].[sp_BatchProcess_SelectAll]', {
      type: QueryTypes.SELECT,
    });

    return batches;
  }

  static async get(BatchId) {
    const { params, replacements } = buildParams({ BatchId });

    const [batch] = await sequelize.query(`EXEC [dbo].[sp_BatchProcess_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (batch) {
      return batch;
    }

    throw new AppError(BATCH_NOT_FOUND, `Unable to find batch for BatchId: ${BatchId}.`, NOT_FOUND);
  }

  static async getByOrganization(OrganizationId) {
    const { params, replacements } = buildParams({ OrganizationId });

    const batches = await sequelize.query(`EXEC [dbo].[sp_BatchProcess_Select_ByOrganizationId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (batches.length > 0) {
      return batches;
    }

    throw new AppError(BATCH_NOT_FOUND, `Unable to find batches for OrganizationId: ${OrganizationId}.`, NOT_FOUND);
  }

  static async getByBatchToken(BatchTokenId) {
    const { params, replacements } = buildParams({ BatchTokenId });

    const [batch] = await sequelize.query(`EXEC [dbo].[usp_BatchProcess_Select_ByBatchTokenId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (batch) {
      return batch;
    }

    throw new AppError(BATCH_NOT_FOUND, `Unable to find batch for BatchTokenId: ${BatchTokenId}.`, NOT_FOUND);
  }

  static async create(record, UserId) {
    try {
      record.BatchTokenId = uuidv4();
      record.Status = BATCH_PROCESS_STATUS.PENDING;
      record.CreatedBy = UserId;
      record.CreatedDateTime = getIsoDate();
      const { params, replacements } = buildParams(record, TABLES.BATCH_PROCESS);

      const BatchId = await sequelize.query(`EXEC [dbo].[usp_BatchProcess_InsertUpdate] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, BatchId: getInsertedId(BatchId) };
    } catch (error) {
      throw new AppError(BATCH_CREATE_FAILED, error.message);
    }
  }

  static async update(BatchId, UserId = null, record) {
    try {
      record.UpdatedBy = UserId;
      record.UpdatedDateTime = getIsoDate();

      const { params, replacements } = buildParams({ ...record, BatchId }, TABLES.BATCH_PROCESS);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_BatchProcess_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(BATCH_UPDATE_FAILED, `Unable to find record with BatchId: ${BatchId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(BATCH_UPDATE_FAILED, error.message);
    }
  }

  static async rm(BatchId) {
    try {
      const { params, replacements } = buildParams({ BatchId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_BatchProcess_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(BATCH_UPDATE_FAILED, `Unable to find record with BatchId: ${BatchId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(BATCH_DELETE_FAILED, error.message);
    }
  }

  static async updateStatus({
    BatchId, UserId = null, Status, ErrorMessage = null,
  }) {
    try {
      const batch = await BatchProcess.get(BatchId);
      return BatchProcess.update(BatchId, UserId, { ...batch, Status, ErrorMessage });
    } catch (error) {
      throw new AppError(BATCH_STATUS_UPDATE_FAILED, error.message);
    }
  }
}
