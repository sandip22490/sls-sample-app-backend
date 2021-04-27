/* HTTP Status Codes */
export const OK = 200;
export const CREATED = 201;
export const REQUEST_FAILED = 400;
export const NOT_FOUND = 404;
export const REQUEST_CONFLICT = 409;

/* Generic Error Codes */
export const UNKNOWN_ERROR = { 9901: 'Unknown Error Occured' };
export const FAILED_TO_SEND_EMAIL = { 9902: 'Failed to send email' };
export const REQUEST_VALIDATION_FAILED = { 9903: 'Failed to validate request' };

/* Organizaion Error Codes */
export const ORG_CREATE_FAILED = { 1101: 'Failed to create organization' };
export const ORG_UPDATE_FAILED = { 1102: 'Failed to update organization' };
export const ORG_DELETE_FAILED = { 1103: 'Failed to delete organization' };
export const ORG_NOT_FOUND = { 1104: 'Unable to find organization' };

/* Invitation Error Codes */
export const INVITATION_CREATE_FAILED = { 1201: 'Failed to create invitation' };
export const INVITATION_UPDATE_FAILED = { 1202: 'Failed to update invitation' };
export const INVITATION_DELETE_FAILED = { 1203: 'Failed to delete invitation' };
export const INVITATION_NOT_FOUND = { 1204: 'Unable to find invitation' };
export const INVITATION_CODE_EXPIRED = { 1205: 'Invitation code is expired, Please contact your system administrator' };
export const INVITATION_CODE_INVALID = { 1206: 'Invitation code is invalid. Please use valid code' };
export const INVITATION_CODE_USED = { 1207: 'Invitation code is already uesd. Please use valid code' };
export const INVITATION_RESEND_FAILED = { 1208: 'Failed to resend invitation' };

/* Group Error Codes */
export const GROUP_CREATE_FAILED = { 1301: 'Failed to create group' };
export const GROUP_UPDATE_FAILED = { 1302: 'Failed to update group' };
export const GROUP_DELETE_FAILED = { 1303: 'Failed to delete group' };
export const GROUP_NOT_FOUND = { 1304: 'Unable to find group' };

/* Group Policy Error Codes */
export const GROUP_POLICY_CREATE_FAILED = { 1401: 'Failed to create group policy' };
export const GROUP_POLICY_UPDATE_FAILED = { 1402: 'Failed to update group policy' };
export const GROUP_POLICY_DELETE_FAILED = { 1403: 'Failed to delete group policy' };
export const GROUP_POLICY_NOT_FOUND = { 1404: 'Unable to find group policy' };

/* Group User Error Codes */
export const GROUP_USER_CREATE_FAILED = { 1501: 'Failed to create group user' };
export const GROUP_USER_UPDATE_FAILED = { 1502: 'Failed to update group user' };
export const GROUP_USER_DELETE_FAILED = { 1503: 'Failed to delete group user' };
export const GROUP_USER_NOT_FOUND = { 1504: 'Unable to find group user' };

/* User Error Codes */
export const USER_CREATE_FAILED = { 1601: 'Failed to create user' };
export const USER_UPDATE_FAILED = { 1602: 'Failed to update user' };
export const USER_DELETE_FAILED = { 1603: 'Failed to delete user' };
export const USER_NOT_FOUND = { 1604: 'Unable to find user' };

/* PCC Service Error Codes */
export const RESOURCE_NOT_FOUND = { 1701: 'Unable to find requested resource' };
export const INVALID_REQUEST = { 1702: 'Unable to complete the request' };

/* Resident Error Codes */
export const RESIDENT_CREATE_FAILED = { 1801: 'Failed to create resident' };
export const RESIDENT_UPDATE_FAILED = { 1802: 'Failed to update resident' };
export const RESIDENT_DELETE_FAILED = { 1803: 'Failed to delete resident' };
export const RESIDENT_NOT_FOUND = { 1804: 'Unable to get resident' };

