// index.js
const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');

const app = express();
const port = 3000;

app.use(express.json());

// PostgreSQL接続プールの設定
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydatabase',
  password: '11924001',
  port: 5432,
});

const upload = multer({ dest: 'uploads/' });

// ユーザー情報のエンドポイント
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/images', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM images');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/users', async (req, res) => {
  const { user_id, name, email, subscription_type, profile_image, payment_info, pic_num, created_at, updated_at, likes, joins } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (user_id, name, email, subscription_type, profile_image, payment_info, pic_num, created_at, updated_at, likes, joins) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [user_id, name, email, subscription_type, profile_image, payment_info, pic_num, created_at, updated_at, likes, joins]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, subscription_type, profile_image, payment_info, pic_num, updated_at, likes, joins } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, subscription_type = $3, profile_image = $4, payment_info = $5, pic_num = $6, updated_at = $7, likes = $8, joins = $9 WHERE user_id = $10 RETURNING *',
      [name, email, subscription_type, profile_image, payment_info, pic_num, updated_at, likes, joins, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// サブスクリプション情報のエンドポイント
app.get('/subscriptions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subscriptions');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/subscriptions', async (req, res) => {
  const { plan_id, plan_name, price, photo_limit, collaboration_limit } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO subscriptions (plan_id, plan_name, price, photo_limit, collaboration_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [plan_id, plan_name, price, photo_limit, collaboration_limit]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.put('/subscriptions/:id', async (req, res) => {
  const { id } = req.params;
  const { plan_name, price, photo_limit, collaboration_limit } = req.body;
  try {
    const result = await pool.query(
      'UPDATE subscriptions SET plan_name = $1, price = $2, photo_limit = $3, collaboration_limit = $4 WHERE plan_id = $5 RETURNING *',
      [plan_name, price, photo_limit, collaboration_limit, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/subscriptions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM subscriptions WHERE plan_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 位置情報のエンドポイント
app.get('/user_locations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM user_locations');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/user_locations', async (req, res) => {
  const { log_id, user_id, visited_at, location_id, latitude, longitude, location_name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO user_locations (log_id, user_id, visited_at, location_id, latitude, longitude, location_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [log_id, user_id, visited_at, location_id, latitude, longitude, location_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.put('/user_locations/:user_id/:visited_at', async (req, res) => {
  const { user_id, visited_at } = req.params;
  const { location_id, latitude, longitude, location_name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE user_locations SET location_id = $1, latitude = $2, longitude = $3, location_name = $4 WHERE user_id = $5 AND visited_at = $6 RETURNING *',
      [location_id, latitude, longitude, location_name, user_id, visited_at]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/user_locations/:user_id/:visited_at', async (req, res) => {
  const { user_id, visited_at } = req.params;
  try {
    await pool.query('DELETE FROM user_locations WHERE user_id = $1 AND visited_at = $2', [user_id, visited_at]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 旅行ログのエンドポイント
app.get('/travel_logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM travel_logs');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/travel_logs', async (req, res) => {
  console.log('リクエストボディ:', req.body); // デバッグ用
  const { log_id, title, thumbnail, start_date, end_date, members, locations, public, like_num } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO travel_logs (log_id, title, thumbnail, start_date, end_date, members, locations, public, like_num) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [log_id, title, thumbnail, start_date, end_date, members, locations, public, like_num]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('データベースエラー:', err);
    res.status(500).send('Server Error');
  }
});

app.put('/travel_logs/:id', async (req, res) => {
  const { id } = req.params;
  const { title, thumbnail, start_date, end_date, members, locations, public, like_num } = req.body;
  try {
    const result = await pool.query(
      'UPDATE travel_logs SET title = $1, thumbnail = $2, start_date = $3, end_date = $4, members = $5, locations = $6, public = $7, like_num = $8 WHERE log_id = $9 RETURNING *',
      [title, thumbnail, start_date, end_date, members, locations, public, like_num, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ログと関連するロケーションデータを削除するエンドポイント
app.delete('/travel_logs_with_locations/:log_id', async (req, res) => {
  const { log_id } = req.params;
  try {
    // トランザクションを開始
    await pool.query('BEGIN');

    // travel_logsテーブルからログを削除
    await pool.query('DELETE FROM travel_logs WHERE log_id = $1', [log_id]);

    // ここで、log_idに基づいて関連するロケーションデータを削除するロジックを追加
    // 例えば、locationsフィールドを使用して関連付けを行う場合
    const result = await pool.query('SELECT locations FROM travel_logs WHERE log_id = $1', [log_id]);
    const locations = result.rows[0].locations;

    if (locations && locations.length > 0) {
      await pool.query('DELETE FROM user_locations WHERE location_id = ANY($1)', [locations]);
    }

    // トランザクションをコミット
    await pool.query('COMMIT');

    res.status(204).send();
  } catch (err) {
    // エラーが発生した場合、トランザクションをロールバック
    await pool.query('ROLLBACK');
    console.error('Error deleting log and locations:', err);
    res.status(500).send('Server Error');
  }
});

// 写真のエンドポイント
app.get('/photos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM photos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/photos', upload.array('photos'), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // ファイル情報をデータベースに保存するロジックを追加
    const photoInsertPromises = files.map(file => {
      return pool.query(
        'INSERT INTO photos (user_id, photo_id, file_path, uploaded_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.body.user_id, file.filename, file.path, new Date().toISOString()]
      );
    });

    const results = await Promise.all(photoInsertPromises);
    const insertedPhotos = results.map(result => result.rows[0]);

    res.status(201).json({ message: 'ファイルがアップロードされました', files: insertedPhotos });
  } catch (err) {
    console.error('サーバーエラー:', err);
    res.status(500).send('サーバーエラー');
  }
});

app.put('/photos/:user_id/:photo_id', async (req, res) => {
  const { user_id, photo_id } = req.params;
  const { s3, uploaded_at, tags } = req.body;
  try {
    const result = await pool.query(
      'UPDATE photos SET s3 = $1, uploaded_at = $2, tags = $3 WHERE user_id = $4 AND photo_id = $5 RETURNING *',
      [s3, uploaded_at, tags, user_id, photo_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/photos/:user_id/:photo_id', async (req, res) => {
  const { user_id, photo_id } = req.params;
  try {
    await pool.query('DELETE FROM photos WHERE user_id = $1 AND photo_id = $2', [user_id, photo_id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ログ保存スナップショットのエンドポイント
app.get('/log_snapshots', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM log_snapshots');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/log_snapshots', async (req, res) => {
  const { log_id, location_id, snapshot_id, file_name, created_at, version } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO log_snapshots (log_id, location_id, snapshot_id, file_name, created_at, version) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [log_id, location_id, snapshot_id, file_name, created_at, version]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.put('/log_snapshots/:log_id/:location_id/:snapshot_id', async (req, res) => {
  const { log_id, location_id, snapshot_id } = req.params;
  const { file_name, created_at, version } = req.body;
  try {
    const result = await pool.query(
      'UPDATE log_snapshots SET file_name = $1, created_at = $2, version = $3 WHERE log_id = $4 AND location_id = $5 AND snapshot_id = $6 RETURNING *',
      [file_name, created_at, version, log_id, location_id, snapshot_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/log_snapshots/:log_id/:location_id/:snapshot_id', async (req, res) => {
  const { log_id, location_id, snapshot_id } = req.params;
  try {
    await pool.query('DELETE FROM log_snapshots WHERE log_id = $1 AND location_id = $2 AND snapshot_id = $3', [log_id, location_id, snapshot_id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// タグテンプレートのエンドポイント
app.get('/photo_tags', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM photo_tags');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/photo_tags', async (req, res) => {
  const { tag_id, tag, created_at } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO photo_tags (tag_id, tag, created_at) VALUES ($1, $2, $3) RETURNING *',
      [tag_id, tag, created_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.put('/photo_tags/:id', async (req, res) => {
  const { id } = req.params;
  const { tag, created_at } = req.body;
  try {
    const result = await pool.query(
      'UPDATE photo_tags SET tag = $1, created_at = $2 WHERE tag_id = $3 RETURNING *',
      [tag, created_at, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/photo_tags/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM photo_tags WHERE tag_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/dates', async (req, res) => {
  const { start_date, end_date, total_days } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO dates (start_date, end_date, total_days) VALUES ($1, $2, $3) RETURNING *',
      [start_date, end_date, total_days]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('サーバーエラー:', err);
    res.status(500).send('サーバーエラー');
  }
});

// サーバーの起動
app.listen(port, () => {
  console.log(`Server running on http://10.108.1.140:${port}`);
});