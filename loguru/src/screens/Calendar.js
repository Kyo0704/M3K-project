import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// CalendarScreenコンポーネントの定義
export default function CalendarScreen({ navigation, route }) {
  const [selectedStartDate, setSelectedStartDate] = useState(null); // 選択された開始日の状態を管理
  const [selectedEndDate, setSelectedEndDate] = useState(null); // 選択された終了日の状態を管理

  // 日付が選択されたときの処理
  const onDayPress = (day) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // 開始日が未選択、または両方選択済みの場合は開始日を設定
      setSelectedStartDate(day.dateString);
      setSelectedEndDate(null); // 終了日をリセット
    } else {
      // 開始日が選択済みで終了日が未選択の場合は終了日を設定
      setSelectedEndDate(day.dateString);
    }
  };

  // 選択された日数を計算する関数
  const calculateDays = () => {
    if (selectedStartDate && selectedEndDate) {
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 日数を計算
      return diffDays;
    }
    return 0; // 日数が計算できない場合は0を返す
  };

  // 確定ボタンが押されたときの処理
  const handleConfirm = () => {
    const totalDays = calculateDays(); // 選択された日数を取得
    if (route.params.setDays) route.params.setDays(totalDays.toString()); // 日数を親コンポーネントに渡す
    if (route.params.setYear) route.params.setYear(selectedStartDate.substring(0, 4)); // 年を渡す
    if (route.params.setMonth) route.params.setMonth(selectedStartDate.substring(5, 7)); // 月を渡す
    if (route.params.setStartDate) route.params.setStartDate(selectedStartDate); // 開始日を渡す
    if (route.params.setEndDate) route.params.setEndDate(selectedEndDate); // 終了日を渡す
    navigation.goBack(); // 前の画面に戻る
  };
  
  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress} // 日付が選択されたときの処理を設定
        markedDates={{
          [selectedStartDate]: { selected: true, startingDay: true, color: '#C1A14E' }, // 開始日のマーク
          [selectedEndDate]: { selected: true, endingDay: true, color: '#C1A14E' }, // 終了日のマーク
        }}
        markingType={'period'} // マークのタイプを期間に設定
      />
      <Text style={styles.infoText}>
        {selectedStartDate && selectedEndDate
          ? `選択した日数: ${calculateDays()}日` // 日数を表示
          : '開始日と終了日を選択してください'} // 日付が未選択の場合のメッセージ
      </Text>
      <Button title="確定" onPress={handleConfirm} disabled={!selectedStartDate || !selectedEndDate} /> {/* 確定ボタン */}
    </View>
  );
}

// スタイル定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // 背景色
  },
  infoText: {
    fontSize: 16, // フォントサイズ
    marginVertical: 20, // 縦マージン
    textAlign: 'center', // 中央揃え
  },
});

// カレンダーのロケール設定
LocaleConfig.locales['ja'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};

LocaleConfig.defaultLocale = 'ja'; // デフォルトのロケールを日本語に設定