/* Batch Process Error Codes */
export const BATCH_CREATE_FAILED = { 1901: 'Failed to create batch record' };
export const BATCH_UPDATE_FAILED = { 1902: 'Failed to update batch record' };
export const BATCH_DELETE_FAILED = { 1903: 'Failed to delete batch record' };
export const BATCH_NOT_FOUND = { 1904: 'Unable to get batch record' };
export const BATCH_STATUS_UPDATE_FAILED = { 1905: 'Failed to update batch record status' };

/* Employee Error Codes */
export const EMPLOYEE_CREATE_FAILED = { 2101: 'Failed to create employee' };
export const EMPLOYEE_UPDATE_FAILED = { 2102: 'Failed to update employee' };
export const EMPLOYEE_DELETE_FAILED = { 2103: 'Failed to delete employee' };
export const EMPLOYEE_NOT_FOUND = { 2104: 'Unable to get employee' };

/* Department Error Codes */
export const DEPARTMENT_CREATE_FAILED = { 2201: 'Failed to create department' };
export const DEPARTMENT_UPDATE_FAILED = { 2202: 'Failed to update department' };
export const DEPARTMENT_DELETE_FAILED = { 2203: 'Failed to delete department' };
export const DEPARTMENT_NOT_FOUND = { 2204: 'Unable to get department' };

/* Job Error Codes */
export const JOB_CREATE_FAILED = { 2301: 'Failed to create job' };
export const JOB_UPDATE_FAILED = { 2302: 'Failed to update job' };
export const JOB_DELETE_FAILED = { 2303: 'Failed to delete job' };
export const JOB_NOT_FOUND = { 2304: 'Unable to get job' };

/* Employee Hour Error Codes */
export const EMPLOYEE_HOUR_CREATE_FAILED = { 2401: 'Failed to create employee hour' };
export const EMPLOYEE_HOUR_UPDATE_FAILED = { 2402: 'Failed to update employee hour' };
export const EMPLOYEE_HOUR_DELETE_FAILED = { 2403: 'Failed to delete employee hour' };
export const EMPLOYEE_HOUR_NOT_FOUND = { 2404: 'Unable to get employee hour' };

/* Schedule Error Codes */
export const SCHEDULE_CREATE_FAILED = { 2401: 'Failed to create schedule' };
export const SCHEDULE_UPDATE_FAILED = { 2402: 'Failed to update schedule' };
export const SCHEDULE_DELETE_FAILED = { 2403: 'Failed to delete schedule' };
export const SCHEDULE_NOT_FOUND = { 2404: 'Unable to get schedule' };
export const SCHEDULE_METRICS_NOT_FOUND = { 2405: 'No data found for schedule metrics' };

/* Facility Error Codes */
export const FACILITY_CREATE_FAILED = { 2401: 'Failed to create facility' };
export const FACILITY_UPDATE_FAILED = { 2402: 'Failed to update facility' };
export const FACILITY_DELETE_FAILED = { 2403: 'Failed to delete facility' };
export const FACILITY_NOT_FOUND = { 2404: 'Unable to get facility' };

/* paycode Error Codes */
export const PAYCODE_CREATE_FAILED = { 2501: 'Failed to create paycode' };
export const PAYCODE_UPDATE_FAILED = { 2502: 'Failed to update paycode' };
export const PAYCODE_DELETE_FAILED = { 2503: 'Failed to delete paycode' };
export const PAYCODE_NOT_FOUND = { 2504: 'Unable to get paycode' };

/* census Error Codes */
export const CENSUS_CREATE_FAILED = { 2601: 'Failed to create census' };
export const CENSUS_UPDATE_FAILED = { 2702: 'Failed to update census' };
export const CENSUS_DELETE_FAILED = { 2803: 'Failed to delete census' };
export const CENSUS_NOT_FOUND = { 2904: 'Unable to get census' };
