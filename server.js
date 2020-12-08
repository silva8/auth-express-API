const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authentication = require('./routes/authentication');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Authentication API',
        version: '1.0.0',
        servers: ['http://localhost:3000']
      },
    },
    apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', authentication);

app.get('/', (req, res) => {
    res.status(200).send("Express login API");
});

module.exports = app;