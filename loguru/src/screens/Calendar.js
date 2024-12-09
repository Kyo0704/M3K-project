import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

export default function CalendarScreen({ navigation, route }) {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const onDayPress = (day) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(day.dateString);
      setSelectedEndDate(null);
    } else {
      setSelectedEndDate(day.dateString);
    }
  };

  const calculateDays = () => {
    if (selectedStartDate && selectedEndDate) {
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 日数を計算
      return diffDays;
    }
    return 0;
  };

  const handleConfirm = () => {
    const totalDays = calculateDays();
    if (route.params.setDays) route.params.setDays(totalDays.toString());
    if (route.params.setYear) route.params.setYear(selectedStartDate.substring(0, 4));
    if (route.params.setMonth) route.params.setMonth(selectedStartDate.substring(5, 7));
    if (route.params.setStartDate) route.params.setStartDate(selectedStartDate);
    if (route.params.setEndDate) route.params.setEndDate(selectedEndDate);
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          [selectedStartDate]: { selected: true, startingDay: true, color: '#C1A14E' },
          [selectedEndDate]: { selected: true, endingDay: true, color: '#C1A14E' },
        }}
        markingType={'period'}
      />
      <Text style={styles.infoText}>
        {selectedStartDate && selectedEndDate
          ? `選択した日数: ${calculateDays()}日`
          : '開始日と終了日を選択してください'}
      </Text>
      <Button title="確定" onPress={handleConfirm} disabled={!selectedStartDate || !selectedEndDate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  infoText: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
  },
});

LocaleConfig.locales['ja'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};

LocaleConfig.defaultLocale = 'ja';