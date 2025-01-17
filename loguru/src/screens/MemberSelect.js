import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// MemberSelectコンポーネントの定義
export default function MemberSelect({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState(''); // 検索クエリの状態を管理
  const [selectedMembers, setSelectedMembers] = useState([]); // 選択されたメンバーの状態を管理
  const [filteredMembers, setFilteredMembers] = useState([]); // フィルタリングされたメンバーの状態を管理

  // ダミーデータ - 後でDBから取得するデータに置き換え
  const dummyMembers = [
    { id: '1', name: 'Tanaka Issei' },
    { id: '2', name: 'Kanahasi Ryu' },
    { id: '3', name: 'Takeuti Minato' },
    { id: '4', name: 'Taku Taku' },
    { id: '5', name: 'Taira Kiyomori' },
  ];

  useEffect(() => {
    // 検索クエリに基づいてメンバーをフィルタリング
    const filtered = dummyMembers.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMembers(filtered); // フィルタリング結果を状態に設定
  }, [searchQuery]); // 検索クエリが変更されるたびに実行

  // メンバーの選択/解除を切り替える関数
  const toggleMember = (member) => {
    if (selectedMembers.find(m => m.id === member.id)) {
      // 既に選択されている場合は解除
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      // 選択されていない場合は追加
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  // 確定ボタンが押されたときの処理
  const handleConfirm = () => {
    if (route.params?.onMembersSelected) {
      route.params.onMembersSelected(selectedMembers); // 選択されたメンバーを親に渡す
    }

    // 遷移先を決定
    if (route.params?.redirectTo === 'NewCreate') {
      navigation.navigate('NewCreate'); // NewCreate.jsに遷移
    } else if (route.params?.redirectTo === 'LogCreation') {
      navigation.navigate('LogCreation'); // LogCreation.jsに遷移
    } else {
      navigation.goBack(); // デフォルトでモーダルを閉じる
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="検索"
          value={searchQuery}
          onChangeText={setSearchQuery} // 検索クエリの更新
        />
      </View>

      {/* 選択されたメンバーの表示 */}
      <View style={styles.selectedContainer}>
        {selectedMembers.map(member => (
          <View key={member.id} style={styles.chip}>
            <View style={styles.chipIcon} />
            <Text style={styles.chipText}>{member.name}</Text>
            <TouchableOpacity
              onPress={() => toggleMember(member)} // メンバーの選択解除
              style={styles.chipRemove}
            >
              <Feather name="x" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* メンバーリストの表示 */}
      <ScrollView style={styles.memberList}>
        {filteredMembers.map(member => (
          <Pressable
            key={member.id}
            style={styles.memberItem}
            onPress={() => toggleMember(member)} // メンバーの選択/解除
          >
            <Text style={styles.memberName}>{member.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 確定ボタン */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirm} // 確定処理
      >
        <Text style={styles.confirmButtonText}>確定</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// スタイル定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 背景色
    padding: 16, // パディング
  },
  searchContainer: {
    flexDirection: 'row', // 横並び
    alignItems: 'center', // 垂直方向の中央揃え
    backgroundColor: '#f5f5f5', // 背景色
    borderRadius: 8, // 角丸
    padding: 8, // パディング
    marginBottom: 16, // 下マージン
  },
  searchIcon: {
    marginRight: 8, // 右マージン
  },
  searchInput: {
    flex: 1, // 入力フィールドの幅を最大化
    fontSize: 16, // フォントサイズ
    color: '#333', // 文字色
  },
  selectedContainer: {
    flexDirection: 'row', // 横並び
    flexWrap: 'wrap', // 折り返し
    gap: 8, // 要素間の隙間
    marginBottom: 16, // 下マージン
  },
  chip: {
    flexDirection: 'row', // 横並び
    alignItems: 'center', // 垂直方向の中央揃え
    backgroundColor: '#fff', // 背景色
    borderRadius: 16, // 角丸
    paddingVertical: 4, // 縦パディング
    paddingHorizontal: 8, // 横パディング
    borderWidth: 1, // 枠線
    borderColor: '#ddd', // 枠線の色
  },
  chipIcon: {
    width: 8, // 幅
    height: 8, // 高さ
    borderRadius: 4, // 角丸
    backgroundColor: '#C1A14E', // 背景色
    marginRight: 4, // 右マージン
  },
  chipText: {
    fontSize: 14, // フォントサイズ
    color: '#333', // 文字色
    marginRight: 4, // 右マージン
  },
  chipRemove: {
    padding: 2, // パディング
  },
  memberList: {
    flex: 1, // リストの高さを最大化
  },
  memberItem: {
    borderWidth: 1, // 枠線
    borderColor: '#ddd', // 枠線の色
    borderRadius: 4, // 角丸
    padding: 12, // パディング
    marginBottom: 8, // 下マージン
  },
  memberName: {
    fontSize: 16, // フォントサイズ
    color: '#333', // 文字色
  },
  confirmButton: {
    backgroundColor: '#C1A14E', // ボタンの背景色
    borderRadius: 4, // 角丸
    padding: 16, // パディング
    alignItems: 'center', // 水平方向の中央揃え
    marginTop: 16, // 上マージン
  },
  confirmButtonText: {
    color: '#fff', // 文字色
    fontSize: 16, // フォントサイズ
    fontWeight: 'bold', // 太字
  },
});