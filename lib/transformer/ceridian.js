import moment from 'moment';

export function transformEmployee(records, OrganizationId) {
  return records.map((record) => ({
    OrganizationId,
    EmployeeUuId: record.EmployeePaySummary_EmployeeId,
    EmployeeNumber: record.EmployeeEmploymentStatus_EmployeeNumber,
    EmployeeName: record.Employee_DisplayName,
    FirstName: record.Employee_DisplayName.split(',')[1].trim(),
    LastName: record.Employee_DisplayName.split(',')[0].trim(),
    DepartmentId: record.Department_DepartmentId,
    JobId: record.DeptJob_DeptJobId,
    HireDate: record.Employee_HireDate,
    OrgUnitXRefCode: record.OrgUnit_XRefCode,
    EmployeeStatus: record.EmploymentStatusGroup_ShortName,
  }));
}

export function transformHour(records, OrganizationId) {
  return records.map((record) => ({
    OrganizationId,
    EmployeeUuId: record.EmployeePaySummary_EmployeeId,
    DepartmentUuId: record.Department_DepartmentId,
    JobUuId: record.DeptJob_DeptJobId,
    OrgUnitXRefCode: record.OrgUnit_XRefCode,
    HourDate: record.EmployeePaySummary_BusinessDate,
    WorkHours: record.EmployeePaySummary_NetHours,
    PayCode: record.PayAdjCode_ShortName,
    FromDateTime: record.EmployeePaySummary_TimeStart ? moment(record.EmployeePaySummary_TimeStart).format('MM/DD/YYYY HH:mm:ss') : null,
    ToDateTime: record.EmployeePaySummary_TimeEnd ? moment(record.EmployeePaySummary_TimeEnd).format('MM/DD/YYYY HH:mm:ss') : null,
    PayCategory: record.PayCategory_ShortName,
    LaborCode: record.EmployeePaySummary_LaborMetricsCode1,
    Amount: record.EmployeePaySummary_PayAmount,
  }));
}

export function transformJob(records) {
  return records.map((record) => ({
    OrgUnitXRefCode: record.OrgUnit_XRefCode,
    DepartmentUuId: record.Department_DepartmentId,
    JobUuId: record.DeptJob_DeptJobId,
    Job: record.DeptJob_ShortName,
  }));
}

export function transformDepartment(records) {
  return records.map((record) => ({
    DepartmentUuId: record.Department_DepartmentId,
    Department: record.Department_ShortName,
  }));
}
