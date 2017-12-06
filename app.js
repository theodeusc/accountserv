const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const config = require('./config/database').get(process.env.NODE_ENV);


var options = {
  useMongoClient: true, // Use new connection
  autoReconnect: true, // Always reconnect
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 20 // Maintain up to 20 socket connections
};
// Connect to DB
mongoose.connect(config.database, options);

// Connected
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.database);
});

// Connection Error
mongoose.connection.on('error', (err) => {
  console.log('Database error: ' + err);
});

const app = express();

const users = require ('./routes/users');

// Port number
const port = process.env.PORT || 8080;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//  Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/users', users);

// Index Route
app.get('/', (req, res) => {
  res.send('Invalid Endpoint');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start Server
app.listen(process.env.port || port, () => {
  console.log('Server started on port ' + port + '.');
});
