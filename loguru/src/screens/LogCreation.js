import React, { useState, useEffect, useRef } from "react";
// React Nativeのコンポーネントとモジュールをインポート
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  PanResponder,
  Animated,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  FlatList,
  StyleSheet,
} from "react-native";
// アイコンをインポート
import {
  X,
  Plus,
  AlignLeft,
  UserPlus,
  Layout,
  Camera,
  Save,
  Type,
  Bold,
  Italic,
  Underline,
  AlignCenter,
  AlignRight,
  Palette,
  Trash2,
  ChevronDown,
  RotateCw,
} from "lucide-react-native";
// 画像ピッカーとWebSocketクライアントをインポート
import * as ImagePicker from "expo-image-picker";
import io from "socket.io-client";
import { useCallback } from "react";
import styles from "./CSS/LogCreationStyle.js"; // スタイルシートをインポート
import { useNavigation } from "@react-navigation/native"; // ナビゲーションフックをインポート
import MemberSelect from "./MemberSelect.js"; // メンバー選択コンポーネントをインポート
import AsyncStorage from "@react-native-async-storage/async-storage"; //非同期ストレージ
import { PinchGestureHandler, State } from "react-native-gesture-handler"; // ピンチジェスチャーハンドラーをインポート

// ドラッグ可能な要素のコンポーネント
const DraggableElement = ({
  children,
  id,
  initialX = 0,
  initialY = 0,
  initialRotation = 0, // 初期回転角度
  initialScale = 1, // 初期スケール
  onDragEnd,
  onPress,
  onLongPress,
  onRotateEnd, // 回転終了時のコールバック
  onScaleEnd, // スケール終了時のコールバック
}) => {
  // ドラッグの位置を管理するためのアニメーション値
  const pan = useRef(
    new Animated.ValueXY({ x: initialX, y: initialY })
  ).current;
  // 回転角度を管理するためのアニメーション値
  const rotation = useRef(new Animated.Value(initialRotation)).current;
  // スケールを管理するためのアニメーション値
  const scale = useRef(new Animated.Value(initialScale)).current;
  const [isDragging, setIsDragging] = useState(false); // ドラッグ中かどうかの状態
  const [isRotating, setIsRotating] = useState(false); // 回転中かどうかの状態
  const [lastScale, setLastScale] = useState(initialScale); // 最後のスケール値
  const [baseScale, setBaseScale] = useState(initialScale); // 基本スケール値
  const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 }); // ピンチの中心点
  const dragThreshold = 5; // ドラッグと認識するための閾値
  const [isSelected, setIsSelected] = useState(false); // 選択状態を管理

  // ドラッグ操作を管理するPanResponder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true, // 常にPanResponderを開始
    onPanResponderGrant: () => {
      setIsDragging(false); // ドラッグ開始時にドラッグ状態をリセット
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: (_, gestureState) => {
      // ドラッグの移動量が閾値を超えた場合にドラッグ状態をtrueに設定
      if (
        Math.abs(gestureState.dx) > dragThreshold ||
        Math.abs(gestureState.dy) > dragThreshold
      ) {
        setIsDragging(true);
      }
      // ドラッグの移動をアニメーションで反映
      Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      })(_, gestureState);
    },
    onPanResponderRelease: (_, gestureState) => {
      pan.flattenOffset(); // オフセットをリセット
      if (isDragging) {
        onDragEnd({ id, x: pan.x._value, y: pan.y._value }); // ドラッグ終了時の処理
      } else {
        onPress(id); // ドラッグでない場合はクリック処理
      }
      setIsDragging(false); // ドラッグ状態をリセット
    },
    onPanResponderTerminationRequest: () => false, // 他のResponderに奪われないようにする
    onLongPress: () => onLongPress(id), // 長押し時の処理
  });

  // 回転操作を管理するPanResponder
  const rotateResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true, // 常にPanResponderを開始
    onPanResponderMove: (_, gestureState) => {
      setIsRotating(true); // 回転中の状態を設定
      const angle =
        Math.atan2(gestureState.dy, gestureState.dx) * (180 / Math.PI); // 回転角度を計算
      rotation.setValue(angle); // 回転角度をアニメーションで設定
    },
    onPanResponderRelease: () => {
      setIsRotating(false); // 回転中の状態をリセット
      onRotateEnd({ id, rotation: rotation._value }); // 回転終了時の処理
    },
  });

  // ピンチ操作を管理するイベントハンドラ
  const handlePinch = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: false }
  );

  // ピンチ操作の状態変化を管理するハンドラ
  const handlePinchStateChange = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      const { focalX, focalY } = event.nativeEvent;
      setPinchCenter({ x: focalX, y: focalY }); // ピンチの中心点を設定
    } else if (event.nativeEvent.state === State.END) {
      setLastScale(scale._value); // 最後のスケール値を保存
      onScaleEnd({ id, scale: scale._value }); // スケール終了時の処理
    }
  };

  // 要素を押したときの処理
  const handlePress = (id) => {
    setIsSelected(true); // 要素が選択されたときに選択状態をtrueに設定
    onPress(id);
  };

  // 要素を離したときの処理
  const handleRelease = () => {
    setIsSelected(false); // 要素が離されたときに選択状態をfalseに設定
  };

  return (
    <PinchGestureHandler
      onGestureEvent={handlePinch}
      onHandlerStateChange={handlePinchStateChange}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.draggable,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              {
                rotate: rotation.interpolate({
                  inputRange: [-360, 360],
                  outputRange: ["-360deg", "360deg"],
                }),
              },
              { scale: Animated.multiply(baseScale, scale) },
              {
                translateX: Animated.multiply(
                  Animated.subtract(1, scale),
                  pinchCenter.x
                ),
              },
              {
                translateY: Animated.multiply(
                  Animated.subtract(1, scale),
                  pinchCenter.y
                ),
              },
            ],
          },
        ]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => handlePress(id)}
        onResponderRelease={handleRelease}
      >
        {children}
        {isSelected && ( // 選択されているときのみ回転ハンドルを表示
          <View {...rotateResponder.panHandlers} style={styles.rotateHandle}>
            <RotateCw size={24} color="#333" />
          </View>
        )}
      </Animated.View>
    </PinchGestureHandler>
  );
};

