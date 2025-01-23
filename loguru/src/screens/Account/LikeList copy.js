/**
 * ファイル名：LikeList copy.js
 * 画面名：いいね一覧画面
 * 説明：LikeList.jsのコピー（バックアップ用）
 */

import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from 'expo-router';


export default function LikeList() {
  // const [userId, setUserId] = useState()  // ユーザーID
  let userId = ""
  const [likeLogData, setLikeLogData] = useState([])  // いいねしたログデータ
  const navigaton = useNavigation()

  // 画面がフォーカスされた際に実行
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await checkLogin()
        // await getLikeLogData()
        checkMediaAccess()
      })()
    }, [])
  );

  // ログイン確認
  const checkLogin = async () => {
    try {
      const value = await AsyncStorage.getItem("userId")
      userId = value
      if (!value) {
        navigation.navigate('SignIn')
      }
    } catch (error) {
      console.error("AsyncStorageでエラー：", error)
    }
  }

  // いいねしたログデータを取得
  const getLikeLogData = async () => {
    try {
      let url = new URL('http://10.108.1.128:3000/LikeLog')
      url.searchParams.append('userId', userId)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        try {
          const data = await response.json()
          setLikeLogData(data[0])
        } catch (error) {
          console.error("JSONのパースに失敗:", error)
        }
      } else {
        console.error("レスポンスエラー:", response.status)
      }
    } catch (error) {
      console.error("fetch処理でエラー：", error)
    }
  }

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
          <Image source={{ uri: item.profile_image }} style={styles.avatar} />
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
      {/* ログのリスト表示 */}
      {likeLogData && <FlatList
        data={likeLogData}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.log_id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />}
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
