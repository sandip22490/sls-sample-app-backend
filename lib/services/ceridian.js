import rp from 'request-promise';
import moment from 'moment';

import {
  CERIDIAN_BASE_URL, CERIDIAN_API_USER, CERIDIAN_API_PASSWORD,
  CERIDIAN_QUERY_PARAM, DAILY_IMPORT_INVTERVAL,
} from '../common/constant';
import AppError from '../common/appError';
import {
  NOT_FOUND, RESOURCE_NOT_FOUND, REQUEST_FAILED, INVALID_REQUEST,
} from '../common/errorCodes';

export default class Ceridian {
  constructor() {
    this.authorization = `Basic ${Buffer.from(`${CERIDIAN_API_USER}:${CERIDIAN_API_PASSWORD}`).toString('base64')}`;
  }

  async prepareReqHeaders(reqPath, next = undefined) {
    if (next) {
      reqPath = next.replace(CERIDIAN_BASE_URL, '');
    }

    const options = {
      uri: `${next || `${CERIDIAN_BASE_URL}${reqPath}`}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authorization,
      },
    };

    return options;
  }

  async listEmployees(clientNamespace, next = undefined, startDate, endDate) {
    try {
      console.log(`listEmployees clientNamespace: ${clientNamespace} next: ${next} startDate: ${startDate} endDate: ${endDate} `);

      const reqPath = `/${clientNamespace}/v1/Reports/SIQEmployees?${CERIDIAN_QUERY_PARAM.START_DATE}=${startDate}&${CERIDIAN_QUERY_PARAM.END_DATE}=${endDate} `;
      const options = { ...await this.prepareReqHeaders(reqPath, next) };

      return JSON.parse(await rp.get(options));
    } catch (error) {
      if (error.status === NOT_FOUND) {
        throw new AppError(RESOURCE_NOT_FOUND, `Unable to list employee for clientNamespace: ${clientNamespace} `, NOT_FOUND);
      }

      throw new AppError(INVALID_REQUEST, `unknown error occured while processing request.reason: ${Ceridian.getErrorMessage(error)} `, REQUEST_FAILED);
    }
  }

  async listDepartmentsJob(clientNamespace, next = undefined, startDate, endDate) {
    try {
      console.log(`listDepartmentsJob clientNamespace: ${clientNamespace} next: ${next} startDate: ${startDate} endDate: ${endDate} `);

      const reqPath = `/${clientNamespace}/v1/Reports/SIQPositions?${CERIDIAN_QUERY_PARAM.START_DATE}=${startDate}&${CERIDIAN_QUERY_PARAM.END_DATE}=${endDate} `;
      const options = { ...await this.prepareReqHeaders(reqPath, next) };

      return JSON.parse(await rp.get(options));
    } catch (error) {
      if (error.status === NOT_FOUND) {
        throw new AppError(RESOURCE_NOT_FOUND, `Unable to list Department/Job for clientNamespace: ${clientNamespace} `, NOT_FOUND);
      }
      throw new AppError(INVALID_REQUEST, `unknown error occured while processing request.reason: ${Ceridian.getErrorMessage(error)} `, REQUEST_FAILED);
    }
  }

  async listEmployeeHourJob(clientNamespace, next = undefined, startDate, endDate) {
    try {
      console.log(`listEmployeeHourJob clientNamespace: ${clientNamespace} next: ${next} startDate: ${startDate} endDate: ${endDate} `);

      const reqPath = `/${clientNamespace}/v1/Reports/SIQHours?${CERIDIAN_QUERY_PARAM.START_DATE}=${startDate}&${CERIDIAN_QUERY_PARAM.END_DATE}=${endDate} `;
      const options = { ...await this.prepareReqHeaders(reqPath, next) };

      return JSON.parse(await rp.get(options));
    } catch (error) {
      if (error.status === NOT_FOUND) {
        throw new AppError(RESOURCE_NOT_FOUND, `Unable to list employee hours for clientNamespace: ${clientNamespace} `, NOT_FOUND);
      }
      throw new AppError(INVALID_REQUEST, `unknown error occured while processing request.reason: ${Ceridian.getErrorMessage(error)} `, REQUEST_FAILED);
    }
  }

  static getDefaultStarDate() {
    return moment.utc().subtract(DAILY_IMPORT_INVTERVAL.EMPLOYEE, 'd');
  }

  static getDefaultEndDate() {
    return moment.utc();
  }

  static formatDate(date, format = 'MM/DD/YYYY') {
    return moment(date).format(format);
  }

  static getErrorMessage(error) {
    if (error && error.processResults && error.processResults.message) {
      return error.processResults.message;
    }

    if (error && error.message) {
      return error.message;
    }

    return error;
  }
}
