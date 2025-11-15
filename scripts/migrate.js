const fs = require('fs')
const {Pool} = require('pg')
require('dotenv').config()
const pool = new Pool({connectionString: process.env.DATABASE_URL})
async function migrate(){
  const sql = fs.readFileSync('migrations/001_init.sql').toString()
  await pool.query(sql)
  console.log('migrations applied')
  process.exit(0)
}
migrate().catch(e=>{console.error(e);process.exit(1)})
