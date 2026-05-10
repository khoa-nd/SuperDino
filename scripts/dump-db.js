#!/usr/bin/env node
// SuperDino DB Backup via Management API
const https = require('https');
const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'ykpxhycwcpxjrixlxfup';
const BACKUP_DIR = process.argv[2];
const FILENAME = process.argv[3];

const TABLES = ['families', 'profiles', 'tasks', 'wishes', 'task_logs', 'wish_requests', 'transactions', 'badges'];

function query(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve([]); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function esc(v) {
  if (v === null || v === undefined) return 'DEFAULT';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error('❌ SUPABASE_ACCESS_TOKEN not set');
    process.exit(1);
  }

  const lines = [
    '-- SuperDino Database Backup',
    '-- Generated: ' + new Date().toISOString(),
    '',
    'BEGIN;',
    '',
  ];

  for (const table of TABLES) {
    try {
      const rows = await query(`SELECT * FROM public.${table} ORDER BY 1`);
      if (!Array.isArray(rows) || rows.length === 0) {
        lines.push(`-- ${table}: empty`);
        lines.push('');
        continue;
      }
      lines.push(`-- ${table}: ${rows.length} rows`);
      for (const row of rows) {
        const cols = Object.values(row).map(esc);
        lines.push(`INSERT INTO public.${table} VALUES (${cols.join(', ')});`);
      }
      lines.push('');
    } catch (e) {
      lines.push(`-- ${table}: ERROR - ${e.message}`);
      lines.push('');
    }
  }

  lines.push('COMMIT;');
  lines.push('');

  const outPath = path.join(BACKUP_DIR, FILENAME);
  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8');
  console.log(`✅ Exported ${TABLES.length} tables`);
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
