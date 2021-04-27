import {
  REQUEST_FAILED, OK, UNKNOWN_ERROR, REQUEST_CONFLICT,
} from './errorCodes';
import AppError from './appError';

export const success = ({ status = OK, body = {} }) => ({
  status,
  headers: {
    'Content-Type': 'application/json',
  },
  body,
});

export const fail = ({ status = REQUEST_FAILED, error = new AppError(UNKNOWN_ERROR) }) => ({
  status: error.httpStatusCode || status,
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    message: error.message || error,
    code: error.code,
    meaning: error.meaning,
  },
});

export const b2cSuccess = ({ status = OK, body }) => ({
  status,
  headers: {
    'Content-Type': 'application/json',
  },
  body,
});

export const b2cFail = ({ status = REQUEST_CONFLICT, error = new AppError(UNKNOWN_ERROR) }) => ({
  status,
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    version: '1.0.0',
    status,
    userMessage: error.message || error,
    code: error.code,
    developerMessage: error.message,
  },
});
