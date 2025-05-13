import 'cypress-ajv-schema-validator';

Cypress.Commands.add('validateResponseSchema', (method, endpoint, responseBody) => {
  // убираем слэши и параметры из endpoint
  const cleanEndpoint = endpoint.replace(/\//g, '-').replace(/^-/, '');
  const schemaFile = `schemas/${method.toUpperCase()}-${cleanEndpoint}-schema.json`;
 
  cy.fixture(schemaFile).then((schema) => {
    cy.wrap(responseBody).validateSchema(schema);
  });
});

