var express = require('express');
var router = express();

router.use(express.urlencoded({
    extended: true
}))
router.use(express.json({
    limit: 100000000,
    extended: true
}));

/* import controller files into route file to trigger the request methods.*/
var userController = require('../controllers/user.controller');

/* Defining the Routes for different API's */
router.post('/register', userController.signUp);
router.post('/login', userController.login);


module.exports = {
    router
}