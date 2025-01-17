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

    // 許可が得られなかった場合、アラートを表示
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
    setSelectedImages((prev) => prev.filter((_, i) => i !== index)); // 指定されたインデックスの画像を削除
  };

  // 画像をアップロードするための関数
  const handleUpload = () => {
    // 画像が選択されていない場合、アラートを表示
    if (selectedImages.length === 0) {
      Alert.alert("エラー", "画像を選択してください。");
      return;
    }

    // アップロード完了後のアラートを表示し、タグを追加するかどうかを確認
    Alert.alert("完了", "アップロードが完了しました。タグを追加しますか？", [
      {
        text: "あとで",
        onPress: () => navigation.goBack(),
        style: "cancel",
      },
      {
        text: "タグを追加",
        onPress: () => {
          navigation.navigate("PhotoTag", {
            imageUri: selectedImages[0].uri,
            date: new Date().toISOString(),
            remainingPhotos: selectedImages.slice(1).map((img) => ({
              uri: img.uri,
              date: new Date().toISOString(),
            })),
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
          <X size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>写真のアップロード</Text>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            selectedImages.length === 0 && styles.uploadButtonDisabled, // 画像が選択されていない場合、ボタンを無効化
          ]}
          onPress={handleUpload}
          disabled={selectedImages.length === 0} // ボタンの無効化条件
        >
          <Upload size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 画像選択部分 */}
      <ScrollView style={styles.content}>
        <View style={styles.imageGrid}>
          <TouchableOpacity style={styles.addButton} onPress={pickImage}>
            <Camera size={32} color="#666" />
            <Text style={styles.addButtonText}>写真を追加</Text>
          </TouchableOpacity>

          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: validateImageUri(image.uri) }}
                style={styles.image}
                onError={(error) => {
                  console.error(
                    "Image loading error:",
                    error.nativeEvent.error
                  );
                }}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
              {image.tags.length > 0 && (
                <View style={styles.tagIndicator}>
                  <TagIcon size={12} color="#fff" />
                  <Text style={styles.tagCount}>{image.tags.length}</Text>
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  uploadButton: {
    backgroundColor: "#C1A14E",
    padding: 8,
    borderRadius: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: "#ccc",
  },
  content: {
    flex: 1,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  addButton: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: "1%",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  imageContainer: {
    width: "31%",
    aspectRatio: 1,
    margin: "1%",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
  },
  tagIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagCount: {
    color: "#fff",
    fontSize: 12,
  },
});