// フォントサイズ選択コンポーネント
const FontSizeSelector = ({ currentSize, onSizeChange }) => {
  const [isOpen, setIsOpen] = useState(false); // ドロップダウンの開閉状態
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40]; // 選択可能なフォントサイズ

  return (
    <View style={styles.fontSizeSelector}>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)} // ドロップダウンの開閉を切り替え
        style={styles.fontSizeButton}
        accessibilityLabel="フォントサイズを選択"
      >
        <Text style={styles.fontSizeButtonText}>{currentSize}</Text>
        <ChevronDown size={16} color="#333" />
      </TouchableOpacity>
      <Modal
        visible={isOpen} // モーダルの表示状態
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)} // モーダルを閉じる
      >
        <TouchableOpacity
          style={styles.fontSizeModalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)} // モーダルを閉じる
        >
          <View style={styles.fontSizeDropdownContainer}>
            <ScrollView style={styles.fontSizeDropdown}>
              {fontSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={styles.fontSizeOption}
                  onPress={() => {
                    onSizeChange(size); // フォントサイズを変更
                    setIsOpen(false); // モーダルを閉じる
                  }}
                  accessibilityLabel={`フォントサイズ ${size} を選択`}
                >
                  <Text style={[styles.fontSizeOptionText, { fontSize: size }]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// フォント選択コンポーネント
const FontSelector = ({ currentFont, onFontChange }) => {
  const fonts = ["System", "Hiragino", "Arial", "Courier"]; // 使用可能なフォント

  return (
    <View style={styles.fontSelector}>
      {fonts.map((font) => (
        <TouchableOpacity
          key={font}
          style={styles.fontOption}
          onPress={() => onFontChange(font)}
          accessibilityLabel={`フォントを選択: ${font}`}
        >
          <Text style={[styles.fontOptionText, { fontFamily: font }]}>
            {font}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// カラーピッカーコンポーネント
const ColorPicker = ({ onColorChange }) => {
  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#FFFFFF",
  ]; // 選択可能な色

  return (
    <View style={styles.colorPicker}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[styles.colorOption, { backgroundColor: color }]}
          onPress={() => onColorChange(color)} // 色を変更
          accessibilityLabel={`色を選択: ${color}`}
        />
      ))}
    </View>
  );
};

// テキストフォーマットツールバー
const TextFormatToolbar = ({ onFormatChange, currentFormat, onDelete }) => (
  <View style={styles.toolbarContainer}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.toolbar}
    >
      <View style={styles.toolbarGroup}>
        <FontSelector
          currentFont={currentFormat.fontFamily}
          onFontChange={(font) => onFormatChange("fontFamily", font)}
        />
        <FontSizeSelector
          currentSize={currentFormat.fontSize}
          onSizeChange={(size) => onFormatChange("fontSize", size)}
        />
      </View>

      <View style={styles.toolbarGroup}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() =>
            onFormatChange(
              "fontWeight",
              currentFormat.fontWeight === "normal" ? "bold" : "normal"
            )
          }
          accessibilityLabel="太字を切り替え"
        >
          <Bold
            size={24}
            color={currentFormat.fontWeight === "bold" ? "#C1A14E" : "#333"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() =>
            onFormatChange(
              "fontStyle",
              currentFormat.fontStyle === "normal" ? "italic" : "normal"
            )
          }
          accessibilityLabel="斜体を切り替え"
        >
          <Italic
            size={24}
            color={currentFormat.fontStyle === "italic" ? "#C1A14E" : "#333"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() =>
            onFormatChange(
              "textDecorationLine",
              currentFormat.textDecorationLine === "none" ? "underline" : "none"
            )
          }
          accessibilityLabel="下線を切り替え"
        >
          <Underline
            size={24}
            color={
              currentFormat.textDecorationLine === "underline"
                ? "#C1A14E"
                : "#333"
            }
          />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbarGroup}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => onFormatChange("textAlign", "left")}
          accessibilityLabel="左揃え"
        >
          <AlignLeft
            size={24}
            color={currentFormat.textAlign === "left" ? "#C1A14E" : "#333"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => onFormatChange("textAlign", "center")}
          accessibilityLabel="中央揃え"
        >
          <AlignCenter
            size={24}
            color={currentFormat.textAlign === "center" ? "#C1A14E" : "#333"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => onFormatChange("textAlign", "right")}
          accessibilityLabel="右揃え"
        >
          <AlignRight
            size={24}
            color={currentFormat.textAlign === "right" ? "#C1A14E" : "#333"}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>

    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => {
        Alert.alert("要素の削除", "この要素を削除してもよろしいですか？", [
          { text: "キャンセル", style: "cancel" },
          {
            text: "削除",
            onPress: onDelete, // 要素を削除
            style: "destructive",
          },
        ]);
      }}
      accessibilityLabel="テキストを削除"
    >
      <Trash2 size={24} color="#FF0000" />
    </TouchableOpacity>
  </View>
);

