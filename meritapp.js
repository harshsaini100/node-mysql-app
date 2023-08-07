const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const { createConnection } = require('net');
const { log } = require('console');
const { connect } = require('http2');
var cors = require('cors');

// use it before all route definitions


const app = express();
app.use(cors({origin: '*'}));

app.use(express.static('public'))
app.use(express.json())













app.listen(5000, () => {
    console.log("server started");
});