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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { format } from 'date-fns';

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
    fetchTravelLogs();
  }, []);

  // APIからログデータを取得する
  const fetchTravelLogs = async () => {
    try {
      const response = await axios.get('http://10.108.1.231:3000/travel_logs'); //一号館
      //const response = await axios.get('http://10.200.4.200:3000/travel_logs'); //二号館
      setTravelLogs(response.data);
    } catch (error) {
      console.error('Error fetching travel logs:', error);
    }
  };

  // ログを削除する関数
  const deleteLog = async (logId) => {
    try {
      await axios.delete(`http://10.108.1.140:3000/travel_logs/${logId}`); //一号館
      //await axios.delete(`http://10.200.4.200:3000/travel_logs/${logId}`); //二号館
      Alert.alert("削除成功", "ログが正常に削除されました。");
      fetchTravelLogs(); // 状態を更新してUIをリフレッシュ
    } catch (error) {
      console.error('Error deleting log:', error);
      Alert.alert("削除エラー", "ログの削除中にエラーが発生しました。");
    }
  };

  const handleCreateLog = () => {
    navigation.navigate('NewCreate');
  };

  const sortLogs = (logs) => {
    if (activeTab === '新規順') {
      return [...logs].sort((a, b) => {
        if (a.log_id && b.log_id) {
          return b.log_id.localeCompare(a.log_id);
        }
        return 0;
      });
    } else {
      return [...logs].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    }
  };

  const filterLogs = (logs) => {
    return logs.filter(log => 
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.members.some(member => member.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const sortedLogs = sortLogs(filterLogs(travelLogs));

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
        {sortedLogs.map(log => (
          <Pressable
            key={log.id}
            style={styles.card}
            onPress={() => navigation.navigate('RouteMap', { logId: log.id })}
          >
            <Image
              source={{ uri: log.thumbnail }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{log.title}</Text>
              <Text style={styles.cardDate}>
                {format(new Date(log.start_date), 'yyyy年MM月dd日')} - {format(new Date(log.end_date), 'yyyy年MM月dd日')}
              </Text>
              <View style={styles.memberContainer}>
                <Text style={styles.memberLabel}>メンバー：</Text>
                <Text style={styles.memberText}>
                  {log.members.join(', ')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    "削除確認",
                    "このログを削除してもよろしいですか？",
                    [
                      { text: "キャンセル", style: "cancel" },
                      {
                        text: "削除",
                        onPress: () => deleteLog(log.id),
                        style: "destructive",
                      },
                    ]
                  );
                }}
              >
                <Text style={{ color: 'red' }}>削除</Text>
              </TouchableOpacity>
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
    marginBottom: 8,
  },
  avatar: {
    borderRadius: 999,
  },
  avatarName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
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