// テキスト入力モーダル
const TextInputModal = ({
  visible,
  initialText,
  initialFormat,
  onClose,
  onSave,
  onDelete,
}) => {
  const [text, setText] = useState(initialText); // テキストの状態
  const [format, setFormat] = useState(initialFormat); // フォーマットの状態
  const [previewText, setPreviewText] = useState(initialText); // プレビュー用のテキスト
  const [otherUsers, setOtherUsers] = useState([]); // 他のユーザーの状態
  const [socket, setSocket] = useState(null); // WebSocketの状態

  useEffect(() => {
    // WebSocket接続を確立
    const newSocket = io("YOUR_WEBSOCKET_SERVER_URL");
    setSocket(newSocket);

    // クリーンアップ関数
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      // 他のユーザーの更新を受信
      socket.on("userUpdate", (userData) => {
        setOtherUsers((prevUsers) => {
          const existingUserIndex = prevUsers.findIndex(
            (user) => user.id === userData.id
          );
          if (existingUserIndex !== -1) {
            const updatedUsers = [...prevUsers];
            updatedUsers[existingUserIndex] = userData;
            return updatedUsers;
          } else {
            return [...prevUsers, userData];
          }
        });
      });

      // ユーザーが退出したときの処理
      socket.on("userLeft", (userId) => {
        setOtherUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== userId)
        );
      });
    }
  }, [socket]);

  // テキストとフォーマットの変更を遅延送信
  const debouncedEmitChanges = useCallback(
    debounce((newText, newFormat) => {
      if (socket) {
        socket.emit("textUpdate", { text: newText, format: newFormat });
      }
    }, 100),
    [socket]
  );

  useEffect(() => {
    // テキストまたはフォーマットが変更されたときに更新を送信
    debouncedEmitChanges(text, format);
  }, [text, format, debouncedEmitChanges]);

  // フォーマットの変更を処理
  const handleFormatChange = (key, value) => {
    setFormat((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // initialTextが変更されたときにtextとpreviewTextを更新
    setText(initialText);
    setPreviewText(initialText);
  }, [initialText]);

  useEffect(() => {
    // リアルタイムプレビューの更新
    const timer = setTimeout(() => {
      setPreviewText(text);
    }, 100);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TextFormatToolbar
            onFormatChange={handleFormatChange}
            currentFormat={format}
            onDelete={onDelete}
          />

          <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerLabel}>文字色</Text>
            <ColorPicker
              onColorChange={(color) => handleFormatChange("color", color)}
            />
          </View>

          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, format]}>
              {previewText || "プレビュー"}
            </Text>
          </View>

          <TextInput
            style={[styles.modalInput, format]}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            placeholder="テキストを入力..."
          />

          <OtherUsersPreview users={otherUsers} />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSave(text, format)}
              style={[styles.modalButton, styles.saveButton]}
            >
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 他のユーザーのプレビュー
const OtherUsersPreview = ({ users }) => (
  <View style={styles.otherUsersContainer}>
    {users.map((user) => (
      <View key={user.id} style={styles.otherUserPreview}>
        <Text style={styles.otherUserName}>{user.name}</Text>
        <Text style={[styles.otherUserText, user.format]}>{user.text}</Text>
      </View>
    ))}
  </View>
);

