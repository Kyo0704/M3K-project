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


export default function MemberSelect({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

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
    setFilteredMembers(filtered);
  }, [searchQuery]);

  const toggleMember = (member) => {
    if (selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleConfirm = () => {
    if (route.params?.onMembersSelected) {
      route.params.onMembersSelected(selectedMembers); // 選択されたメンバーを親に渡す
    }

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
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="検索"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.selectedContainer}>
        {selectedMembers.map(member => (
          <View key={member.id} style={styles.chip}>
            <View style={styles.chipIcon} />
            <Text style={styles.chipText}>{member.name}</Text>
            <TouchableOpacity
              onPress={() => toggleMember(member)}
              style={styles.chipRemove}
            >
              <Feather name="x" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <ScrollView style={styles.memberList}>
        {filteredMembers.map(member => (
          <Pressable
            key={member.id}
            style={styles.memberItem}
            onPress={() => toggleMember(member)}
          >
            <Text style={styles.memberName}>{member.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirm}
      >
        <Text style={styles.confirmButtonText}>確定</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C1A14E',
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  chipRemove: {
    padding: 2,
  },
  memberList: {
    flex: 1,
  },
  memberItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#C1A14E',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});