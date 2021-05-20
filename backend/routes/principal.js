const express = require('express');
const router = express.Router();

const principalController = require('../controllers/principal.js');
const principal = require('../models/school.js');

router.post('/principal/createClass', principalController.createClass)

module.exports = router;