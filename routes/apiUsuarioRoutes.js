const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Login: POST /api/usuarios/login
router.post('/login', loginController.login);

// Logout
router.post('/logout', loginController.logout);

module.exports = router;
