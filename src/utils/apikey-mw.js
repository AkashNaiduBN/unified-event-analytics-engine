const {Pool} = require('pg')
const pool = new Pool({connectionString: process.env.DATABASE_URL})
module.exports = async function(req,res,next){
  const key = req.headers['x-api-key']
  if(!key) return res.status(401).json({error:'missing api key'})
  const r = await pool.query('SELECT app_id,revoked,expires_at FROM apps WHERE api_key=$1',[key])
  const row = r.rows[0]
  if(!row) return res.status(401).json({error:'invalid api key'})
  if(row.revoked) return res.status(403).json({error:'revoked'})
  if(row.expires_at && new Date(row.expires_at) < new Date()) return res.status(403).json({error:'expired'})
  req.appId = row.app_id
  next()
}
