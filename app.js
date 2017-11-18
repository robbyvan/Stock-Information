const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//middleware
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

require('./routes')(app);

app.listen(8081, () => {
  console.log('server on: ', 8081);
});