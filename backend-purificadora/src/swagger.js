const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Purificadora API",
      version: "1.0.0",
      description:
        "Documentación de los endpoints del backend de la purificadora. Agrega comentarios JSDoc en archivos de rutas para extender esta especificación.",
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Servidor local",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
