import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import styles from "./CSS/LogCreationStyle.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LogCreationView({ marker }) {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const loadElements = async () => {
      if (marker) {
        const savedElements = await loadPinState(marker.id);
        if (savedElements.length > 0) {
          setElements(savedElements);
        } else {
          setElements([
            {
              id: "1",
              type: "text",
              content: marker.title,
              x: 50,
              y: 50,
              format: { fontFamily: "System", fontSize: 16, color: "#333" },
            },
            {
              id: "2",
              type: "text",
              content: marker.description,
              x: 50,
              y: 100,
              format: { fontFamily: "System", fontSize: 16, color: "#333" },
            },
          ]);
        }
      }
    };
    loadElements();
  }, [marker]);

  const renderElement = (element) => {
    switch (element.type) {
      case "text":
        return (
          <View key={element.id} style={{ position: 'absolute', left: element.x, top: element.y }}>
            <Text style={[styles.draggableText, element.format]}>
              {element.content}
            </Text>
          </View>
        );
      case "image":
        return (
          <View key={element.id} style={{ position: 'absolute', left: element.x, top: element.y }}>
            <Image
              source={{ uri: element.content }}
              style={styles.draggableImage}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>ログ表示</Text>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>{elements.map(renderElement)}</View>
      </ScrollView>
    </View>
  );
}

const loadPinState = async (pinId) => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@pin_${pinId}_elements`);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}; 