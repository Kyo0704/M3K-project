import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import styles from "./CSS/NewCreateStyle";
import MemberSelect from "./MemberSelect";

export default function NewCreate() {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [title, setTitle] = useState("");
  const [days, setDays] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState(null);
  const navigation = useNavigation();
  const [showMemberModal, setShowMemberModal] = useState(false); // モーダル表示制御

  //写真選択
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("カメラロールへのアクセス許可が必要です");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setThumbnailUri(result.assets[0].uri);
    }
  };
  const handleCalendarPress = () => {
    navigation.navigate("Calendar", {
      setDays,
      setYear,
      setMonth,
      setStartDate,
      setEndDate,
    });
  };

  //メンバー選択
  const handleMemberSelect = () => {
    navigation.navigate("MemberSelect", {
      onMembersSelected: (members) => {
        setSelectedMembers(members);
      },
    });
  };

  // NewCreate.jsの「次へ」ボタンのonPressハンドラー
  const handleNext = () => {
    if (!title || !days || selectedMembers.length === 0) {
      alert("すべての必須項目を入力してください。");
      return;
    }
    navigation.navigate("GPSConfirmation", { days: parseInt(days, 10) });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>タイトル</Text>
          <TextInput
            style={styles.input}
            placeholder="この旅行ログのタイトルを入力してください"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>サムネイル</Text>
          <TouchableOpacity
            style={styles.thumbnailContainer}
            onPress={pickImage}
          >
            {thumbnailUri ? (
              <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
            ) : (
              <Image
                source={require("@/assets/Image.png")}
                style={styles.thumbnail}
              />
            )}
            <Text style={styles.thumbnailText}>
              一覧に表示するサムネイルを選択してください。
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>日数</Text>
          <TouchableOpacity style={styles.input} onPress={handleCalendarPress}>
            <Text style={days ? styles.inputText : styles.placeholderText}>
              {startDate && endDate
                ? `${year}年${month}月${startDate.substring(
                    8,
                    10
                  )}日～${endDate.substring(0, 4)}年${endDate.substring(
                    5,
                    7
                  )}月${endDate.substring(8, 10)}日 (${days}日間)`
                : "日数を選択してください"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>メンバー</Text>
          <TouchableOpacity style={styles.input} onPress={handleMemberSelect}>
            {selectedMembers.length > 0 ? (
              <Text style={styles.inputText}>
                {selectedMembers.map((member) => member.name).join(", ")}{" "}
                {/* 選択されたメンバーを表示 */}
              </Text>
            ) : (
              <Text style={styles.placeholderText}>
                この旅行の参加者を選択してください
              </Text>
            )}
          </TouchableOpacity>

          {/* メンバー選択モーダル */}
          <Modal visible={showMemberModal} animationType="slide">
            <MemberSelect
              navigation={navigation} // ナビゲーションを渡す
              route={{
                params: {
                  onMembersSelected: (members) => {
                    setSelectedMembers(members); // 選択したメンバーを状態に保存
                    setShowMemberModal(false); // モーダルを閉じる
                  },
                  redirectTo: "NewCreate", // 確定後にNewCreateに戻る
                },
              }}
            />
          </Modal>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>公開</Text>
          <Text style={styles.placeholderText}>
            このアプリを使用しているほかのユーザーによるログ閲覧を許可しますか？
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#C1A14E" }}
            thumbColor={isPublic ? "#f4f3f4" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setIsPublic((previousState) => !previousState)}
            value={isPublic}
          />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>次へ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
