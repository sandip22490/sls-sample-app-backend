import moment from 'moment';

export function transformFacility(records) {
  return records.map((record) => ({
    facilityCode: record.facilityCode,
    facId: record.facId,
    facilityName: record.facilityName,
    addressLine: record.addressLine1,
    city: record.city,
    state: record.state,
    healthType: record.healthType,
  }));
}
