const { getSPObjectId, getUserObjectId } = require('../../azureUtil');

(async (serverless) => {
  const { spObjectId, userObjectId } = serverless.service.provider.armTemplate.parameters;

  let objectIds = [];
  if ((spObjectId && spObjectId.value === true) || (userObjectId && userObjectId.value === true)) {
    objectIds = await Promise.all([
      getSPObjectId(serverless),
      getUserObjectId(serverless),
    ]);
  }

  delete serverless.service.provider.armTemplate.parameters.spObjectId;
  delete serverless.service.provider.armTemplate.parameters.userObjectId;
  serverless.service.provider.armTemplate.parameters.objectIds = { value: objectIds };

  // eslint-disable-next-line no-undef
})(serverless);
