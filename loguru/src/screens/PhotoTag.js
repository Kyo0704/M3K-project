import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Check, X, Search } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

// サンプルの既存タグ（実際のアプリではAPIから取得）
const existingTags = [
  { id: 1, name: "京都" },
  { id: 2, name: "北海道" },
  { id: 3, name: "奈良" },
  { id: 4, name: "東京" },
  { id: 5, name: "大阪" },
  { id: 6, name: "神社" },
  { id: 7, name: "寺院" },
  { id: 8, name: "紅葉" },
  { id: 9, name: "桜" },
  { id: 10, name: "海" },
];

export default function PhotoTag() {
  const navigation = useNavigation(); // ナビゲーションフックを使用して画面遷移を管理
  const route = useRoute(); // 現在のルート情報を取得

  // ルートパラメータから必要な情報を取得
  const {
    imageUri, // 画像のURI
    date, // 撮影日
    tags: initialTags = [], // 初期タグ（デフォルトは空配列）
    photoId, // 写真のID
    isEditing, // 編集モードかどうかのフラグ
  } = route.params;

  // ステートの初期化
  const [tags, setTags] = useState(initialTags); // 現在のタグ
  const [searchQuery, setSearchQuery] = useState(""); // 検索クエリ
  const [newTag, setNewTag] = useState(""); // 新しいタグの入力
  const [searchResults, setSearchResults] = useState([]); // 検索結果

  // 検索クエリが変更されたときに実行
  useEffect(() => {
    if (searchQuery.trim()) {
      // 検索クエリが空でない場合
      const results = existingTags
        .filter(
          (tag) =>
            tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !tags.includes(tag.name) // 既に選択されていないタグのみ
        )
        .map((tag) => tag.name);
      setSearchResults(results); // 検索結果を更新
    } else {
      setSearchResults([]); // 検索クエリが空の場合は結果をクリア
    }
  }, [searchQuery, tags]);

  // タグを追加する関数
  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]); // タグが既に存在しない場合に追加
    }
    setNewTag(""); // 新しいタグの入力をクリア
    setSearchQuery(""); // 検索クエリをクリア
  };

  // タグを削除する関数
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove)); // 指定されたタグを削除
  };

  // タグを保存する関数
  const handleSave = () => {
    // ここでタグをバックエンドに保存
    console.log("Saving tags for photo:", { photoId, tags });

    if (isEditing) {
      // 編集モードの場合は写真一覧に戻る
      navigation.navigate("PhotoScreen");
    } else {
      // 新規アップロードモードの場合
      const remainingPhotos = route.params.remainingPhotos || [];
      if (remainingPhotos.length > 0) {
        // 次の写真がある場合
        const nextPhoto = remainingPhotos[0];
        navigation.replace("PhotoTag", {
          imageUri: nextPhoto.uri,
          date: nextPhoto.date || new Date().toISOString(),
          remainingPhotos: remainingPhotos.slice(1),
        });
      } else {
        // すべての写真のタグ付けが完了した場合
        Alert.alert("完了", "すべての写真のタグ付けが完了しました", [
          { text: "OK", onPress: () => navigation.navigate("PhotoScreen") },
        ]);
      }
    }
  };

  // 日付をフォーマットする関数
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 画像を表示 */}
        <Image
          source={{ uri: imageUri.toString() }}
          style={styles.image}
          // エラー処理を追加
          onError={(error) => {
            console.error("Image loading error:", error.nativeEvent.error);
          }}
        />
        {/* 撮影日を表示 */}
        <View style={styles.card}>
          <Text style={styles.label}>撮影日</Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
        {/* タグを表示 */}
        <View style={styles.card}>
          <Text style={styles.label}>タグ</Text>
          <View style={styles.tagContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Check size={16} color="#666" />
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <X size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        {/* 既存タグの追加 */}
        <View style={styles.card}>
          <Text style={styles.label}>既存タグの追加</Text>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="検索"
              placeholderTextColor="#999"
            />
          </View>
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResult}
                  onPress={() => addTag(result)}
                >
                  <Text style={styles.searchResultText}>{result}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* 既存タグをリスト表示して追加可能にする */}
          <View style={styles.existingTagsContainer}>
            {existingTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={styles.existingTag}
                onPress={() => addTag(tag.name)}
              >
                <Text style={styles.existingTagText}>{tag.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* 手動でタグを追加 */}
        <View style={styles.card}>
          <Text style={styles.label}>手動でタグを追加</Text>
          <View style={styles.manualTagContainer}>
            <TextInput
              style={styles.manualTagInput}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="新しいタグを入力"
              placeholderTextColor="#999"
              onSubmitEditing={() => newTag.trim() && addTag(newTag.trim())}
            />
          </View>
        </View>
      </ScrollView>

      {/* ボタンコンテナ */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>もどる</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: "#333",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#333",
  },
  searchResults: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  searchResult: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchResultText: {
    fontSize: 14,
    color: "#333",
  },
  manualTagContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  manualTagInput: {
    paddingVertical: 8,
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#C1A14E",
  },
  cancelButton: {
    backgroundColor: "#C1A14E",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  existingTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  existingTag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  existingTagText: {
    fontSize: 14,
    color: '#333',
  },
});