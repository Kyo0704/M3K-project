import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Search, Tag as TagIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// サンプルデータ（実際のアプリではAPIから取得）
const samplePhotos = [
  {
    id: 1,
    uri: 'https://github.com/Kyo0704/M3K-project/blob/origin/develop/logCreate/loguru/src/Photo/2.png',
    date: '2024/01/15',
    location: '京都',
    tags: ['京都', '神社', '伏見稲荷'],
  },
  {
    id: 2,
    uri: 'https://github.com/Kyo0704/M3K-project/blob/origin/develop/logCreate/loguru/src/Photo/nara-tourist-spot_thumb.png',
    date: '2024/01/16',
    location: '奈良',
    tags: ['奈良', '寺院'],
  },
];

// Photoコンポーネントの定義
export default function Photo() {
  const navigation = useNavigation(); // ナビゲーションフックを使用して画面遷移を管理
  const [searchQuery, setSearchQuery] = useState(''); // 検索クエリの状態を管理
  const [photos, setPhotos] = useState(samplePhotos); // 写真データの状態を管理

  // 検索クエリに基づいて写真をフィルタリング
  const filteredPhotos = photos.filter(photo => {
    const query = searchQuery.toLowerCase();
    return (
      photo.location.toLowerCase().includes(query) || // 場所でフィルタリング
      photo.tags.some(tag => tag.toLowerCase().includes(query)) // タグでフィルタリング
    );
  });

  // 写真がクリックされたときの処理
  const handlePhotoPress = (photo) => {
    navigation.navigate('PhotoTag', {
      imageUri: photo.uri, // 画像のURIを渡す
      date: photo.date, // 画像の日付を渡す
      tags: photo.tags, // 画像のタグを渡す
      photoId: photo.id, // 画像のIDを渡す
      isEditing: true, // 編集モードであることを示す
    });
  };

  // 写真がない場合の表示
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>写真がありません</Text>
      <Text style={styles.emptyStateSubText}>
        「写真アップロード」から写真を追加してください
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ヘッダー部分 */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" /> {/* 検索アイコン */}
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery} // 検索クエリの更新
            placeholder="場所やタグで検索"
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => navigation.navigate('PhotoUpload')} // 写真アップロード画面に遷移
        >
          <Text style={styles.uploadButtonText}>写真アップロード</Text>
        </TouchableOpacity>
      </View>

      {/* 写真表示部分 */}
      <ScrollView style={styles.content}>
        {filteredPhotos.length === 0 ? (
          renderEmptyState() // 写真がない場合の表示
        ) : (
          <View style={styles.photoGrid}>
            {filteredPhotos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoContainer}
                onPress={() => handlePhotoPress(photo)} // 写真がクリックされたときの処理
              >
                <Image 
                  source={{ uri: photo.uri }} 
                  style={styles.photo}
                  onError={(error) => {
                    console.error('Image loading error:', error.nativeEvent.error); // 画像読み込みエラーのログ
                  }}
                />
                <View style={styles.photoInfo}>
                  <Text style={styles.photoDate}>{photo.date}</Text> {/* 写真の日付 */}
                  <View style={styles.tagContainer}>
                    <TagIcon size={12} color="#fff" /> {/* タグアイコン */}
                    <Text style={styles.tagCount}>{photo.tags.length}</Text> {/* タグ数表示 */}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// スタイル定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // 背景色
  },
  header: {
    padding: 16, // パディング
    borderBottomWidth: 1, // 下線
    borderBottomColor: '#ddd', // 下線の色
    backgroundColor: '#fff', // 背景色
  },
  searchContainer: {
    flexDirection: 'row', // 横並び
    alignItems: 'center', // 垂直方向の中央揃え
    backgroundColor: '#e0e0e0', // 背景色
    borderRadius: 8, // 角丸
    paddingHorizontal: 12, // 横パディング
    marginBottom: 12, // 下マージン
    marginTop: 20, // 上マージン
  },
  searchInput: {
    flex: 1, // 入力フィールドの幅を最大化
    paddingVertical: 8, // 縦パディング
    paddingHorizontal: 8, // 横パディング
    fontSize: 16, // フォントサイズ
    color: '#333', // 文字色
  },
  uploadButton: {
    backgroundColor: '#C1A14E', // ボタンの背景色
    padding: 12, // パディング
    borderRadius: 8, // 角丸
    alignItems: 'center', // 水平方向の中央揃え
    marginTop: 8, // 上マージン
  },
  uploadButtonText: {
    color: '#fff', // 文字色
    fontSize: 16, // フォントサイズ
    fontWeight: '500', // フォントの太さ
  },
  content: {
    flex: 1, // コンテンツの高さを最大化
  },
  photoGrid: {
    flexDirection: 'row', // 横並び
    flexWrap: 'wrap', // 折り返し
    padding: 8, // パディング
  },
  photoContainer: {
    width: '48%', // 幅
    aspectRatio: 1, // アスペクト比
    margin: '1%', // マージン
    borderRadius: 8, // 角丸
    overflow: 'hidden', // はみ出しを隠す
    backgroundColor: '#e0e0e0', // 背景色
  },
  photo: {
    width: '100%', // 幅
    height: '100%', // 高さ
    resizeMode: 'cover', // 画像のリサイズモード
  },
  photoInfo: {
    position: 'absolute', // 絶対位置
    bottom: 0, // 下位置
    left: 0, // 左位置
    right: 0, // 右位置
    padding: 8, // パディング
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 背景色
    flexDirection: 'row', // 横並び
    justifyContent: 'space-between', // 両端揃え
    alignItems: 'center', // 垂直方向の中央揃え
  },
  photoDate: {
    color: '#fff', // 文字色
    fontSize: 12, // フォントサイズ
  },
  tagContainer: {
    flexDirection: 'row', // 横並び
    alignItems: 'center', // 垂直方向の中央揃え
    gap: 4, // 要素間の隙間
  },
  tagCount: {
    color: '#fff', // 文字色
    fontSize: 12, // フォントサイズ
  },
  emptyState: {
    flex: 1, // 高さを最大化
    justifyContent: 'center', // 水平方向の中央揃え
    alignItems: 'center', // 垂直方向の中央揃え
    padding: 32, // パディング
  },
  emptyStateText: {
    fontSize: 18, // フォントサイズ
    fontWeight: 'bold', // 太字
    color: '#666', // 文字色
    marginBottom: 8, // 下マージン
  },
  emptyStateSubText: {
    fontSize: 14, // フォントサイズ
    color: '#999', // 文字色
    textAlign: 'center', // 中央揃え
  },
});