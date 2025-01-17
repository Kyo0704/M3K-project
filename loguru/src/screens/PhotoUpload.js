import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Camera, X, Upload, Tag as TagIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { validateImageUri } from "../utils/imageHelpers";

// PhotoUploadコンポーネントの定義
export default function PhotoUpload() {
  const navigation = useNavigation(); // ナビゲーションフックを使用して画面遷移を管理
  const [selectedImages, setSelectedImages] = useState([]); // 選択された画像の状態を管理

  // 画像を選択するための関数
  const pickImage = async () => {
    // メディアライブラリへのアクセス許可を要求
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    // 許可が得られなかった場合、アラートを表示して終了
    if (!permissionResult.granted) {
      Alert.alert("権限エラー", "カメラロールへのアクセス許可が必要です。");
      return;
    }

    // 画像ライブラリを開いて画像を選択
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // 画像のみを選択可能
      allowsMultipleSelection: true, // 複数選択を許可
      quality: 1, // 画像の品質を最大に設定
    });

    // 選択がキャンセルされていない場合、選択された画像を状態に追加
    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri.toString(), // 画像のURIを文字列として保存
        tags: [], // 各画像に関連付けるタグの配列
      }));
      setSelectedImages((prev) => [...prev, ...newImages]); // 既存の画像に新しい画像を追加
    }
  };

  // 画像を削除するための関数
  const removeImage = (index) => {
    // 指定されたインデックスの画像を削除
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 画像をアップロードするための関数
  const handleUpload = () => {
    // 画像が選択されていない場合、アラートを表示して終了
    if (selectedImages.length === 0) {
      Alert.alert("エラー", "画像を選択してください。");
      return;
    }

    // アップロード完了後のアラートを表示し、タグを追加するかどうかを確認
    Alert.alert("完了", "アップロードが完了しました。タグを追加しますか？", [
      {
        text: "あとで",
        onPress: () => navigation.goBack(), // "あとで"を選択した場合、前の画面に戻る
        style: "cancel",
      },
      {
        text: "タグを追加",
        onPress: () => {
          // "タグを追加"を選択した場合、PhotoTag画面に遷移し、画像URIと日付を渡す
          navigation.navigate("PhotoTag", {
            imageUri: selectedImages[0].uri, // 最初の画像のURIを渡す
            date: new Date().toISOString(), // 現在の日付をISO形式で渡す
            remainingPhotos: selectedImages.slice(1).map((img) => ({
              uri: img.uri,
              date: new Date().toISOString(),
            })), // 残りの画像も同様に渡す
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー部分 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={24} color="#333" /> {/* 戻るボタン */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>写真のアップロード</Text> {/* 画面タイトル */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            selectedImages.length === 0 && styles.uploadButtonDisabled, // 画像が選択されていない場合、ボタンを無効化
          ]}
          onPress={handleUpload}
          disabled={selectedImages.length === 0} // ボタンの無効化条件
        >
          <Upload size={20} color="#fff" /> {/* アップロードボタン */}
        </TouchableOpacity>
      </View>

      {/* 画像選択部分 */}
      <ScrollView style={styles.content}>
        <View style={styles.imageGrid}>
          <TouchableOpacity style={styles.addButton} onPress={pickImage}>
            <Camera size={32} color="#666" /> {/* 画像追加ボタン */}
            <Text style={styles.addButtonText}>写真を追加</Text>
          </TouchableOpacity>

          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: validateImageUri(image.uri) }} // 画像のURIを検証して表示
                style={styles.image}
                onError={(error) => {
                  console.error(
                    "Image loading error:",
                    error.nativeEvent.error
                  ); // 画像読み込みエラーのログ
                }}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)} // 画像削除ボタン
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
              {image.tags.length > 0 && (
                <View style={styles.tagIndicator}>
                  <TagIcon size={12} color="#fff" /> {/* タグアイコン */}
                  <Text style={styles.tagCount}>{image.tags.length}</Text> {/* タグ数表示 */}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// スタイル定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // 背景色
  },
  header: {
    flexDirection: "row", // 横並び
    alignItems: "center", // 垂直方向の中央揃え
    justifyContent: "space-between", // 両端揃え
    padding: 16, // パディング
    borderBottomWidth: 1, // 下線
    borderBottomColor: "#eee", // 下線の色
  },
  headerTitle: {
    fontSize: 18, // フォントサイズ
    fontWeight: "bold", // 太字
    color: "#333", // 文字色
  },
  uploadButton: {
    backgroundColor: "#C1A14E", // ボタンの背景色
    padding: 8, // パディング
    borderRadius: 8, // 角丸
  },
  uploadButtonDisabled: {
    backgroundColor: "#ccc", // 無効化時の背景色
  },
  content: {
    flex: 1, // コンテンツの高さを最大化
  },
  imageGrid: {
    flexDirection: "row", // 横並び
    flexWrap: "wrap", // 折り返し
    padding: 8, // パディング
  },
  addButton: {
    width: "31%", // 幅
    aspectRatio: 1, // アスペクト比
    backgroundColor: "#f5f5f5", // 背景色
    borderRadius: 8, // 角丸
    margin: "1%", // マージン
    justifyContent: "center", // 水平方向の中央揃え
    alignItems: "center", // 垂直方向の中央揃え
  },
  addButtonText: {
    marginTop: 8, // 上マージン
    fontSize: 12, // フォントサイズ
    color: "#666", // 文字色
  },
  imageContainer: {
    width: "31%", // 幅
    aspectRatio: 1, // アスペクト比
    margin: "1%", // マージン
    borderRadius: 8, // 角丸
    overflow: "hidden", // はみ出しを隠す
  },
  image: {
    width: "100%", // 幅
    height: "100%", // 高さ
  },
  removeButton: {
    position: "absolute", // 絶対位置
    top: 4, // 上位置
    right: 4, // 右位置
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 背景色
    borderRadius: 12, // 角丸
    padding: 4, // パディング
  },
  tagIndicator: {
    position: "absolute", // 絶対位置
    bottom: 4, // 下位置
    right: 4, // 右位置
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 背景色
    borderRadius: 12, // 角丸
    paddingHorizontal: 6, // 横パディング
    paddingVertical: 2, // 縦パディング
    flexDirection: "row", // 横並び
    alignItems: "center", // 垂直方向の中央揃え
    gap: 4, // 要素間の隙間
  },
  tagCount: {
    color: "#fff", // 文字色
    fontSize: 12, // フォントサイズ
  },
});
