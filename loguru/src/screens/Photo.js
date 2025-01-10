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
    uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-QwHC39KUumvD8TJDqsv5GXTzPWBnB5.jpg',
    date: '2024/01/15',
    location: '京都',
    tags: ['京都', '神社', '伏見稲荷'],
  },
  {
    id: 2,
    uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-QwHC39KUumvD8TJDqsv5GXTzPWBnB5.jpg',
    date: '2024/01/16',
    location: '奈良',
    tags: ['奈良', '寺院'],
  },
];

export default function Photo() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState(samplePhotos);

  const filteredPhotos = photos.filter(photo => {
    const query = searchQuery.toLowerCase();
    return (
      photo.location.toLowerCase().includes(query) ||
      photo.tags.some(tag => tag.toLowerCase().includes(query))
    );
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
              <TouchableOpacity
                key={photo.id}
                style={styles.photoContainer}
                onPress={() => handlePhotoPress(photo)}
              >
                <Image 
                  source={{ uri: photo.uri }} 
                  style={styles.photo}
                  onError={(error) => {
                    console.error('Image loading error:', error.nativeEvent.error);
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
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#C1A14E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  photoContainer: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoDate: {
    color: '#fff',
    fontSize: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagCount: {
    color: '#fff',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});