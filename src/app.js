const express = require('express')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const routes = require('./routes')
require('dotenv').config()
const app = express()
app.use(express.json())
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_MAX || 1000)
})
app.use(limiter)
app.use('/api', routes)
const swaggerDocument = YAML.load('./docs/openapi.yaml')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
const port = process.env.PORT || 4000
app.listen(port, ()=> console.log('Server running on', port))
module.exports = app
