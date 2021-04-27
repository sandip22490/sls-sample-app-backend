import { decode } from 'jsonwebtoken';

export default class RequestParser {
  constructor(context, request) {
    this.context = context;
    this.request = request;
    this.init();
  }

  init() {
    console.log = this.context.log;
    console.info = this.context.log.info;
    console.warn = this.context.log.warn;
    console.error = this.context.log.error;
    this.decodedToken = this.decryptToken();
  }

  getHttpMethod() {
    return this.request.method;
  }

  getHeader(headerName = '') {
    if (headerName) {
      return this.request.headers ? this.request.headers[headerName] : undefined;
    }
    return this.request.headers;
  }

  decryptToken() {
    const authorization = this.getHeader('authorization') || this.getHeader('Authorization');
    return authorization ? decode(authorization.split(' ')[1], { json: true }) : {};
  }

  getReqParam(paramName = '', toInt = false, toBool = false) {
    if (paramName) {
      if (toInt) {
        return parseInt(this.request.params[paramName], 10);
      }

      if (toBool) {
        return Boolean(this.request.params[paramName]);
      }

      return this.request.params[paramName];
    }
    return this.request.params;
  }

  getQueryParam(paramName = '', toInt = false, toBool = false) {
    if (paramName) {
      if (toInt) {
        return parseInt(this.request.query[paramName], 10);
      }

      if (toBool) {
        return Boolean(this.request.query[paramName]);
      }

      return this.request.query[paramName];
    }
    return this.request.query;
  }

  getReqPath() {
    return new URL(this.request.url).pathname;
  }

  getBody() {
    return this.request.body;
  }

  getUserId() {
    return this.decodedToken && this.decodedToken.userId;
  }

  getSubId() {
    return this.decodedToken && this.decodedToken.sub;
  }

  getOrganizationId() {
    return this.decodedToken && this.decodedToken.organizationId;
  }

  getGroupId() {
    return this.decodedToken && this.decodedToken.groupId;
  }

  getAccessPolicy() {
    return this.decodedToken && this.decodedToken.accessPolicy ? JSON.parse(this.decodedToken.accessPolicy) : undefined;
  }

  getFunctionName() {
    return this.context.executionContext.functionName;
  }

  getTimerBindingData() {
    const { bindingData, bindingDefinitions } = this.context;
    const isFullRefresh = bindingDefinitions[0].name.toUpperCase().includes('FULLREFRESH');
    return { invocationId: bindingData.invocationId, time: bindingData.timerTrigger, timerName: bindingDefinitions[0].name, isFullRefresh };
  }

  getDefaultParams() {
    return {
      httpMethod: this.getHttpMethod(),
      reqPath: this.getReqPath(),
      userId: this.getUserId(),
      subId: this.getSubId(),
      organizationId: this.getOrganizationId(),
      groupId: this.getGroupId(),
      accessPolicy: this.getAccessPolicy(),
      functionName: this.getFunctionName(),
    };
  }
}
