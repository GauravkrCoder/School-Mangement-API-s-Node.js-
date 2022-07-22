var express = require('express');
var app = express();
require('dotenv').config();
var client = require('./config/postgresDB.config');


app.get('/', (req, res) => {
    // console.log('Hi');
    // res.send('Server is running');
    client.connect();
    client.query('select * from _tblSuperSurveyUsers', (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          console.log(res.rows[0])
        }
      })
});

/* Setting the PORT NUMBER */
const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Server is running on port http://localhost:${PORT}`);
})