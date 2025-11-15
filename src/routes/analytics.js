const express = require('express')
const router = express.Router()
const authMiddleware = require('../utils/apikey-mw')
const {saveEvent, eventSummary, userStats} = require('../services/analytics')
router.post('/collect', authMiddleware, async (req,res)=>{
  const payload = req.body
  if(!payload || !payload.event) return res.status(400).json({error:'event required'})
  await saveEvent(req.appId, payload)
  res.json({ok:true})
})
router.get('/event-summary', authMiddleware, async (req,res)=>{
  const q = req.query
  const summary = await eventSummary(req.appId, q)
  res.json(summary)
})
router.get('/user-stats', authMiddleware, async (req,res)=>{
  const q = req.query
  if(!q.userId) return res.status(400).json({error:'userId required'})
  const s = await userStats(req.appId, q.userId)
  res.json(s)
})
module.exports = router
