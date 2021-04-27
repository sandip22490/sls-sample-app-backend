const { addUpdateSecrets, updateFunctionApp, refreshFunctionApp } = require('../../azureUtil');

(async (serverless) => {
  const config = await addUpdateSecrets(serverless);
  if (config) {
    await updateFunctionApp(serverless, config);
    await refreshFunctionApp(serverless);
  }
  // eslint-disable-next-line no-undef
})(serverless);
