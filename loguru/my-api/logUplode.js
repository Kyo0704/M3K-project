const axios = require('axios');

const testDataArray = [
  {
    log_id: '1',
    title: '沖縄旅行',
    thumbnail: 'https://via.placeholder.com/150', // ダミー画像URL
    start_date: '2023-10-01',
    end_date: '2023-10-05',
    members: JSON.stringify(['山田', '中村']), // JSON形式に変換
    locations: '{那覇, 石垣島}', // PostgreSQLの配列リテラル形式
    public: true,
    like_num: 10
  },
  {
    log_id: '2',
    title: '東京観光',
    thumbnail: 'https://via.placeholder.com/150', // ダミー画像URL
    start_date: '2023-09-15',
    end_date: '2023-09-18',
    members: JSON.stringify(['佐藤', '鈴木']),
    locations: '{渋谷, 浅草}',
    public: false,
    like_num: 5
  },
  {
    log_id: '3',
    title: '大阪出張',
    thumbnail: 'https://via.placeholder.com/150', // ダミー画像URL
    start_date: '2023-11-10',
    end_date: '2023-11-12',
    members: JSON.stringify(['田中']),
    locations: '{梅田, 難波}',
    public: true,
    like_num: 8
  }
];

testDataArray.forEach(async (testData) => {
  try {
    const response = await axios.post('http://localhost:3000/travel_logs', testData);
    console.log('データが挿入されました:', response.data);
  } catch (error) {
    console.error('データの挿入に失敗しました:', error);
  }
});