import React, { useEffect, useState, useRef } from "react";
import { View, Text } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import axios from 'axios';
import styles from "./CSS/RouteMapStyle";
import mapStyle from "./raw/map_style.json";

export default function RouteMapView() {
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [initialRegion, setInitialRegion] = useState(null);

  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const response = await axios.get('http://10.108.1.172:3000/user_locations');
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
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.bannerText}>マップ</Text>
      <MapView
        ref={mapRef}
        customMapStyle={mapStyle}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF6347"
          strokeWidth={4}
        />
      </MapView>
    </View>
  );
}
