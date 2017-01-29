var express = require('express');
var router = express.Router();

  
var ctrlOthers = require('../controllers/others');
var ctrlHomepage=require('../controllers/main');

/* Locations pages */
router.get('/', ctrlHomepage.angularApp);


module.exports = router;
