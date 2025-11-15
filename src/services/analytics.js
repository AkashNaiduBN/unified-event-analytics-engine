const { Pool } = require('pg');
const Redis = require('ioredis');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);

// Save incoming analytics events
async function saveEvent(appId, payload) {
  const text =
    'INSERT INTO events(app_id,event_type,url,referrer,device,ip_address,timestamp,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8)';
  await pool.query(text, [
    appId,
    payload.event,
    payload.url,
    payload.referrer,
    payload.device,
    payload.ipAddress,
    payload.timestamp,
    JSON.stringify(payload.metadata || {})
  ]);

  await redis.del(`event_summary:${appId}:${payload.event}`);
}

// Event summary aggregation
async function eventSummary(appId, q) {
  const event = q.event;
  const cacheKey = `event_summary:${appId || 'all'}:${event}:${q.startDate || ''}:${q.endDate || ''}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  let params = [];
  let where = ['1=1'];

  if (appId) {
    where.push('app_id=$' + (params.length + 1));
    params.push(appId);
  }

  if (event) {
    where.push('event_type=$' + (params.length + 1));
    params.push(event);
  }

  if (q.startDate) {
    where.push('timestamp >= $' + (params.length + 1));
    params.push(q.startDate);
  }

  if (q.endDate) {
    where.push('timestamp <= $' + (params.length + 1));
    params.push(q.endDate);
  }

  const sql = `
    SELECT 
      event_type as event, 
      count(*) as count,
      count(distinct ip_address) as unique_users,
      sum(case when device='mobile' then 1 else 0 end) as mobile,
      sum(case when device='desktop' then 1 else 0 end) as desktop
    FROM events 
    WHERE ${where.join(' AND ')}
    GROUP BY event_type
  `;

  const r = await pool.query(sql, params);
  const row =
    r.rows[0] || { event: event, count: 0, unique_users: 0, mobile: 0, desktop: 0 };

  const response = {
    event: row.event,
    count: Number(row.count),
    uniqueUsers: Number(row.unique_users),
    deviceData: {
      mobile: Number(row.mobile || 0),
      desktop: Number(row.desktop || 0)
    }
  };

  await redis.set(cacheKey, JSON.stringify(response), 'EX', 60);
  return response;
}

// User-level analytics
async function userStats(appId, userId) {
  const sql = `
    SELECT 
      count(*) as total,
      max(ip_address) as ip,
      jsonb_agg(
        jsonb_build_object(
          'event', event_type,
          'ts', timestamp
        ) ORDER BY timestamp DESC
      ) as recent
    FROM events
    WHERE app_id = $1 
      AND metadata->>'userId' = $2
    LIMIT 100
  `;

  const r = await pool.query(sql, [appId, userId]);
  const row = r.rows[0] || { total: 0, ip: null, recent: [] };

  return {
    userId,
    totalEvents: Number(row.total),
    ipAddress: row.ip,
    recentEvents: row.recent
  };
}

module.exports = { saveEvent, eventSummary, userStats };
