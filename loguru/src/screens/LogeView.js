import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// ダミーデータの定義（通常はAPIから取得）
const dummyLogs = [
  {
    id: '1',
    title: '京都旅行',
    date: '10/10～10/13',
    members: ['鈴木', '斎藤', '木下'],
    thumbnail: 'https://via.placeholder.com/150',
    author: 'SUZUKI TAROU',
    authorAvatar: 'https://via.placeholder.com/40',
  },
  {
    id: '2',
    title: '宮城県旅行',
    date: '12/13～12/16',
    members: ['山田', '鈴木'],
    thumbnail: 'https://via.placeholder.com/150',
    author: 'YAMADA HANAKO',
    authorAvatar: 'https://via.placeholder.com/40',
  },
];

export default function LogeView() {
  // 現在アクティブなタブを管理するステート
  const [activeTab, setActiveTab] = useState('新規順');
  // 検索クエリを管理するステート
  const [searchQuery, setSearchQuery] = useState('');

  // 検索クエリに基づいてログをフィルタリング
  const filteredLogs = dummyLogs.filter(log =>
    log.title.includes(searchQuery)
  );

  // タブに基づいてログをソート
  const sortedLogs = filteredLogs.sort((a, b) => {
    if (activeTab === '日付順') {
      // 日付順にソート
      return new Date(a.date.split('～')[0]) - new Date(b.date.split('～')[0]);
    } else if (activeTab === '新規順') {
      // IDを基に新規順にソート
      return b.id - a.id;
    } else if (activeTab === '人気順') {
      // 人気順のソートロジック（仮）
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // 各ログアイテムをレンダリングする関数
  const renderLogItem = ({ item }) => (
    <View style={styles.card}>
      {/* サムネイル画像 */}
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.cardContent}>
        {/* タイトル、日付、メンバー情報の表示 */}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.members}>メンバー：{item.members.join('、')}</Text>
        <View style={styles.authorRow}>
          {/* 作者のアバターと名前 */}
          <Image source={{ uri: item.authorAvatar }} style={styles.avatar} />
          <Text style={styles.author}>{item.author}</Text>
          {/* アクションボタン（お気に入り、共有、その他） */}
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="favorite-border" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="share" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="検索"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* タブナビゲーション */}
      <View style={styles.tabs}>
        {['日付順', '新規順', '人気順'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ログのリスト表示 */}
      <FlatList
        data={sortedLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 16,
    padding: 8,
    borderRadius: 8,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: '#FFA500',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1, // Android用の影
    shadowColor: '#000', // iOS用の影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  members: {
    fontSize: 14,
    color: '#666',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  author: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  iconButton: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
});
