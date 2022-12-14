
const express = require('express')
const router = express.Router()
const API = require('../controllers/api')

router.post('/get-otp', API.getOtp)

router.post('/signup', API.signup)

router.post('/verify', API.verify)

router.post('/delete', API.delete)

router.post('/get-status', API.getStatus)

module.exports = router


