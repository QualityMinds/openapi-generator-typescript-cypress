# openapi-generator-typescript-cypress

This project provides an extension of the **[OpenAPI Generator `typescript-fetch`](https://openapi-generator.tech/docs/generators/typescript-fetch)** (sources can be found [here](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator/src/main/resources/typescript-fetch)). It generates API clients, based on [OpenAPI Specifications](https://spec.openapis.org/), which can be used within [Cypress](https://www.cypress.io/) tests in order to send requests against API endpoints.

🗣️ If you don't need the introductory blabla, then skip the [Motivation](#motivation) section and jump directly to the [Usage Guide](#usage-guide).

We also wrote a Mediuam article which can be found here: https://medium.com/@janreimone/generate-cypress-compatible-api-clients-from-openapi-specifications-8d11b3c33991

## Motivation

When implementing tests, we usually apply the _Arrange-Act-Assert_ pattern. It means that we, first, put the application under test (AUT) into a state (_arrange_) where we exactly know what to expect after interacting with the AUT. Second, we interact with the AUT and provoke certain behaviour (_act_) we want to verify. And third, we verify if our interaction with the AUT resulted in the expected outcome (_assert_).

In the case of automated E2E tests, special care has to be taken for the _arrange_ part when the scenarios to be tested become more complex. Arranging the AUT from the UI is very time-consuming until the app is in the state where we can even start implementing the actual technical test of our respective domain. It is therefore highly recommended not to prepare the AUT from the UI (by interacting with it) but by other means. There are several different options to achieve that. For example, one can restore a DB dump before the AUT is run, or you can prepare the application by sending requests to relevant API endpoints, and others. All of them are legit dependent on the context, the requirements, the domains, infrastructure, etc. of the AUT.

When we use Cypress for implementing automated E2E tests, the tests run in a [Node server process](https://docs.cypress.io/app/get-started/why-cypress#Architecture) inside the browser. Thus, we are in an asynchronous environment where the tests are run, and [promises are used to react on asynchronous operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises). Unfortunately, [Cypress doesn't use native promises but Bluebird promises](https://docs.cypress.io/api/utilities/promise). We cannot simply use `async` functions in Cypress which implies that sending asynchronous requests cannot be realized easily with well-established libraries such as [`node-fetch`](https://nodejs.org/en/learn/getting-started/fetch).

If we now want to _arrange_ the UAT by sending some requests to API endpoints we have [OpenAPI Specifications](https://spec.openapis.org/) defined for, we cannot generate API clients by leveraging any of the existing [OpenAPI generators](https://openapi-generator.tech/docs/generators) (such as, e.g., [typescript-fetch](https://openapi-generator.tech/docs/generators/typescript-fetch) or [typescript-node](https://openapi-generator.tech/docs/generators/typescript-node)). This makes us to use [`cy.request`](https://docs.cypress.io/api/commands/request) for sending API requests to our endpoints and implement API clients which can be used within Cypress manually.

This project provides a solution for the described problem and extends the [OpenAPI Generator `typescript-fetch`](https://openapi-generator.tech/docs/generators/typescript-fetch) templates in a way that [`cy.request`](https://docs.cypress.io/api/commands/request) is used for sending the request to the API endpoints, without native promises. Requests are added to the [Cypress Command Queue](https://docs.cypress.io/app/core-concepts/introduction-to-cypress#The-Cypress-Command-Queue) and, thus, can be handled as any other Cypress command. Our research revealed that such a functionality was asked for in the community already [here](https://github.com/OpenAPITools/openapi-generator/issues/8008), [here](https://github.com/cypress-io/cypress/issues/23583) and [there](https://github.com/OpenAPITools/openapi-generator/issues/11108).

## Usage Guide

### Prerequisites

#### Cypress project

For the generated code to work correctly, we need a working Cypress project. If you already have one, then you can skip to the next section.
If not, you can initialize a new Cypress project as follows.

```shell
# initialize new project
npm init -y
# install Typescript
npm install --save-dev typescript @types/node
# install Cypress package dependencies
npm install cypress
# initialize Typescript as of https://docs.cypress.io/app/tooling/typescript-support#Configure-tsconfigjson
npx tsc --init --target ES5 --lib es5,dom --types cypress,node --sourceMap true
# install Cypress runtime
npx cypress install
```

In the `tsconfig.json` the `"include": ["**/*.ts"]` needs to be added according to the recommendation [here](https://docs.cypress.io/app/tooling/typescript-support#Configure-tsconfigjson). Either do it manually or execute the following command if you are on a Mac and have `sed` command available:

```shell
sed -i '' -e '$s/}$/,/' -e '$a\
  "include": ["**/*.ts"]\
}' tsconfig.json
```

Adjust the `scripts` in the `package.json` so that we have the following commands available:

```json
"scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run"
}
```

You can now start Cypress the first time with the following command:

```shell
npm run cy:open
```

You need to set it up when run the first time. The result is a running Cypress project.

#### openapi-generator-cli

To be able to use the OpenAPI generator, the following package is required:

```shell
npm install @openapitools/openapi-generator-cli
```

#### Valid OpenAPI Specification

To be able to generate an OpenAPI client, a valid OpenAPI specification is needed, of course. Our [`examples`](examples)  all have it in the respective `api/` folder.

### Download or Update the Templates into Your Project

You can copy or update the [`typescript-cypress-templates`](typescript-cypress-templates) folder from this repository into your own local project using a one-line CLI command:

```bash
npx github:QualityMinds/openapi-generator-typescript-cypress
```

This will clone the latest version of the templates into a local folder named `typescript-cypress-templates` in your current directory. Run this command multiple times to keep your templates up to date with the latest version from this repository.

If you have copied it into the root of your project, then your Cypress project folder structure should look something like this:

```shell
my-cypress-project
├── other-subfolders
└── typescript-cypress-templates
    ├── apis.mustache
    ├── modelOneOf.mustache
    ├── modelOneOfInterfaces.mustache
    └── runtime.mustache
```

#### Optional: Use a Custom Target Folder

If you want the templates to be copied into a different folder name, simply provide it as a command-line argument:

```bash
npx github:QualityMinds/openapi-generator-typescript-cypress my-custom-folder
```

This command will copy the templates into `./my-custom-folder`.

#### Cleanup and Overwrite

The script will:
- Download the templates to a temporary directory
- Overwrite the target folder if it already exists
- Clean up all temporary files after execution

### Generate the OpenAPI Client for Cypress

☝️ Before generating the client, please make sure you satisfy all the previously described requirements. Then follow the instructions here.

#### 1. Download the templates

Download our update the templates as described in the [previous section](#download-or-update-the-templates-into-your-project).

#### 2. Configure the generator

To generate the client code for Cypress, we recommend using the `openapitools.json` file for proper configuration. With that we make sure the configuration is part of the code.

```json
{
  "$schema": "./node_modules/@openapitools/openapi-generator-cli/config.schema.json",
  "spaces": 2,
  "generator-cli": {
    "version": "7.17.0",
    "generators": {
      "fancy-api": {
        "generatorName": "typescript-fetch",
        "templateDir": "typescript-cypress-templates",
        "inputSpec": "fancy-api.yaml",
        "output": "cypress/openapi-gen"
      }
    }
  }
}
```

The `openapi-generator-cli` is a node package wrapper for the actual `openapi-generator`. Therefore, the configuration requires the `version` of the generator to be set. The available versions can be found [here](https://github.com/OpenAPITools/openapi-generator/releases). Remove the `version` line and the latest version is taken automatically.

In the `generators` part you can configure multiple generators for different OpenAPI specifications. In the example we use `fancy-api`. The provided properties are mandatory and must be present. Otherwise, the generated client code might not be Cypress-compatible.

| Property        | Value                          | Explanation                                                                                                                                                                                                                                            |
| --------------- | ------------------------------ |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `generatorName` | `typescript-fetch`             | The name of the used [generator](https://openapi-generator.tech/docs/generators). Since our template extension is based on `typescript-fetch` it must be this value. Otherwise, the generated client code might not be working.                        |
| `templateDir`   | `typescript-cypress-templates` | The path to the directory that contains the [`typescript-cypress-templates`](typescript-cypress-templates). If not provided the generated code won't be Cypress-compatible! Change this value if your template-containing folder is named differently. |
| `inputSpec`     | `your-api.yaml`                | This is the path to your OpenAPI specification. Instead of `inputSpec` you can also use `glob`.                                                                                                                                                        |
| `output`        | `your-output-folder`           | This is the path to the directory into which the client will be generated. If it doesn't exist the generator creates it.                                                                                                                               |

#### 3. Generate the client code

To generate the code, execute the following command:

```shell
npx openapi-generator-cli generate --generator-key fancy-api
```

The output of a successful generation should be similar to:

```shell
npx openapi-generator-cli generate --generator-key fancy-api

Did set selected version to 7.17.0
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.DefaultGenerator - Generating with dryRun=false
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.c.ignore.CodegenIgnoreProcessor - Output directory (/fancy-api-project/cypress/openapi-gen) does not exist, or is inaccessible. No file (.openapi-generator-ignore) will be evaluated.
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.DefaultGenerator - OpenAPI Generator: typescript-fetch (client)
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.DefaultGenerator - Generator 'typescript-fetch' is considered stable.
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/models/Artist.ts
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/models/ArtistInput.ts
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/models/Song.ts
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/models/SongInput.ts
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/apis/ArtistApi.ts
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/index.ts
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/runtime.ts
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/models/index.ts
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/apis/index.ts
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/.openapi-generator-ignore
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/.openapi-generator/VERSION
[[fancy-api] fancy-api.yaml] [main] INFO  o.o.codegen.TemplateManager - writing file /fancy-api-project/cypress/openapi-gen/.openapi-generator/FILES
[[fancy-api] fancy-api.yaml] ################################################################################
[[fancy-api] fancy-api.yaml] # Thanks for using OpenAPI Generator.                                          #
[[fancy-api] fancy-api.yaml] # Please consider donation to help us maintain this project 🙏                 #
[[fancy-api] fancy-api.yaml] # https://opencollective.com/openapi_generator/donate                          #
[[fancy-api] fancy-api.yaml] ################################################################################
[[fancy-api] fancy-api.yaml] java -jar "/fancy-api-project/node_modules/@openapitools/openapi-generator-cli/versions/7.13.0.jar" generate --input-spec="fancy-api.yaml" --generator-name="typescript-fetch" --template-dir="typescript-cypress-templates" --output="cypress/openapi-gen" exited with code 0
[fancy-api] fancy-api.yaml
```

## Examples

You can find examples in the [`examples`](examples) folder.

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before opening an issue or pull request.

## License

This project is licensed under the [Apache License 2.0](LICENSE). You are free to use, modify, and distribute it under the terms of that license.

## Cyber Resilience Act (CRA) Notice

This project provides template files that extend the `@openapitools/openapi-generator-cli` for generating TypeScript API clients compatible with Cypress.

**Important Notice regarding the EU Cyber Resilience Act (CRA):**  
This project is a *developer tool* and **does not constitute a "product with digital elements"** as defined under the CRA. It is not executed in production environments, nor does it process data during runtime.

The responsibility for the security, compliance, and correctness of the generated code lies entirely with the user. If the generated clients are used in safety-critical or regulated domains, users must perform their own security and compliance assessments.

## Disclaimer of Liability

This project provides templates and helper scripts on an "as-is" basis, without any warranties.

The maintainers do **not accept any liability** for:

- the security or correctness of generated clients,
- compatibility with specific OpenAPI specifications,
- suitability for use in any specific technical or regulatory context.

Use of this project is at your own risk. Always validate generated code in accordance with your organization’s quality and security standards.
