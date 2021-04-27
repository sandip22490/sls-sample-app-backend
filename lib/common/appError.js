import { REQUEST_FAILED } from './errorCodes';

export default class AppError extends Error {
  constructor(errorCode, message, httpStatusCode = REQUEST_FAILED) {
    super(message);

    const [code, meaning] = Object.entries(errorCode)[0];

    this.name = this.constructor.name;
    this.code = code;
    this.meaning = meaning;
    this.message = message;
    this.httpStatusCode = httpStatusCode;
  }
}
