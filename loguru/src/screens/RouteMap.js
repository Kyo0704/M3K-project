import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  Text,
  TextInput,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Navigation, MapPin, Trash2, Plus } from "lucide-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import mapStyle from "./raw/map_style.json";
import LogCreation from "./LogCreation";
import styles from "./CSS/RouteMapStyle";
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

export default function RouteMap() {
  const route = useRoute(); // 現在のルート情報を取得
  const mapRef = useRef(null); // MapViewの参照を保持
  const navigation = useNavigation(); // ナビゲーションフックを使用

  const { gpsData, initialRegion: passedRegion } = route.params; // ルートから渡されたパラメータを取得

  // 各種状態を管理
  const [markers, setMarkers] = useState([]); // マーカーのリスト
  const [routeCoordinates, setRouteCoordinates] = useState([]); // ルートの座標
  const [selectedMarker, setSelectedMarker] = useState(null); // 選択されたマーカー
  const [isAddingPin, setIsAddingPin] = useState(false); // ピン追加モードのフラグ
  const [newMarkerTitle, setNewMarkerTitle] = useState(""); // 新しいマーカーのタイトル
  const [showNewMarkerInput, setShowNewMarkerInput] = useState(false); // 新しいマーカー入力の表示フラグ
  const [newMarkerCoordinate, setNewMarkerCoordinate] = useState(null); // 新しいマーカーの座標
  const [initialRegion, setInitialRegion] = useState(null); // 初期表示の地図領域
  const [showLogCreation, setShowLogCreation] = useState(false); // ログ作成モーダルの表示フラグ
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // 確認モーダルの表示フラグ
  const [markerToNavigate, setMarkerToNavigate] = useState(null); // ナビゲートするマーカー
  const [newMarkerDescription, setNewMarkerDescription] = useState(""); // 新しいマーカーの説明

  // 永続化されたマーカーをロード
  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const response = await axios.get('http://10.108.1.172:3000/user_locations'); //一号館
       // const response = await axios.get('http://10.200.4.200:3000/user_locations');
        const gpsData = response.data;

        const routeCoords = gpsData.map((point) => ({
          latitude: parseFloat(point.latitude),
          longitude: parseFloat(point.longitude),
        }));

        const markersData = gpsData.map((point, index) => ({
          id: `gps-${index}-${point.latitude}-${point.longitude}-${new Date(point.visited_at).getTime()}`,
          coordinate: {
            latitude: parseFloat(point.latitude),
            longitude: parseFloat(point.longitude),
          },
          title: `Day ${index + 1}`,
          description: new Date(point.visited_at).toLocaleDateString(),
        }));

        setRouteCoordinates(routeCoords);
        setMarkers(markersData);

        if (routeCoords.length > 0) {
          setInitialRegion({
            latitude: routeCoords[0].latitude,
            longitude: routeCoords[0].longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
        }
      } catch (error) {
        console.error("マーカーのロードエラー:", error);
      }
    };

    loadMarkers();
  }, []); // 依存関係を空にして初回のみ実行

  useEffect(() => {
    console.log("Markers loaded:", markers);
  }, [markers]);

  // マーカーを永続化
  const saveMarkers = async (updatedMarkers) => {
    try {
      await AsyncStorage.setItem("markers", JSON.stringify(updatedMarkers));
    } catch (error) {
      console.error("マーカーの保存エラー:", error);
    }
  };

  // ピンを追加
  const handleAddNewMarker = () => {
    if (newMarkerCoordinate && newMarkerTitle && newMarkerDescription) {
      const newMarker = {
        id: Date.now().toString(), // 現在のタイムスタンプをIDとして使用
        coordinate: newMarkerCoordinate,
        title: newMarkerTitle,
        description: newMarkerDescription,
      };
      const updatedMarkers = [...markers, newMarker];
      setMarkers(updatedMarkers); // 新しいマーカーを追加
      saveMarkers(updatedMarkers); // 永続化
      setShowNewMarkerInput(false); // 入力フィールドを非表示
      setNewMarkerTitle(""); // タイトルをリセット
      setNewMarkerDescription(""); // 説明をリセット
      setNewMarkerCoordinate(null); // 座標をリセット
      setIsAddingPin(false); // ピン追加モードをオフにする
    }
  };

  // 確認モーダルの応答を処理
  const handleConfirmationResponse = (proceed) => {
    setShowConfirmationModal(false); // モーダルを非表示
    if (proceed && markerToNavigate) {
      setSelectedMarker(markerToNavigate); // ナビゲートするマーカーを選択
      setShowLogCreation(true); // ログ作成モーダルを表示
    }
  };

  // マーカーが押されたときの処理
  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker); // マーカーを選択
    setShowConfirmationModal(true); // 作成確認モーダルを表示
  };

  // 地図が押されたときの処理
  const handleMapPress = (event) => {
    if (isAddingPin) {
      setNewMarkerCoordinate(event.nativeEvent.coordinate); // 新しいマーカーの座標を設定
      setShowNewMarkerInput(true); // 入力フィールドを表示
    }
    setSelectedMarker(null); // 選択されたマーカーをクリア
  };

  // ピンを削除
  const handleDeleteMarker = () => {
    if (selectedMarker) {
      Alert.alert(
        "マーカーの削除",
        `${selectedMarker.title} を削除しますか？`,
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "削除",
            onPress: () => {
              const updatedMarkers = markers.filter(
                (m) => m.id !== selectedMarker.id
              );
              setMarkers(updatedMarkers); // マーカーを削除
              saveMarkers(updatedMarkers); // 永続化
              setSelectedMarker(null); // 選択をクリア
            },
            style: "destructive",
          },
        ]
      );
    }
  };

  // 地図を中心に合わせる
  const centerMap = () => {
    if (mapRef.current && routeCoordinates.length > 0) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  // ピン追加モードを切り替え
  const toggleAddPin = () => {
    setIsAddingPin(!isAddingPin);
    setShowNewMarkerInput(false);
    setNewMarkerTitle(""); // タイトルをリセット
    setNewMarkerDescription(""); // 説明をリセット
    setNewMarkerCoordinate(null); // 座標をリセット
  };

  // 例えば、マーカーを選択した後にNewCreateに戻る場合
  const handleBackToNewCreate = () => {
    navigation.navigate("NewCreate"); // NewCreate画面に戻る
  };

  // 保存機能を追加
  const saveAllData = async () => {
    try {
      // 各画面のデータを取得
      const logCreationData = await AsyncStorage.getItem("logCreationData");
      const newCreateData = await AsyncStorage.getItem("newCreateData");
      const gpsConfirmationData = await AsyncStorage.getItem("gpsConfirmationData");

      // データを保存
      await AsyncStorage.setItem("allData", JSON.stringify({
        logCreation: logCreationData ? JSON.parse(logCreationData) : {},
        newCreate: newCreateData ? JSON.parse(newCreateData) : {},
        gpsConfirmation: gpsConfirmationData ? JSON.parse(gpsConfirmationData) : {},
      }));

      Alert.alert("保存完了", "すべてのデータが正常に保存されました。");

      // 保存完了後にLogeCreate画面に遷移
      navigation.navigate("LogeCreate");

    } catch (error) {
      console.error("データの保存エラー:", error);
      Alert.alert("保存エラー", "データの保存中にエラーが発生しました。");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>マップ</Text>
      </View>
      <MapView
        ref={mapRef}
        customMapStyle={mapStyle}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        onPress={handleMapPress} // 選択解除とピン追加の処理
        initialRegion={initialRegion}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF6347"
          strokeWidth={4}
        />
      </MapView>
      <TouchableOpacity style={styles.centerButton} onPress={centerMap}>
        <Navigation size={24} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.addPinButton, isAddingPin && styles.activeButton]}
        onPress={toggleAddPin}
      >
        <MapPin size={24} color={isAddingPin ? "#fff" : "#333"} />
      </TouchableOpacity>
      {selectedMarker && !showConfirmationModal && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteMarker}
        >
          <Trash2 size={24} color="#fff" />
        </TouchableOpacity>
      )}
      {isAddingPin && (
        <View style={styles.addPinMessage}>
          <Text>地図をタップしてピンを追加</Text>
        </View>
      )}
      {showNewMarkerInput && (
        <View style={styles.newMarkerInput}>
          <TextInput
            style={styles.input}
            value={newMarkerTitle}
            onChangeText={setNewMarkerTitle}
            placeholder="マーカーの名前を入力"
          />
          <TextInput
            style={styles.input}
            value={newMarkerDescription}
            onChangeText={setNewMarkerDescription}
            placeholder="マーカーの説明を入力"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddNewMarker}
            activeOpacity={0.7}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmationModal}
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              このピンに関連するログを作成しますか？
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  setShowConfirmationModal(false);
                  setShowLogCreation(true);
                }}
              >
                <Text style={styles.continueButtonText}>続行</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLogCreation}
        onRequestClose={() => setShowLogCreation(false)}
      >
        <LogCreation
          marker={selectedMarker}
          onClose={() => setShowLogCreation(false)}
        />
      </Modal>
    </View>
  );
}