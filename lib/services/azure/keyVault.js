const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

module.exports = class KeyVault {
  constructor(keyVaultName) {
    this.keyVaultName = keyVaultName;
    this.vaultUrl = `https://${this.keyVaultName}.vault.azure.net`;
  }

  async createSecrete(secretName, secretValue) {
    try {
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(this.vaultUrl, credential);
      return client.setSecret(secretName, secretValue);
    } catch (error) {
      console.log(`Failed to create Secret. Reason: ${error.message}`);
      return null;
    }
  }

  async getSecrete(secretName) {
    try {
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(this.vaultUrl, credential);
      return client.getSecret(secretName);
    } catch (error) {
      console.log(`Failed to get Secret. Reason: ${error.message}`);
      return null;
    }
  }
};
