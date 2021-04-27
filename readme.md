 Starting SampleApp Serverless Development

SampleApp backend uses [serverless framework](https://www.serverless.com/) to build the back-end infrastructure and related components(functions, apim, storage account etc..) on Azure using community plugins build by cloud service provider and serverless team. 

---

## Introduction

Purpose of this document is to get familier your self with tools and framework used for end-to-end development & deployment of SampleApp backend. Provide details on how to setup local development, test it and deploy.

> __Important:__ This document is `work in progress` and subject to change.

---

## Pre-Requisite

- NodeJS Version 12x
- Git
- Git GUI Client
- Azure CLI 
- Valid Azure Subscription and user with Subscription `Owner` role
- VS Code Editor with following plugins -
  - Azure Resource Manager - [link](https://marketplace.visualstudio.com/items?itemName=msazurermtools.azurerm-vscode-tools)
  - ESLint - [link](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - YAML- [link](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)
  - GitLens [link](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) - Useful if you do not have any supported GUI client and you want VSCode inline support for Git history and most of the git commands.
- Serverless Framework npm package installed globally
  - `npm install -g serverless@1.83.0`
  - Please refere this [link](https://www.serverless.com/framework/docs/providers/azure) to get more details and how to use the framework with the context of Azure.  

---

## Setup Development Environment
- Clone Backend SampleApp NodeJs repo on your local machine
- `git clone https://github.com/sandip22490/sls-sample-app-backend.git`
- Set up your working branch and initialize with Git Flow workflow
- `cd YOUR_PROJECT_DIRECTORY` and perform `npm install` - this will install necessary dependancies mentioned in the your `project.json` file. It will take some time to complete as one of the dependancy `serverless-azure-function` will install Azure Core Tools for .Net
- Create Service Principal using Azure CLI with below commands, which will be than utilized by serverless framework to interact with various API calls to Azure
  - Open `CMD` or `Terminal` and run below commands 
  - `az login` - This will open up your default browser and ask you to login. Login with you subscription owner user account. On successfull login it will list all your subscription on `CMD` or `Terminal`
  - alternativly you can use `az account list ` to list all your subscriptions associated with login you performed in previous step.
  - run `az account set -s <SubscriptionId>` replace `<SubscriptionId>` with your subscription
  - run `az ad sp create-for-rbac --name <YOUR_STAGE_NAME>-<PROJECT_NAME>-sp` replace `<YOUR_STAGE_NAME>`  and `<PROJECT_NAME>` accordingly.
  - On successful execution of above command it will print output similer to below -
    ```
    {
      "appId": "<UNIQUE_APP_IDENTIFIER>",
      "displayName": "<YOUR_STAGE_NAME>-<PROJECT_NAME>-sp",
      "name": "http://<YOUR_STAGE_NAME>-<PROJECT_NAME>-sp",
      "password": "<APP_PASSWORD>",
      "tenant": "<YOUR_TENANT_ID>"
    }
    ```
    This information will be utilized to set some environment variable in next steps.
- rename `.sample-env` to `.env` and set necessary environment variables which will be used by severless framework and your functions

---

## Testing Locally

Before you start testing locally you need to tweak the `serverless-azure-funtion` npm module code. This is due to how Azure Core Tools expects your project structure to be and how we have setup the project structure. This is temparary solution and should be fixed in future. 

Follow below steps to make code changes in `serverless-azure-function` npm module -

- navigate to your project root directory and open `node_modules\serverless-azure-functions\lib\shared\utils.js` file in any of your code editor.
- replace `Line No: 285` with below code -

  ```
  var localCommand = path_1.join(serverless.config.servicePath.replace(serverless.service.service, ''), "node_modules", ".bin", command);
  ```
Serverless framework comes with necessary tools to provide you ability to test locally before you deploy your code into Azure. This will speed up development process as you do not have to deploy code everytime you want to test your functions. Below stpes will allow you to run your function locally

- Open your `CMD` or `Terminal` and run `sls offline` inside your function app directory

  This will emulate your App Service functionality and act as local server to test your function with HTTP Trigger bindings and creates necessary files for the same. When you stop it. It will remove those files.

- Open another terminal and navigate to your function app directory and run any of the below command to test your function

  - `sls invoke local -f <YOUR_FUNCTION_NAME> -p <YOUR_FUNCTION_INPUT_FILE> --no-build`
  - `sls invoke local -f <YOUR_FUNCTION_NAME> -p <YOUR_FUNCTION_INPUT_FILE> -m <HTTP_METHOD> --no-build`

> __Important:__ We are using `webpack` & `serverless offline` which will take care hot reload of your function when you change your code. Everytime you change your code you just need to run the function using above commands and it will reflact the changes. 

Please refefer this [quick start](https://www.serverless.com/framework/docs/providers/azure/guide/quick-start/) guide for more details.

---

## Deploying to Azure

Deploying your function app is as easy as running below command and you will get all the details of deployment progress.

- navigate to your function app directory and run `sls deploy`

### Using Secrets with Function App app Settings
If you deploy secerts via ARM template then on every deployment it updates secert version which is unexpected. To overcome this limitation, deployment of secrets has been removed from ARM template definition and new custom hook has been introduced which will take secerts as an input and it will only updates secret if it has been changed. It will also takes care of updating necessary function app settings. 

For reference please take a look at `base` service `serverless.yml` file and check below sections -

- `custom.appSecrets` - passes app secerts
- `custom.scriptHooks.after:deploy:deploy` - pass `js` file that will be executed after deployment gets completed.
---

## Setting up B2C Tenant


- Create b2c instance and link to existing subscription under appropriate resource group
- Register following applications
  - frontend app registration
  - backend api registration
- Navigate to frontend App's Authentication section and add SPA app along with Redirect URIs
- Enable Access Token & ID Token
- Navitage to Backend App's expose API section and expose the API and add all scope
- Go to API permission and add Graph profile & API all permission and grant Admin Consent
		
---
## Additional Resources

This section provides you with some links to refer to get your self familier with tool set.

- Serverless Azure Function Plugin - [link](https://github.com/serverless/serverless-azure-functions)
- Serverless Azure Provider Documentation - [link](https://www.serverless.com/framework/docs/providers/azure/)
- Azure Function Javascript Developer Guide - [link](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
