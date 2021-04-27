const { exec } = require('child_process');
const { compact } = require('lodash');

const KeyVault = require('./lib/services/azure/keyVault');

const secretConfigValue = '@Microsoft.KeyVault(SecretUri={URL})';

module.exports.getSPObjectId = (serverless) => new Promise((resolve, reject) => {
  serverless.cli.log(`Azure Util: Getting objectId for service principal: ${process.env.AZURE_CLIENT_ID}`);

  exec(`az ad sp show --id ${process.env.AZURE_CLIENT_ID}`, (error, data) => {
    if (error) {
      serverless.cli.log(`Azure Util: Failed to get objectId for service principal. Reason: ${error.message}`);
      reject();
    } else {
      resolve(JSON.parse(data).objectId);
    }
  });
});

module.exports.getUserObjectId = (serverless) => new Promise((resolve, reject) => {
  serverless.cli.log(`Azure Util: Getting objectId for Azure AD User: ${process.env.AZURE_AD_EMAIL}`);

  exec(`az ad user show --id ${process.env.AZURE_AD_EMAIL}`, (error, data) => {
    if (error) {
      serverless.cli.log(`Azure Util: Failed to get objectId for Azure AD User. Reason: ${error.message}`);
      reject();
    } else {
      resolve(JSON.parse(data).objectId);
    }
  });
});

module.exports.refreshFunctionApp = (serverless) => new Promise((resolve, reject) => {
  const {
    functionApp: { name: functionAppName },
    resourceGroup: resourceGroupName,
  } = serverless.service.provider;

  serverless.cli.log(`Azure Util: Refreshing function app: ${functionAppName}`);

  exec(`az functionapp update --name ${functionAppName} --resource-group ${resourceGroupName}`, (error, data) => {
    if (error) {
      serverless.cli.log(`Azure Util: Failed to refresh functionApp. Reason: ${error.message}`);
      reject();
    } else {
      resolve(JSON.parse(data).objectId);
    }
  });
});

module.exports.updateFunctionApp = (serverless, config) => new Promise((resolve, reject) => {
  const {
    functionApp: { name: functionAppName },
    resourceGroup: resourceGroupName,
  } = serverless.service.provider;

  serverless.cli.log(`Azure Util: Updating function app: ${functionAppName} with config: ${config}`);

  exec(`az functionapp config appsettings set --name ${functionAppName} --resource-group ${resourceGroupName} --settings ${config}`, (error, data) => {
    if (error) {
      serverless.cli.log(`Azure Util: Failed to update functionApp. Reason: ${error}`);
      reject();
    } else {
      resolve(JSON.parse(data).objectId);
    }
  });
});

module.exports.addUpdateSecrets = async (serverless) => {
  const {
    custom: { appSecrets: secrets },
    provider: { keyVault: { name: keyVaultName } },
  } = serverless.service;
  let config = '';

  if (secrets && keyVaultName) {
    const kv = new KeyVault(keyVaultName);
    const resp = compact(await Promise.all(secrets.map(async (s) => {
      let secret;

      try {
        secret = await kv.getSecrete(s.kvName);
        if (secret.value !== s.value) {
          serverless.cli.log(`Azure Util: Different value exist for secret: ${s.kvName} in key vault trying to update`);
          secret = await kv.createSecrete(s.kvName, s.value);
        }
      } catch (error) {
        if (error.code === 'SecretNotFound') {
          secret = await kv.createSecrete(s.kvName, s.value);
        } else {
          serverless.cli.log(`Azure Util: Failed to get/set secret: ${s.kvName}. Reason, ${error}`);
          throw error;
        }
      }

      return { name: s.appName, value: `${secretConfigValue}`.replace('{URL}', secret.properties.id) };
    })));

    config = resp.reduce((prev, curr) => {
      prev += ` "${curr.name}=${curr.value}"`;
      return prev;
    }, '');
  } else {
    serverless.cli.log('Azure Util: No appSecrets defined under service custom settings. Skipping key vault secret update');
  }

  return config.trim();
};