// メイン処理・マーカーの情報取得
export default function LogCreation({ marker, onClose }) {
  const [fabOpen, setFabOpen] = useState(false); // FABの開閉状態
  const [elements, setElements] = useState([]); // 画面上の要素の状態
  const [editingElement, setEditingElement] = useState(null); // 編集中の要素
  const [showTextInputModal, setShowTextInputModal] = useState(false); // テキスト入力モーダルの表示状態
  const [newTextPosition, setNewTextPosition] = useState({ x: 0, y: 0 }); // 新しいテキストの位置
  const navigation = useNavigation(); // ナビゲーションフック
  const [showMemberModal, setShowMemberModal] = useState(false); // メンバー選択モーダルの表示状態
  const [membersWithPermissions, setMembersWithPermissions] = useState([]); // メンバーの状態管理
  const [selectedMembers, setSelectedMembers] = useState([]); // 選択されたメンバー

  // メンバー選択画面への遷移
  const handleMemberSelect = () => {
    navigation.navigate("MemberSelect", {
      onMembersSelected: (members) => {
        setSelectedMembers(members); // 選択されたメンバーを状態に保存
        setShowMemberModal(false); // モーダルを閉じる
      },
    });
  };

  // メンバー追加ボタンの処理
  const handleAddMembers = () => {
    setShowMemberModal(true); // モーダルを開く
  };

  // メンバー選択後の処理
  const handleSaveMembers = (selectedMembers) => {
    setMembersWithPermissions(selectedMembers); // 選択されたメンバーを保存
    navigation.goBack(); // モーダルを閉じる
  };

  // デフォルトのテキストフォーマット
  const defaultTextFormat = {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    textDecorationLine: "none",
    color: "#333",
    textAlign: "left",
  };
  // ログデータの読み込み
  useEffect(() => {
    const loadLogData = async () => {
      if (!marker || !marker.id) return;
      const storageKey = `logData_${marker.id}`;
      try {
        const savedData = await AsyncStorage.getItem(storageKey);
        console.log("ロードされたデータ:", savedData); // デバッグ用ログ
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setElements(parsedData.elements);
          setMembersWithPermissions(parsedData.membersWithPermissions);
        } else {
          // 保存されたデータがない場合、デフォルトの初期値を設定
          setElements([
            {
              id: "1",
              type: "text",
              content: marker.title || "デフォルトタイトル",
              x: 50,
              y: 50,
              format: { ...defaultTextFormat },
            },
            {
              id: "2",
              type: "text",
              content: marker.description || "デフォルト説明",
              x: 50,
              y: 100,
              format: { ...defaultTextFormat },
            },
          ]);
        }
      } catch (error) {
        console.error("ログデータの読み込みエラー", error);
      }
    };
    loadLogData();
  }, [marker]);

  // ログデータの保存
  const saveLogData = async () => {
    try {
      if (!marker || !marker.id) {
        Alert.alert("保存エラー", "マーカーが選択されていません。");
        return;
      }
      const logData = {
        elements,
        membersWithPermissions,
      };
      // マーカーIDをキーとして使用してデータを保存
      const storageKey = `logData_${marker.id}`;
      console.log("保存するデータ:", logData); // デバッグ用ログ
      await AsyncStorage.setItem(storageKey, JSON.stringify(logData));
      Alert.alert("保存完了", "情報が正常に保存されました。");
    } catch (error) {
      console.error("保存エラー:", error); // エラーをコンソールに出力
      Alert.alert("保存エラー", "情報の保存中にエラーが発生しました。");
    }
  };

  // 画像アップロード
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3], // アスペクト比
      quality: 1,
    });

    if (!result.canceled) {
      addElement("image", result.assets[0].uri, 100, 100); // 画像を要素として追加
    }
  };

  // FABの開閉
  const toggleFab = () => {
    setFabOpen(!fabOpen);
  };

  // FABのオプション選択処理
  const handleFabOptionPress = (option) => {
    switch (option) {
      case "text":
        setNewTextPosition({ x: 100, y: 100 }); // 新しいテキストの位置を設定
        setShowTextInputModal(true); // テキスト入力モーダルを表示
        break;
      case "photo":
        pickImage(); // 画像を選択
        break;
      case "user":
        handleMemberSelect(); // メンバー選択画面への遷移
        break;
      case "layout":
        console.log("レイアウト追加");
        break;
      case "save":
        console.log("保存");
        saveLogData();
        onClose(); // 画面を閉じる
        break;
      default:
        console.log("未対応のオプションが選択されました");
    }
    setFabOpen(false); // FABを閉じる
  };

  // 新しい要素を追加
  const addElement = (type, content, x, y, format) => {
    const newElement = {
      id: Date.now().toString(), // 一意のIDを生成
      type,
      content,
      x,
      y,
      format,
    };
    setElements([...elements, newElement]); // 要素を追加
  };

  // 要素の位置を更新
  const updateElementPosition = (id, x, y) => {
    setElements((prevElements) =>
      prevElements.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  // 要素を押したときの処理
  const handleElementPress = (id) => {
    const element = elements.find((el) => el.id === id);
    if (element.type === "text") {
      setEditingElement(element); // 編集中の要素を設定
      setShowTextInputModal(true); // テキスト入力モーダルを表示
    }
  };

  // 要素を長押ししたときの処理
  const handleElementLongPress = (id) => {
    Alert.alert("要素の削除", "この要素を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => deleteElement(id) },
    ]);
  };

  // テキストを保存
  const handleSaveText = (text, format) => {
    if (editingElement) {
      // 編集中の要素を更新
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === editingElement.id ? { ...el, content: text, format } : el
        )
      );
      setEditingElement(null); // 編集中の要素をリセット
    } else {
      // 新しい要素を追加
      addElement("text", text, newTextPosition.x, newTextPosition.y, format);
    }
    setShowTextInputModal(false); // モーダルを閉じる
    saveLogData();
  };

  // 要素を削除
  const deleteElement = (id) => {
    setElements((prevElements) => prevElements.filter((el) => el.id !== id));
    setEditingElement(null); // 編集中の要素をリセット
    setShowTextInputModal(false); // モーダルを閉じる
  };

  // 要素を描画
  const renderElement = (element) => {
    switch (element.type) {
      case "text":
        return (
          <DraggableElement
            key={element.id}
            id={element.id}
            initialX={element.x}
            initialY={element.y}
            initialRotation={0}
            initialScale={1}
            onDragEnd={({ id, x, y }) => updateElementPosition(id, x, y)}
            onPress={handleElementPress}
            onLongPress={handleElementLongPress}
            onRotateEnd={({ id, rotation }) => {
              const angle = rotation * (180 / Math.PI);
              setElements((prevElements) =>
                prevElements.map((el) =>
                  el.id === id ? { ...el, rotation: angle } : el
                )
              );
            }}
            onScaleEnd={({ id, scale }) => {
              setElements((prevElements) =>
                prevElements.map((el) =>
                  el.id === id ? { ...el, scale } : el
                )
              );
            }}
          >
            <Text style={[styles.draggableText, element.format]}>
              {element.content}
            </Text>
          </DraggableElement>
        );
      case "image":
        return (
          <DraggableElement
            key={element.id}
            id={element.id}
            initialX={element.x}
            initialY={element.y}
            initialRotation={0}
            initialScale={1}
            onDragEnd={({ id, x, y }) => updateElementPosition(id, x, y)}
            onPress={handleElementPress}
            onLongPress={handleElementLongPress}
            onRotateEnd={({ id, rotation }) => {
              const angle = rotation * (180 / Math.PI);
              setElements((prevElements) =>
                prevElements.map((el) =>
                  el.id === id ? { ...el, rotation: angle } : el
                )
              );
            }}
            onScaleEnd={({ id, scale }) => {
              setElements((prevElements) =>
                prevElements.map((el) =>
                  el.id === id ? { ...el, scale } : el
                )
              );
            }}
          >
            <Image
              source={{ uri: element.content }}
              style={styles.draggableImage}
            />
          </DraggableElement>
        );
      default:
        return null;
    }
  };

  // モーダル関係
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} accessibilityLabel="閉じる">
          <X size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ログ作成</Text>
        <TouchableOpacity
          onPress={() => handleFabOptionPress("save")}
          accessibilityLabel="保存"
        >
          <Save size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>{elements.map(renderElement)}</View>
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleFab}
        accessibilityLabel="オプションを追加"
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
      {fabOpen && (
        <View style={styles.fabOptions}>
          <TouchableOpacity
            style={styles.fabOption}
            onPress={() => handleFabOptionPress("text")}
            accessibilityLabel="テキストを追加"
          >
            <AlignLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabOption}
            onPress={() => handleFabOptionPress("photo")}
            accessibilityLabel="写真を追加"
          >
            <Camera size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabOption}
            onPress={() => handleFabOptionPress("user")}
            accessibilityLabel="ユーザーを追加"
          >
            <UserPlus size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabOption}
            onPress={() => handleFabOptionPress("layout")}
            accessibilityLabel="レイアウトを追加"
          >
            <Layout size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      <TextInputModal
        visible={showTextInputModal}
        initialText={editingElement ? editingElement.content : ""}
        initialFormat={
          editingElement ? editingElement.format : defaultTextFormat
        }
        onClose={() => {
          setShowTextInputModal(false);
          setEditingElement(null);
        }}
        onSave={handleSaveText}
        onDelete={() => editingElement && deleteElement(editingElement.id)}
      />

      {/* 選択済みメンバーの表示 */}
      <View style={styles.memberList}>
        {membersWithPermissions.map((member) => (
          <View key={member.id} style={styles.memberChip}>
            <Text style={styles.memberChipText}>{member.name}</Text>
          </View>
        ))}
      </View>

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
              redirectTo: "LogCreation", // 確定後にLogCreationに戻る
            },
          }}
        />
      </Modal>
    </View>
  );
}

// デバウンス処理
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
