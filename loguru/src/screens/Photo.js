import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Search, Tag as TagIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const samplePhotos = [
  {
    id: 1,
    uri: require('../Photo/2.png'),
    date: '2024/01/15',
    location: '京都',
    tags: ['京都', '神社', '伏見稲荷'],
  },
  {
    id: 2,
    uri: require('../Photo/nara-tourist-spot_thumb.png'),
    date: '2024/01/16',
    location: '奈良',
    tags: ['奈良', '寺院'],
  },
];

export default function Photo() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const storedPhotos = await AsyncStorage.getItem('photos');
        if (storedPhotos) {
          setPhotos(JSON.parse(storedPhotos));
        }
      } catch (error) {
        console.error('Failed to load photos from storage', error);
      }
    };
    loadPhotos();
  }, []);

  const filteredPhotos = photos.filter(photo => {
    const query = searchQuery.toLowerCase();
    const location = photo.location ? photo.location.toLowerCase() : '';
    const tags = photo.tags ? photo.tags.map(tag => tag.toLowerCase()) : [];
    return location.includes(query) || tags.some(tag => tag.includes(query));
  });

  const handlePhotoPress = (photo) => {
    navigation.navigate('PhotoTag', {
      imageUri: photo.uri,
      date: photo.date,
      tags: photo.tags,
      photoId: photo.id,
      isEditing: true,
    });
  };

  const savePhoto = async (newPhoto) => {
    try {
      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);
      await AsyncStorage.setItem('photos', JSON.stringify(updatedPhotos));
    } catch (error) {
      console.error('Failed to save photo to storage', error);
    }
  };

  const removePhoto = async (photoId) => {
    try {
      const storedPhotos = await AsyncStorage.getItem('photos');
      const parsedPhotos = storedPhotos ? JSON.parse(storedPhotos) : [];
      const updatedPhotos = parsedPhotos.filter(photo => photo.id !== photoId);
      setPhotos(updatedPhotos);
      await AsyncStorage.setItem('photos', JSON.stringify(updatedPhotos));
    } catch (error) {
      console.error('Failed to remove photo from storage', error);
    }
  };

  const confirmDeletePhoto = (photoId) => {
    Alert.alert(
      "確認",
      "この画像を削除してもよろしいですか？",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "削除", onPress: () => removePhoto(photoId), style: "destructive" },
      ],
      { cancelable: true }
    );
  };

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
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="場所やタグで検索"
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => navigation.navigate('PhotoUpload')}
        >
          <Text style={styles.uploadButtonText}>写真アップロード</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredPhotos.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.photoGrid}>
            {filteredPhotos.map((photo) => (
              <View key={photo.id} style={styles.photoContainer}>
                <TouchableOpacity
                  onPress={() => handlePhotoPress(photo)}
                >
                  <Image 
                    source={{ uri: photo.uri }}
                    style={styles.photo}
                    onError={(error) => {
                      console.error("Image loading error:", error.nativeEvent.error);
                    }}
                  />
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoDate}>{photo.date}</Text>
                    <View style={styles.tagContainer}>
                      <TagIcon size={12} color="#fff" />
                      <Text style={styles.tagCount}>{photo.tags.length}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDeletePhoto(photo.id)}
                >
                  <Text style={styles.deleteButtonText}>削除</Text>
                </TouchableOpacity>
              </View>
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
  deleteButton: {
    backgroundColor: '#ff4444', // 削除ボタンの背景色
    padding: 8, // パディング
    borderRadius: 8, // 角丸
    alignItems: 'center', // 水平方向の中央揃え
    marginTop: 8, // 上マージン
  },
  deleteButtonText: {
    color: '#fff', // 文字色
    fontSize: 14, // フォントサイズ
    fontWeight: '500', // フォントの太さ
  },
});