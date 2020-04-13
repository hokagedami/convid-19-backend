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
    res.type('application/xml');
    res.send(xmlEstimatedData);
  } catch (e) {
    res.status(500).json({ error: 'request cannot be processed at this time' });
  }
});


// Logs Endpoint
router.get('/logs', (req, res) => {
  try {
    if (!fs.existsSync(path.join(__dirname, '../data/requestCount.json'))){
      res.type("text/plain");
      return res.send('');
    }
    fs.readFile(path.join(__dirname, '../data/requestCount.json'), 'utf8', (err, data) => {
      if (err) {
        console.log(err, 'reading requestCount.json');
        res.status(500).json({ error: 'error reading logs' });
      } else {
        const json = JSON.parse(data);
        const { requestCount } = json;
        if (requestCount % 3 === 0) {
          const logs = fs.readFileSync(path.join(__dirname, '../data/access.log'), 'utf8');
          res.type("text/plain");
          return res.send(logs);
        }
        fs.readFile(path.join(__dirname, '../data/access.log'), 'utf8', (err2, data2) => {
          if (err2) {
            console.log(err2, 'reading access.log');
            res.status(500).json({ error: 'error reading logs' });
          } else {
            const split_log_String = data2.split('\n').filter((log) => log.length > 0);
            const toIgnore = requestCount % 3;
            for (let i = 0; i < toIgnore; i++) {
              split_log_String.pop();
            }
            res.type("text/plain");
            return res.send(split_log_String.join('\n'));
             /*fs.writeFile(path.join(__dirname, '../data/access_.log'), split_log_String.join('\n'), 'utf8', (err3) => {
              if (err3) {
                console.log(err3, 'writing access_.log');
                return res.status(500).json({ error: 'error reading logs' });
              }
              res.type("text/plain");
              return res.sendFile(path.join(__dirname, '../data/access_.log'));
            });*/
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'error reading logs' });
  }
});

module.exports = router;
