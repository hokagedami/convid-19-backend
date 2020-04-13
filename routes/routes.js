const fs = require('fs');
const path = require('path');
const express = require('express');
const js2xmlparser = require('js2xmlparser');
const estimator = require('../modules/estimator');
const requestCountIncrementer = require('../modules/request-counter');

const router = express.Router();

// Default and JSON Endpoint
router.post(['/', '/json'], requestCountIncrementer, (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) return res.status(400).json({ error: 'empty request body' });
    const estimatedData = estimator(req.body);
    return res.send(estimatedData);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'request cannot be processed at this time' });
  }
});

// XML Endpoint
// eslint-disable-next-line consistent-return
router.post('/xml', requestCountIncrementer, (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'empty request body' });
    }
    const estimatedData = estimator(req.body);
    const xmlEstimatedData = js2xmlparser.parse('estimationData', estimatedData);
    res.send(xmlEstimatedData);
  } catch (e) {
    res.status(500).json({ error: 'request cannot be processed at this time' });
  }
});


// Logs Endpoint
// eslint-disable-next-line consistent-return
router.get('/logs', (req, res) => {
  try {
    // eslint-disable-next-line consistent-return
    fs.readFile(path.join(__dirname, '../../server-data/requestCount.json'), 'utf8', (err, data) => {
      if (err) {
        res.status(500).json({ error: 'error reading logs' });
      } else {
        const json = JSON.parse(data);
        const { requestCount } = json;
        if (requestCount % 3 === 0) return res.sendFile(path.join(__dirname, '../../server-data/access.log'));
        // eslint-disable-next-line consistent-return
        fs.readFile(path.join(__dirname, '../../server-data/access.log'), 'utf8', (err2, data2) => {
          if (err2) {
            res.status(500).json({ error: 'error reading logs' });
          } else {
            const splited = data2.split('\n').filter((log) => log.length > 0);
            const toIgnore = requestCount % 3;
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < toIgnore; i++) {
              splited.pop();
            }
            // eslint-disable-next-line consistent-return,no-unused-vars
            fs.writeFile(path.join(__dirname, '../../server-data/access_.log'), splited.join('\n'), 'utf8', (err3) => {
              if (err3) return res.status(500).json({ error: 'error reading logs' });
              res.sendFile(path.join(__dirname, '../../server-data/access_.log'));
            });
          }
        });
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    res.status(500).json({ error: 'error reading logs' });
  }
});

module.exports = router;
