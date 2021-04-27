import moment from 'moment';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

import {
  DATE_OP, JWT_PRIVATE_KEY, JWT_PRIVATE_KEY_ID, JWT_ENCRYPTION_ALG,
  JWT_EXPIRY, JWT_ISSUER, B2C_APPLICATION_ID, B2C_SIGNUP_POLICY, B2C_TENANT_NAME,
  B2C_REDIRECT_URI, INVITATION_LINK, FIELDS_TO_MASK, MASKING_TEXT, IS_LOCAL,
} from './constant';

export const getIsoDate = ({
  op, years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0,
} = {}) => {
  if (op === DATE_OP.ADD) {
    return moment().add({
      years, months, weeks, days, hours, minutes, seconds,
    }).toISOString();
  }

  if (op === DATE_OP.SUBSCTRACT) {
    return moment().subtract({
      years, months, weeks, days, hours, minutes, seconds,
    }).toISOString();
  }

  return moment().toISOString();
};

export const dateInPast = (dateToCheck) => moment(dateToCheck).diff(moment()) <= 0;

export const getInsertedId = (id) => {
  [[id]] = id;
  return Object.values(id)[0];
};

export const getRowCount = (rowCount) => {
  try {
    [[rowCount]] = rowCount;
  } catch (error) {
    [rowCount] = rowCount;
  }

  return Object.values(rowCount)[0];
};

export const regexReplace = (str, replacements = {}) => {
  Object.keys(replacements).forEach((key) => {
    str = str.replace(new RegExp(`{${key}}`, 'g'), replacements[key]);
  });
  return str;
};

export const createInvitationLink = (invitationCode, email) => {
  const ID_TOKEN_HINT = jwt.sign(
    {
      invitationCode,
      email,
    },
    JWT_PRIVATE_KEY,
    {
      audience: B2C_APPLICATION_ID,
      issuer: JWT_ISSUER,
      expiresIn: JWT_EXPIRY,
      algorithm: JWT_ENCRYPTION_ALG,
      keyid: JWT_PRIVATE_KEY_ID,
    },
  );

  const replacements = {
    B2C_TENANT_NAME,
    B2C_SIGNUP_POLICY,
    B2C_APPLICATION_ID,
    NONCE: parseInt((Math.random() * 10000000) + 1, 10),
    B2C_REDIRECT_URI: encodeURI(B2C_REDIRECT_URI),
    ID_TOKEN_HINT,
  };

  return regexReplace(INVITATION_LINK, replacements);
};

export const transformAccessPolicy = (accessPolicy) => accessPolicy.reduce((prev, curr) => {
  prev[curr.PolicyArea] = curr.AccessTypeId;
  return prev;
}, {});

export const maskFields = (key, val) => {
  if (FIELDS_TO_MASK.includes(key) && val) {
    return MASKING_TEXT;
  }
  return val;
};

export const writeLog = (message) => {
  if (IS_LOCAL) {
    const logPath = path.join(path.resolve('.'), '.log');

    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath);
    }

    const stream = fs.createWriteStream(path.join(logPath, `${moment().format('DD-MM-YYYY')}.txt`), { flags: 'a' });
    stream.write(`${new Date().toISOString()} - ${message}\n`);
  }
};

export const sortArrOfObjByDate = (arr, sortingField, asc = true) => arr.sort((a, b) => {
  if (asc) return moment.utc(a[sortingField]) - moment.utc(b[sortingField]);
  return moment.utc(b[sortingField]) - moment.utc(a[sortingField]);
});
