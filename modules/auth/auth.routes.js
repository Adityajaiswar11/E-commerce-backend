const express = require('express');
const authController = require('./auth.controller');

const authRoutes = express.Router();

authRoutes.post("/auth/signup", authController.signup);
authRoutes.post("/auth/login", authController.login);


module.exports = authRoutes;