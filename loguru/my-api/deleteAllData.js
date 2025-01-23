// deleteAllTablesData.js
const { Pool } = require('pg');

// PostgreSQL接続プールの設定
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydatabase',
  password: '11924001',
  port: 5432,
});

// テーブルのデータを一括削除する関数
async function deleteAllDataFromTables(tables) {
  try {
    for (const table of tables) {
      const query = `DELETE FROM ${table}`;
      await pool.query(query);
      console.log(`Table ${table} のデータをすべて削除しました。`);
    }
  } catch (err) {
    console.error('Error deleting data from tables:', err);
  } finally {
    await pool.end();
  }
}

// 削除対象のテーブル名のリスト
const tables = [
  'users',
  'subscriptions',
  'user_locations',
  'travel_logs',
  'photos',
  'log_snapshots',
  'photo_tags',
];

// テーブルのデータを削除
deleteAllDataFromTables(tables);

