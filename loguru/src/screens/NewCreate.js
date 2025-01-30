import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import styles from "./CSS/NewCreateStyle";
import MemberSelect from "./MemberSelect";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import axios from 'axios';
import uuid from 'react-native-uuid'; // react-native-uuidをインポート

export default function NewCreate() {
  // 各種状態を管理するためのuseStateフック
  const [selectedMembers, setSelectedMembers] = useState([]); // 選択されたメンバー
  const [title, setTitle] = useState(""); // タイトル
  const [days, setDays] = useState(""); // 日数
  const [year, setYear] = useState(""); // 年
  const [month, setMonth] = useState(""); // 月
  const [startDate, setStartDate] = useState(""); // 開始日
  const [endDate, setEndDate] = useState(""); // 終了日
  const [isPublic, setIsPublic] = useState(false); // 公開設定
  const [thumbnailUri, setThumbnailUri] = useState(null); // サムネイル画像のURI
  const navigation = useNavigation(); // ナビゲーションフック
  const route = useRoute(); // useRouteフックを使用
  const [showMemberModal, setShowMemberModal] = useState(false); // メンバー選択モーダルの表示制御

  useEffect(() => {
    if (route.params?.startDate) {
      setStartDate(route.params.startDate);
    }
    if (route.params?.endDate) {
      setEndDate(route.params.endDate);
    }
  }, [route.params?.startDate, route.params?.endDate]);

  // 日付をMM月dd日の形式にフォーマットする関数
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 月は0から始まるため+1
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  // 写真選択機能
  const pickImage = async () => {
    // メディアライブラリへのアクセス許可を要求
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("カメラロールへのアクセス許可が必要です");
      return;
    }

    // 画像選択を開始
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // 画像のみ選択可能
      allowsEditing: true, // 編集を許可
      aspect: [1, 1], // アスペクト比を1:1に設定
      quality: 1, // 画像品質を最大に設定
    });

    if (!result.canceled) {
      setThumbnailUri(result.assets[0].uri); // 選択された画像のURIを状態に保存
    }
  };

  // カレンダー画面への遷移
  const handleCalendarPress = () => {
    navigation.navigate("Calendar", {
      setDays,
      setYear,
      setMonth,
      setStartDate,
      setEndDate,
    });
  };

  // メンバー選択画面への遷移
  const handleMemberSelect = () => {
    navigation.navigate("MemberSelect", {
      onMembersSelected: (members) => {
        setSelectedMembers(members); // 選択されたメンバーを状態に保存
      },
    });
  };

  // データ送信関数
  const submitData = async () => {
    try {
      const logData = {
        log_id: uuid.v4(), // react-native-uuidを使用してUUIDを生成
        title,
        thumbnail: thumbnailUri,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        members: JSON.stringify(selectedMembers),
        locations: [], // 必要に応じて設定
        public: isPublic,
        like_num: 0,
      };

      // APIを使ってデータを送信
      await axios.post('http://10.108.1.140:3000/travel_logs', logData); //一号館
      //await axios.post('http://10.200.4.200:3000/travel_logs', logData); //二号館

      console.log('データ送信成功:', logData);
      Alert.alert("送信成功", "データが正常に送信されました。");
    } catch (error) {
      console.error('データ送信エラー:', error);
      Alert.alert("送信エラー", "データの送信中にエラーが発生しました。");
    }
  };

  // 「次へ」ボタンの押下時の処理
  const handleNext = () => {
    if (!title || !days || selectedMembers.length === 0) {
      alert("すべての必須項目を入力してください。");
      return;
    }
    submitData();
    navigation.navigate("GPSConfirmation", { days: parseInt(days, 10) });
  };

  // データの保存
  const saveNewCreateData = async () => {
    try {
      const newCreateData = {
        title,
        days,
        year,
        month,
        startDate,
        endDate,
        isPublic,
        thumbnailUri,
        selectedMembers,
      };
      await AsyncStorage.setItem("newCreateData", JSON.stringify(newCreateData));
      Alert.alert("保存完了", "NewCreateデータが正常に保存されました。");
    } catch (error) {
      console.error("保存エラー:", error);
      Alert.alert("保存エラー", "NewCreateデータの保存中にエラーが発生しました。");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* タイトル入力 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>タイトル</Text>
          <TextInput
            style={styles.input}
            placeholder="この旅行ログのタイトルを入力してください"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* サムネイル選択 */}
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

        {/* 日数選択 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>日数</Text>
          <TouchableOpacity style={styles.input} onPress={handleCalendarPress}>
            <Text style={days ? styles.inputText : styles.placeholderText}>
              {startDate && endDate
                ? `${formatDate(startDate)} - ${formatDate(endDate)} (${days}日間)`
                : "日数を選択してください"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* メンバー選択 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>メンバー</Text>
          <TouchableOpacity style={styles.input} onPress={handleMemberSelect}>
            {selectedMembers.length > 0 ? (
              <Text style={styles.inputText}>
                {selectedMembers.map((member) => member.name).join(", ")}
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

        {/* 公開設定 */}
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

        {/* 次へボタン */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>次へ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
