import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import { format } from 'date-fns';

// ダミーデータの削除
// const dummyLogs = [
//   {
//     id: '1',
//     title: '京都旅行',
//     date: '10/10～10/13',
//     members: ['鈴木', '斎藤', '木下'],
//     thumbnail: 'https://via.placeholder.com/150',
//     author: 'SUZUKI TAROU',
//     authorAvatar: 'https://via.placeholder.com/40',
//   },
//   {
//     id: '2',
//     title: '宮城県旅行',
//     date: '12/13～12/16',
//     members: ['山田', '鈴木'],
//     thumbnail: 'https://via.placeholder.com/150',
//     author: 'YAMADA HANAKO',
//     authorAvatar: 'https://via.placeholder.com/40',
//   },
// ];

export default function LogeView() {
  const [activeTab, setActiveTab] = useState('新規順');
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
    const response = await axios.get('http://10.108.1.231:3000/travel_logs'); //一号館
     // const response = await axios.get('http://10.200.4.200:3000/travel_logs'); //二号館
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    log.title.includes(searchQuery)
  );

  const sortedLogs = filteredLogs.sort((a, b) => {
    if (activeTab === '日付順') {
      const dateA = a.date ? new Date(a.date.split('～')[0]) : new Date();
      const dateB = b.date ? new Date(b.date.split('～')[0]) : new Date();
      return dateA - dateB;
    } else if (activeTab === '新規順') {
      return b.id - a.id;
    } else if (activeTab === '人気順') {
      return b.like_num - a.like_num;
    }
    return 0;
  });

  const renderLogItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>
          {format(new Date(item.start_date), 'yyyy年MM月dd日')} - {format(new Date(item.end_date), 'yyyy年MM月dd日')}
        </Text>
        <Text style={styles.likes}>いいね数: {item.like_num}</Text>
        <View style={styles.authorRow}>
          <Image source={{ uri: item.authorAvatar }} style={styles.avatar} />
          <Text style={styles.author}>{item.author}</Text>
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
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="検索"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
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
    elevation: 1,
    shadowColor: '#000',
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
  likes: {
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
