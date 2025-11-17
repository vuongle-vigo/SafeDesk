const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

module.exports = function expressLoader() {
    const app = express();
    app.use(express.json({ limit: '10mb' }));      
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    // app.use(express.json());
    app.use(cors());
    app.use(morgan("dev"));

    return app;
}