const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const endPointRouter = require('./routes/routes');

const app = express();
const port = process.env.PORT || 5050;

app.use(morgan('dev'));
app.use(morgan(':method\t\t:url\t\t:status\t\t:response-time ms', {
    stream: fs.createWriteStream(path.join(__dirname, 'data/access.log'), { flags: 'a' }),
    skip: (req) => req.url === '/logs'
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/api/v1/on-convid-19', endPointRouter);

module.exports = app;
