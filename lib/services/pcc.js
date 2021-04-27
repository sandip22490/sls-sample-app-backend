import rp from 'request-promise';
import moment from 'moment';

import {
  PCC_AUTH_PASSPHRASE, PCC_BASE_URL, PCC_AUTH_TOKEN, PCC_AUTH_PPK,
  PCC_AUTH_CERT, PCC_AUTH_PEM, DEFAULT_PAGE_SIZE, DAILY_IMPORT_INVTERVAL,
} from '../common/constant';
import AppError from '../common/appError';
import {
  NOT_FOUND, RESOURCE_NOT_FOUND, REQUEST_FAILED, INVALID_REQUEST,
} from '../common/errorCodes';

export default class PCC {
  constructor() {
    this.token = '';
  }

  // eslint-disable-next-line class-methods-use-this
  prepareAuthTokenHeader() {
    const options = {
      key: PCC_AUTH_PPK,
      cert: PCC_AUTH_CERT,
      ca: PCC_AUTH_PEM,
      passphrase: PCC_AUTH_PASSPHRASE,
      rejectUnauthorized: false,
      uri: `${PCC_BASE_URL}/auth/token`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${PCC_AUTH_TOKEN}`,
      },
      form: {
        grant_type: 'client_credentials',
      },
    };

    return options;
  }

  async prepareReqHeaders(reqPath) {
    const token = await this.getToken();
    const options = {
      key: PCC_AUTH_PPK,
      cert: PCC_AUTH_CERT,
      ca: PCC_AUTH_PEM,
      passphrase: PCC_AUTH_PASSPHRASE,
      rejectUnauthorized: false,
      uri: `${PCC_BASE_URL}${reqPath}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    return options;
  }

  async getToken() {
    try {
      const options = this.prepareAuthTokenHeader();
      const response = await rp.post(options);
      if (!this.token) {
        this.token = JSON.parse(response).access_token;
      }

      return this.token;
    } catch (error) {
      const err = PCC.stripError(error);
      throw new AppError(INVALID_REQUEST, `unknown error occured while processing request. reason: ${err.title}`, REQUEST_FAILED);
    }
  }

  async listPatients(orgUuId, facilityId, pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE, status) {
    try {
      console.log(`listPatients orgUuId: ${orgUuId} facilityId: ${facilityId} pageNumber: ${pageNumber} pageSize: ${pageSize}`);
      const reqPath = `/api/public/preview1/orgs/${orgUuId}/patients?facId=${facilityId}&pageSize=${pageSize}&page=${pageNumber}&${status ? `patientStatus=${status}` : ''}`;
      const options = { ...await this.prepareReqHeaders(reqPath) };

      return JSON.parse(await rp.get(options));
    } catch (error) {
      const err = PCC.stripError(error);
      if (err.status === NOT_FOUND) {
        throw new AppError(RESOURCE_NOT_FOUND, `Unable to list patients for organizationId: ${orgUuId}`, NOT_FOUND);
      }
      throw new AppError(INVALID_REQUEST, `unknown error occured while processing request. reason: ${err.title}`, REQUEST_FAILED);
    }
  }

  async listFacility(orgUuId, pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE) {
    try {
      console.log(`listFacility orgUuId: ${orgUuId} pageNumber: ${pageNumber} pageSize: ${pageSize}`);
      const reqPath = `/api/public/preview1/orgs/${orgUuId}/facs?pageSize=${pageSize}&page=${pageNumber}`;
      const options = { ...await this.prepareReqHeaders(reqPath) };

      return JSON.parse(await rp.get(options));
    } catch (error) {
      const err = PCC.stripError(error);
      if (err.status === NOT_FOUND) {
        throw new AppError(RESOURCE_NOT_FOUND, `Unable to list facilities for organizationId: ${orgUuId}`, NOT_FOUND);
      }
      throw new AppError(INVALID_REQUEST, `unknown error occured while processing request. reason: ${err.title}`, REQUEST_FAILED);
    }
  }

  async getFacility(orgUuId, facilityId) {
    try {
      const reqPath = `/api/public/preview1/orgs/${orgUuId}/facs/${facilityId}`;
      const options = { ...await this.prepareReqHeaders(reqPath) };

      return JSON.parse(await rp.get(options));
    } catch (error) {
      const err = PCC.stripError(error);
      if (err.status === NOT_FOUND) {
        throw new AppError(RESOURCE_NOT_FOUND, `Unable to get facility details with organizationId: ${orgUuId} and facilityId: ${facilityId}`, NOT_FOUND);
      }
      throw new AppError(INVALID_REQUEST, `unknown error occured while processing request. reason: ${err.title}`, REQUEST_FAILED);
    }
  }

  static stripError({ message: errMessage }) {
    let err = errMessage.substr(errMessage.indexOf('"'), errMessage.length - (errMessage.indexOf('"')));
    err = JSON.parse((JSON.parse(err)));
    console.log(JSON.stringify(err));
    return err.errors[0];
  }


  static getDefaultStarDate() {
    return moment.utc().subtract(DAILY_IMPORT_INVTERVAL.PATIENT, 'd');
  }

  static getDefaultEndDate() {
    return moment.utc();
  }

  static formatDate(date, format = 'MM/DD/YYYY') {
    return moment(date).format(format);
  }
}
