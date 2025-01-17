import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// アバターコンポーネント
const Avatar = ({ uri, size = 40 }) => (
  <Image
    source={{ uri }}
    style={[styles.avatar, { width: size, height: size }]}
  />
);

export default function LogeCreate() {
  const [travelLogs, setTravelLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('新規順');
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    // ここでデータベースからログデータを取得する
    // fetchTravelLogs().then(setTravelLogs);
    // 現在はダミーデータを使用
    const dummyLogs = [
      {
        id: '1',
        title: '北海道旅行',
        date: '2023-12-20',
        members: ['田中', '佐藤', '園下'],
        image: 'https://find47.jp/ja/i/HiRGD',
        avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=田中',
      },
      {
        id: '2',
        title: '沖縄旅行',
        date: '2023-11-15',
        members: ['山田', '鈴木'],
        image: 'https://find47.jp/ja/i/cQQMQ',
        avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=山田',
      },
      // 他のログデータ...
    ];
    setTravelLogs(dummyLogs);
  }, []);

  const handleCreateLog = () => {
    navigation.navigate('NewCreate');
  };

  const sortLogs = (logs) => {
    if (activeTab === '新規順') {
      return [...logs].sort((a, b) => b.id.localeCompare(a.id));
    } else {
      return [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  };
//検索機能の処理
  const filterLogs = (logs) => {
    return logs.filter(log => 
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.members.some(member => member.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const sortedLogs = sortLogs(filterLogs(travelLogs));

  //検索・タブによるソート・新規作成画面遷移機能の実装
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="検索"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === '新規順' && styles.activeTab]}
          onPress={() => setActiveTab('新規順')}
        >
          <Text style={[styles.tabText, activeTab === '新規順' && styles.activeTabText]}>新規順</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === '日付順' && styles.activeTab]}
          onPress={() => setActiveTab('日付順')}
        >
          <Text style={[styles.tabText, activeTab === '日付順' && styles.activeTabText]}>日付順</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        {sortedLogs.map((log) => (
          <Pressable
            key={log.id}
            style={styles.card}
            onPress={() => {/* ログの詳細画面へ遷移 */}}
          >
            <Image
              source={{ uri: log.image }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{log.title}</Text>
              <Text style={styles.cardDate}>{log.date}</Text>
              <View style={styles.memberContainer}>
                <Text style={styles.memberLabel}>メンバー：</Text>
                <Text style={styles.memberText}>
                  {log.members.join('、')}
                </Text>
              </View>
              <View style={styles.avatarContainer}>
                <Avatar uri={log.avatar} size={24} />
                <Text style={styles.avatarName}>{log.members[0]}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleCreateLog}>
        <Feather name="edit-2" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#C1A14E',
  },
  tabText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  activeTabText: {
    color: '#C1A14E',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  memberContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  memberLabel: {
    fontSize: 14,
    color: '#666',
  },
  memberText: {
    fontSize: 14,
    color: '#666',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 999,
  },
  avatarName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});