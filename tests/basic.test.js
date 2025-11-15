const request = require('supertest')
const app = require('../src/app')
test('health', async ()=> {
  const res = await request(app).get('/api-docs')
  expect(res.statusCode).toBe(200)
})
