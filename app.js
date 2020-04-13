const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const endPointRouter = require('./routes/routes');

const app = express();
const port = process.env.PORT || 5050;

morgan.token('response-time', ((req, res) => {
    if (!req._startAt || !res._startAt) {
        // missing request and/or response start time
        return
    }
    // calculate diff
    const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
        (res._startAt[1] - req._startAt[1]) * 1e-6;
    // return truncated value

    return Math.trunc(ms) > 9 ? `${Math.trunc(ms)}ms` : `0${Math.trunc(ms)}ms`;
}));
app.use(morgan('dev'));
app.use(morgan(':method\t\t:url\t\t:status\t\t:response-time', {
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

app.use('/api/v1/on-covid-19', endPointRouter);

module.exports = app;
