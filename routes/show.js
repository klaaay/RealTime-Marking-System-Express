const express = require('express')
const router = express.Router()
const data = require('../config/data.js');

router.get('/', function (req, res, next) {
  res.render('show', { data: data });
})

module.exports = router