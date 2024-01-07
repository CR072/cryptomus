const express = require('express');
const app = express();
const env = require('dotenv').config()
const Keyv = require('keyv')
const db = new Keyv('sqlite://core.sqlite', {
    table: 'cryptomus',
    busyTimeout: 10000
});
let a = require('./routes/example.js').load(app, db)
app.listen(process.env.APP_PORT, () => {
    console.log(`Test server launched into: ${process.env.APP_URL}`);
});
