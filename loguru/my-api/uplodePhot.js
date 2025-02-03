const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mydatabase',
    password: '11924001',
    port: 5432,
  });

const insertImage = async (filePath, imageName) => {
  const imageData = fs.readFileSync(filePath);
  try {
    const res = await pool.query(
      'INSERT INTO images (name, data) VALUES ($1, $2) RETURNING id',
      [imageName, imageData]
    );
    console.log('Image inserted with ID:', res.rows[0].id);
  } catch (err) {
    console.error('Error inserting image:', err);
  }
};

insertImage('.././src/Photo/OTARU-UNGA-2019-09-12.png', 'example_image');
insertImage('.././src/Photo/2.png', 'example_image');
insertImage('.././src/Photo/nara-tourist-spot_thumb.png', 'example_image');
