const express = require('express');
const app = express();
const port = 3000;
const cfg = require("./config/db-config.js");
const knex = require("knex")(cfg);
const cors = require("cors");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

global.knex = knex;

const http = require('http');


app.use(cors({ origin: 'http://localhost:4200', credentials: true }));


app.use(bodyParser.json({
  limit: '100mb'
}));

app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true,
  parameterLimit: 50000
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
let routes = require('./routes')(app);
const distPath = path.join(__dirname, 'dist/test');

app.use(express.static(distPath));
// app.use('/assets', express.static(path.join(__dirname, 'assets'))); // common syntax for acccessing image form the backend 

//  STATIC FILES (ABSOLUTE PATH)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log('Server running on port' + " " + port);
});



// const express = require('express');
// const app = express();
// const port = 3000;

// const cfg = require('./config/db-config.js');
// const knex = require('knex')(cfg);
// const cors = require('cors');
// const dotenv = require('dotenv');
// const bodyParser = require('body-parser');
// const path = require('path');

// dotenv.config();

// global.knex = knex;

// app.use(cors({ origin: 'http://localhost:4200', credentials: true }));

// app.use(bodyParser.json({ limit: '100mb' }));
// app.use(bodyParser.urlencoded({
//   limit: '100mb',
//   extended: true,
//   parameterLimit: 50000
// }));

// // static uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // routes
// require('./routes')(app);

// // Angular build (if needed)
// const distPath = path.join(__dirname, 'dist/test');
// app.use(express.static(distPath));

// // IMPORTANT: this must be LAST
// app.get('*', (req, res) => {
//   res.sendFile(path.join(distPath, 'index.html'));
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });