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
  const navigation = useNavigation(); // React Navigationのナビゲーションフックを使用して、画面遷移を管理
  const route = useRoute(); // 現在のルート情報を取得するためのフック
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を管理するためのステート
  const [modalVisible, setModalVisible] = useState(true); // モーダルの表示状態を管理するためのステート

  useEffect(() => {
    // コンポーネントがマウントされたときに実行される
    console.log('GPSConfirmation mounted');
    console.log('Route params:', route.params); // ルートパラメータをコンソールに出力
  }, []);

  // ダミーデータ用の座標（京都の範囲）
  const KYOTO_COORDINATES = {
    latitudeBase: 35.0116, // 京都の緯度
    longitudeBase: 135.7681, // 京都の経度
    latitudeOffset: 0.02, // 緯度の変動範囲
    longitudeOffset: 0.02, // 経度の変動範囲
  };

  const handleYes = async () => {
    // 「はい」ボタンが押されたときの処理
    console.log('handleYes called');
    setIsLoading(true); // ローディング状態を開始

    try {
      let gpsData; // GPSデータを格納する変数

      if (process.env.NODE_ENV === 'production') {
        // 本番環境の場合
        const { status } = await Location.requestForegroundPermissionsAsync(); // GPS使用の権限をリクエスト
        if (status !== 'granted') {
          // 権限がない場合
          Alert.alert('権限エラー', 'GPSの使用が許可されていません。');
          return;
        }

        const location = await Location.getCurrentPositionAsync({}); // 現在の位置を取得
        gpsData = [
          {
            day: 1, // 日数を1に設定
            timestamp: new Date().toISOString(), // 現在の日時をISO形式で取得
            coordinates: {
              latitude: location.coords.latitude, // 取得した緯度
              longitude: location.coords.longitude, // 取得した経度
            },
          },
        ];
      } else {
        // 開発環境の場合
        const days = route.params?.days || 1; // ルートパラメータから日数を取得、デフォルトは1
        gpsData = Array.from({ length: days }, (_, index) => ({
          day: index + 1, // 日数を設定
          timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(), // 日付を過去に遡って設定
          coordinates: {
            latitude:
              KYOTO_COORDINATES.latitudeBase +
              (Math.random() - 0.5) * KYOTO_COORDINATES.latitudeOffset, // ランダムな緯度を生成
            longitude:
              KYOTO_COORDINATES.longitudeBase +
              (Math.random() - 0.5) * KYOTO_COORDINATES.longitudeOffset, // ランダムな経度を生成
          },
        }));
        
        // 重複を排除
        gpsData = Array.from(
          new Set(
            gpsData.map(
              (point) =>
                `${point.coordinates.latitude},${point.coordinates.longitude},${point.timestamp}`
            )
          )
        ).map((uniqueKey) => {
          const [latitude, longitude, timestamp] = uniqueKey.split(",");
          return {
            day: gpsData.find(
              (point) =>
                point.coordinates.latitude === parseFloat(latitude) &&
                point.coordinates.longitude === parseFloat(longitude) &&
                point.timestamp === timestamp
            ).day,
            timestamp,
            coordinates: {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            },
          };
        });      
      }

      // GPSデータ確認
      console.log('GPS Data:', gpsData);

      // 初期地点の設定
      const initialRegion = {
        latitude: gpsData[0].coordinates.latitude, // 初期の緯度
        longitude: gpsData[0].coordinates.longitude, // 初期の経度
        latitudeDelta: 0.02, // 地図の緯度の範囲
        longitudeDelta: 0.02, // 地図の経度の範囲
      };

      setModalVisible(false); // モーダルを非表示にする
      navigation.navigate('RouteMap', { gpsData, initialRegion }); // ルートマップ画面にナビゲート
    } catch (error) {
      console.error('Error in handleYes:', error); // エラーをコンソールに出力
      Alert.alert('エラー', 'GPSデータの取得に失敗しました。'); // エラーメッセージを表示
    } finally {
      setIsLoading(false); // ローディング状態を終了
    }
  };

  const handleNo = () => {
    // 「いいえ」ボタンが押されたときの処理
    console.log('handleNo called');
    setModalVisible(false); // モーダルを非表示にする
    navigation.goBack(); // 前の画面に戻る
  };

  return (
    <View style={styles.container}>
      <Modal
        transparent={true} // モーダルの背景を透明に設定
        visible={modalVisible} // モーダルの表示状態を制御
        animationType="fade" // フェードアニメーションを使用
        onRequestClose={() => setModalVisible(false)} // モーダルが閉じられたときの処理
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MapPin size={24} color="#333" style={styles.icon} /> {/* アイコンを表示 */}
            <Text style={styles.title}>確認</Text> {/* タイトルを表示 */}
            <Text style={styles.message}>
              現在、取得しているGPSデータから旅行ログを作成しますか？
            </Text> {/* メッセージを表示 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonNo]} // ボタンのスタイルを設定
                onPress={handleNo} // 「いいえ」ボタンが押されたときの処理
                disabled={isLoading} // ローディング中はボタンを無効化
              >
                <Text style={styles.buttonTextNo}>いいえ</Text> {/* ボタンのテキスト */}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonYes]} // ボタンのスタイルを設定
                onPress={handleYes} // 「はい」ボタンが押されたときの処理
                disabled={isLoading} // ローディング中はボタンを無効化
              >
                <Text style={styles.buttonTextYes}>
                  {isLoading ? '読み込み中...' : 'はい'} {/* ローディング中のテキストを切り替え */}
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
    flex: 1, // コンテナを画面全体に広げる
    backgroundColor: 'transparent', // 背景を透明に設定
  },
  modalOverlay: {
    flex: 1, // オーバーレイを画面全体に広げる
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明の黒背景
    justifyContent: 'center', // 垂直方向に中央揃え
    alignItems: 'center', // 水平方向に中央揃え
  },
  modalContent: {
    backgroundColor: 'white', // モーダルの背景色
    borderRadius: 12, // 角を丸くする
    padding: 24, // 内側の余白
    width: '80%', // 幅を画面の80%に設定
    alignItems: 'center', // 水平方向に中央揃え
    elevation: 5, // Android用の影
    shadowColor: '#000', // iOS用の影の色
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // iOS用の影の不透明度
    shadowRadius: 3.84, // iOS用の影の半径
  },
  icon: {
    marginBottom: 16, // 下部の余白
  },
  title: {
    fontSize: 20, // フォントサイズ
    fontWeight: 'bold', // フォントの太さ
    marginBottom: 16, // 下部の余白
    color: '#333', // テキストの色
  },
  message: {
    fontSize: 16, // フォントサイズ
    textAlign: 'center', // テキストを中央揃え
    marginBottom: 24, // 下部の余白
    color: '#666', // テキストの色
    lineHeight: 24, // 行の高さ
  },
  buttonContainer: {
    flexDirection: 'row', // ボタンを横並びに配置
    justifyContent: 'center', // 中央揃え
    gap: 16, // ボタン間の隙間
  },
  button: {
    paddingVertical: 8, // 上下の余白
    paddingHorizontal: 24, // 左右の余白
    borderRadius: 4, // 角を丸くする
    minWidth: 100, // 最小幅
    alignItems: 'center', // 水平方向に中央揃え
  },
  buttonYes: {
    backgroundColor: '#C1A14E', // 「はい」ボタンの背景色
  },
  buttonNo: {
    backgroundColor: 'transparent', // 「いいえ」ボタンの背景色
  },
  buttonTextYes: {
    color: 'white', // 「はい」ボタンのテキスト色
    fontSize: 16, // フォントサイズ
    fontWeight: 'bold', // フォントの太さ
  },
  buttonTextNo: {
    color: '#C1A14E', // 「いいえ」ボタンのテキスト色
    fontSize: 16, // フォントサイズ
  },
});