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
import { useRoute } from "@react-navigation/native";
import mapStyle from "./raw/map_style.json";
import LogCreation from "./LogCreation";
import styles from "./CSS/RouteMapStyle";

export default function RouteMap() {
  const route = useRoute(); // ルート情報を取得
  const mapRef = useRef(null); // MapViewの参照を保持

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

  // 永続化されたマーカーをロード
  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const storedMarkers = await AsyncStorage.getItem("markers");
        let loadedMarkers = storedMarkers ? JSON.parse(storedMarkers) : [];

        if (gpsData) {
          // GPSデータからルート座標とマーカーを生成
          const routeCoords = gpsData.map((point) => ({
            latitude: point.coordinates.latitude,
            longitude: point.coordinates.longitude,
          }));
          const markersData = gpsData.map((point, index) => ({
            id: `gps-${index}-${point.coordinates.latitude}-${
              point.coordinates.longitude
            }-${new Date(point.timestamp).getTime()}`,
            coordinate: {
              latitude: point.coordinates.latitude,
              longitude: point.coordinates.longitude,
            },
            title: `Day ${point.day}`,
            description: new Date(point.timestamp).toLocaleDateString(),
          }));

          setRouteCoordinates(routeCoords);

          if (routeCoords.length > 0) {
            // 初期表示の地図領域を設定
            setInitialRegion({
              latitude: routeCoords[0].latitude,
              longitude: routeCoords[0].longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            });
          }
          // 重複を排除してマーカーを設定
          const allMarkers = [...loadedMarkers, ...markersData];
          const uniqueMarkers = Array.from(
            new Map(allMarkers.map((marker) => [marker.id, marker])).values()
          );

          setMarkers(uniqueMarkers);
        }
      } catch (error) {
        console.error("マーカーのロードエラー:", error);
      }
    };

    loadMarkers();
  }, [gpsData, passedRegion]);

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
    if (newMarkerCoordinate && newMarkerTitle) {
      const newMarker = {
        id: Date.now().toString(),
        coordinate: newMarkerCoordinate,
        title: newMarkerTitle,
        description: new Date().toLocaleDateString(),
      };
      const updatedMarkers = [...markers, newMarker];
      setMarkers(updatedMarkers);
      saveMarkers(updatedMarkers); // 永続化
      setShowNewMarkerInput(false);
      setNewMarkerTitle("");
      setNewMarkerCoordinate(null);
    }
  };

  // 確認モーダルの応答を処理
  const handleConfirmationResponse = (proceed) => {
    setShowConfirmationModal(false);
    if (proceed && markerToNavigate) {
      setSelectedMarker(markerToNavigate);
      setShowLogCreation(true);
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
      setNewMarkerCoordinate(event.nativeEvent.coordinate);
      setShowNewMarkerInput(true);
      setIsAddingPin(false);
    }
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
              setMarkers(updatedMarkers);
              saveMarkers(updatedMarkers);
              setSelectedMarker(null);
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
  };

  return (
    <View style={styles.container}>
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
          onPress={handleDeleteMarker} // 削除ボタン
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
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddNewMarker}
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