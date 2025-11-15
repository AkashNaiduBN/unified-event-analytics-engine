const {Pool} = require('pg')
const {v4:uuidv4} = require('uuid')
const pool = new Pool({connectionString: process.env.DATABASE_URL})
async function generateKey({name, ownerEmail, expiresInDays}) {
  const appId = uuidv4()
  const apiKey = uuidv4()
  const expiresAt = expiresInDays ? new Date(Date.now()+expiresInDays*24*3600*1000) : null
  const text = 'INSERT INTO apps(app_id,name,owner_email,api_key,expires_at,revoked) VALUES($1,$2,$3,$4,$5,false)'
  await pool.query(text,[appId,name,ownerEmail,apiKey,expiresAt])
  return {appId,apiKey,expiresAt}
}
async function getKey(appId){
  const r = await pool.query('SELECT app_id,api_key,expires_at,revoked FROM apps WHERE app_id=$1',[appId])
  return r.rows[0]
}
async function revokeKey(appId){
  await pool.query('UPDATE apps SET revoked=true WHERE app_id=$1',[appId])
}
module.exports = {generateKey,getKey,revokeKey}
