import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Navigation, MapPin, Trash2, Plus } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import mapStyle from './raw/map_style.json';
import LogCreation from './LogCreation';

export default function RouteMap() {
  const route = useRoute();
  const mapRef = useRef(null);

  const { gpsData, initialRegion: passedRegion } = route.params;

  const [markers, setMarkers] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [newMarkerTitle, setNewMarkerTitle] = useState('');
  const [showNewMarkerInput, setShowNewMarkerInput] = useState(false);
  const [newMarkerCoordinate, setNewMarkerCoordinate] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [showLogCreation, setShowLogCreation] = useState(false);

  // 永続化されたマーカーをロード
  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const storedMarkers = await AsyncStorage.getItem('markers');
        if (storedMarkers) {
          setMarkers(JSON.parse(storedMarkers));
        }
        if (passedRegion) {
          setInitialRegion(passedRegion);
        }

        if (gpsData) {
          const routeCoords = gpsData.map((point) => ({
            latitude: point.coordinates.latitude,
            longitude: point.coordinates.longitude,
          }));

          setRouteCoordinates(routeCoords);

          const markersData = gpsData.map((point, index) => ({
            id: `gps-${index}`,
            coordinate: {
              latitude: point.coordinates.latitude,
              longitude: point.coordinates.longitude,
            },
            title: `Day ${point.day}`,
            description: new Date(point.timestamp).toLocaleDateString(),
          }));

          setMarkers((prevMarkers) => [...prevMarkers, ...markersData]);
        }
      } catch (error) {
        console.error('マーカーのロードエラー:', error);
      }
    };

    loadMarkers();
  }, [gpsData, passedRegion]);

  // マーカーを永続化
  const saveMarkers = async (updatedMarkers) => {
    try {
      await AsyncStorage.setItem('markers', JSON.stringify(updatedMarkers));
    } catch (error) {
      console.error('マーカーの保存エラー:', error);
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
      saveMarkers(updatedMarkers);
      setShowNewMarkerInput(false);
      setNewMarkerTitle('');
      setNewMarkerCoordinate(null);
    }
  };

  // ピンを削除
  const handleDeleteMarker = () => {
    if (selectedMarker) {
      Alert.alert(
        'マーカーの削除',
        `${selectedMarker.title} を削除しますか？`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '削除',
            onPress: () => {
              const updatedMarkers = markers.filter((m) => m.id !== selectedMarker.id);
              setMarkers(updatedMarkers);
              saveMarkers(updatedMarkers);
              setSelectedMarker(null);
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

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
        onPress={(event) => {
          if (isAddingPin) {
            setNewMarkerCoordinate(event.nativeEvent.coordinate);
            setShowNewMarkerInput(true);
            setIsAddingPin(false);
          }
        }}
        initialRegion={initialRegion}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => setSelectedMarker(marker)}
          />
        ))}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF6347"
          strokeWidth={4}
        />
      </MapView>
      <TouchableOpacity style={styles.centerButton} onPress={() => mapRef.current?.fitToCoordinates(routeCoordinates)}>
        <Navigation size={24} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.addPinButton, isAddingPin && styles.activeButton]}
        onPress={toggleAddPin}
      >
        <MapPin size={24} color={isAddingPin ? '#fff' : '#333'} />
      </TouchableOpacity>
      {selectedMarker && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMarker}>
          <Trash2 size={24} color="#fff" />
        </TouchableOpacity>
      )}
      {showNewMarkerInput && (
        <View style={styles.newMarkerInput}>
          <TextInput
            style={styles.input}
            value={newMarkerTitle}
            onChangeText={setNewMarkerTitle}
            placeholder="マーカーの名前を入力"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddNewMarker}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
  addPinButton: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
  activeButton: {
    backgroundColor: '#C1A14E',
  },
  deleteButton: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    backgroundColor: '#ff4136',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
  addPinMessage: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  newMarkerInput: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  addButton: {
    backgroundColor: '#C1A14E',
    padding: 8,
    borderRadius: 4,
  },
});