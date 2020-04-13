const fs = require('fs');
const path = require('path');


const requestCounter = (req, res, next) => {
  try {
    let json = null;
    let requestCount;
    if (fs.existsSync(path.join(__dirname, '../data/requestCount.json'))) {
      fs.readFile(path.join(__dirname, '../data/requestCount.json'), 'utf8', (err, data) => {
        if (err) {
          return res.status(500).json({
            error: 'error processing request'
          });
        }
        const loadedData = JSON.parse(data);
        requestCount = loadedData.requestCount;
        json = JSON.stringify({ requestCount: ++requestCount });
        fs.writeFile(path.join(__dirname, '../data/requestCount.json'), json, 'utf8', (err, data) => {
          if (err) {
            return res.status(500).json({
              error: 'error processing request'
            });
          }
          next();
        });
      });
    } else {
      json = JSON.stringify({ requestCount: 1 });
      fs.writeFile(path.join(__dirname, '../data/requestCount.json'), json, 'utf8', (err, data) => {
        if (err) {
          return res.status(500).json({
            error: 'error processing request'
          });
        }
        next();
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 'error processing request',
      error: e.message
    });
  }
};

module.exports = requestCounter;
