import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function GPSConfirmation() {
  const navigation = useNavigation();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);

  useEffect(() => {
    console.log('GPSConfirmation mounted');
    console.log('Route params:', route.params);
  }, []);

// ダミーデータ用の座標（京都の範囲）
const KYOTO_COORDINATES = {
  latitudeBase: 35.0116,
  longitudeBase: 135.7681,
  latitudeOffset: 0.02, // ±範囲
  longitudeOffset: 0.02,
};

const handleYes = async () => {
  console.log('handleYes called');
  setIsLoading(true);

  try {
    let gpsData;

    if (process.env.NODE_ENV === 'production') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限エラー', 'GPSの使用が許可されていません。');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      gpsData = [
        {
          day: 1,
          // Convert Date to ISO string
          timestamp: new Date().toISOString(),
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        },
      ];
    } else {
      const days = route.params?.days || 1;
      gpsData = Array.from({ length: days }, (_, index) => ({
        day: index + 1,
        // GPSデータをString型に変換する
        timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
        coordinates: {
          latitude:
            KYOTO_COORDINATES.latitudeBase +
            (Math.random() - 0.5) * KYOTO_COORDINATES.latitudeOffset,
          longitude:
            KYOTO_COORDINATES.longitudeBase +
            (Math.random() - 0.5) * KYOTO_COORDINATES.longitudeOffset,
        },
      }));
    }

    //GPSデータ確認
    console.log('GPS Data:', gpsData);


    //初期地点の設定
    const initialRegion = {
      latitude: gpsData[0].coordinates.latitude,
      longitude: gpsData[0].coordinates.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };

    setModalVisible(false);
    navigation.navigate('RouteMap', { gpsData, initialRegion });
  } catch (error) {
    console.error('Error in handleYes:', error);
    Alert.alert('エラー', 'GPSデータの取得に失敗しました。');
  } finally {
    setIsLoading(false);
  }
};


  const handleNo = () => {
    console.log('handleNo called');
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MapPin size={24} color="#333" style={styles.icon} />
            <Text style={styles.title}>確認</Text>
            <Text style={styles.message}>
              現在、取得しているGPSデータから旅行ログを作成しますか？
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonNo]}
                onPress={handleNo}
                disabled={isLoading}
              >
                <Text style={styles.buttonTextNo}>いいえ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonYes]}
                onPress={handleYes}
                disabled={isLoading}
              >
                <Text style={styles.buttonTextYes}>
                  {isLoading ? '読み込み中...' : 'はい'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonYes: {
    backgroundColor: '#C1A14E',
  },
  buttonNo: {
    backgroundColor: 'transparent',
  },
  buttonTextYes: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextNo: {
    color: '#C1A14E',
    fontSize: 16,
  },
});