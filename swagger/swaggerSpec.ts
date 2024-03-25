const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Hello World",
      version: "1.0.0",
    },
  },
  apis: ["./swagger/*.swagger.yaml"], // files containing annotations as above
};

const openapiSpecification: any = swaggerJsdoc(options);

module.exports = openapiSpecification;
