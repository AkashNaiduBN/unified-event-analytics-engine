const express = require('express')
const router = express.Router()
const {generateKey, getKey, revokeKey} = require('../services/apikey')
router.post('/register', async (req,res)=>{
  const {name, ownerEmail, expiresInDays} = req.body
  if(!name || !ownerEmail) return res.status(400).json({error:'name and ownerEmail required'})
  const app = await generateKey({name, ownerEmail, expiresInDays})
  res.json(app)
})
router.get('/api-key', async (req,res)=>{
  const {appId} = req.query
  if(!appId) return res.status(400).json({error:'appId required'})
  const key = await getKey(appId)
  if(!key) return res.status(404).json({error:'not found'})
  res.json(key)
})
router.post('/revoke', async (req,res)=>{
  const {appId} = req.body
  if(!appId) return res.status(400).json({error:'appId required'})
  await revokeKey(appId)
  res.json({revoked:true})
})
module.exports = router
