const express = require('express')
const router = express.Router()
const auth = require('./auth')
const analytics = require('./analytics')
router.use('/auth', auth)
router.use('/analytics', analytics)
module.exports = router
