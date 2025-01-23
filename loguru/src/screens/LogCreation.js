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
} from "lucide-react-native";
// 画像ピッカーとWebSocketクライアントをインポート
import * as ImagePicker from "expo-image-picker";
import io from "socket.io-client";
import { useCallback } from "react";
import styles from "./CSS/LogCreationStyle.js"; // スタイルシートをインポート
import { useNavigation } from "@react-navigation/native"; // ナビゲーションフックをインポート
import MemberSelect from "./MemberSelect.js"; // メンバー選択コンポーネントをインポート
import AsyncStorage from "@react-native-async-storage/async-storage"; //AsyncStorageをインポート
// ドラッグ可能な要素のコンポーネント
const DraggableElement = ({
  children,
  id,
  initialX = 0,
  initialY = 0,
  onDragEnd,
  onPress,
  onLongPress,
}) => {
  // ドラッグ位置を管理するためのref
  const pan = useRef(
    new Animated.ValueXY({ x: initialX, y: initialY })
  ).current;
  const scale = useRef(new Animated.Value(1)).current; //要素の拡大縮小を管理するためのref
  const rotation = useRef(new Animated.Value(0)).current; //要素の回転を管理するためのref
  const [isDragging, setIsDragging] = useState(false); // ドラッグ中かどうかの状態
  const dragThreshold = 5; // ドラッグと判定する閾値

  // パンレスポンダーの設定
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true, // 常にパンレスポンダーを設定
    onPanResponderGrant: () => {
      setIsDragging(false); // ドラッグ開始時にフラグをリセット
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.numberActiveTouches === 2) {
        // 2本指でドラッグした場合
        const dx = gestureState.moveX - gestureState.x0; // ドラッグのX方向の移動量
        const dy = gestureState.moveY - gestureState.y0; //ドラッグのY方向の移動量
        const distance = Math.sqrt(dx * dx + dy * dy); // ドラッグの距離を計算
        scale.setValue(1 + distance / 100); // 距離に応じて拡大縮小

        const angle = Math.atan2(dy, dx); // ドラッグの角度を計算
        rotation.setValue(angle); // 角度に応じて回転
      } else {
        if (
          Math.abs(gestureState.dx) > dragThreshold ||
          Math.abs(gestureState.dy) > dragThreshold
        ) {
          setIsDragging(true);
        }
        Animated.event([{ dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(gestureState);
      }
    },
    onPanResponderRelease: () => {
      pan.flattenOffset(); // オフセットをリセット
      if (isDragging) {
        onDragEnd({ id, x: pan.x._value, y: pan.y._value }); // ドラッグ終了時の処理
      } else {
        onPress(id); // ドラッグでない場合はクリック処理
      }
      setIsDragging(false);
    },
    onPanResponderTerminationRequest: () => false, // 他のレスポンダーに奪われないようにする
    onLongPress: () => onLongPress(id), // 長押し時の処理
  });

  return (
    <Animated.View
      {...panResponder.panHandlers} // パンレスポンダーをバインド
      style={[
        styles.draggable,
        {
          transform: [
            { translateX: pan.x },//X方向の移動
            { translateY: pan.y },
            { scale: scale },
            {
              rotate: rotation.interpolate({
                inputRange: [-Math.PI, Math.PI],//回転の範囲
                outputRange: ["-180deg", "180deg"],//回転の範囲
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// フォントサイズ選択コンポーネント
const FontSizeSelector = ({ currentSize, onSizeChange }) => {
  const [isOpen, setIsOpen] = useState(false); // ドロップダウンの開閉状態
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40];
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
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() =>
            onFormatChange(
              "fontFamily",
              currentFormat.fontFamily === "System" ? "hiragana" : "System"
            )
          }
          accessibilityLabel="フォントファミリーを変更"
        >
          <Type
            size={24}
            color={currentFormat.fontFamily === "Hiragino" ? "#C1A14E" : "#333"}
          />
        </TouchableOpacity>
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
  const [selectedText, setSelectedText] = useState(""); // 選択中のテキスト
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

  // フォーマットの変更を処理
  const handleFormatChange = (key, value) => {
    setFormat((prev) => ({ ...prev, [key]: value }));
  };

  // テキスト選択時の処理
  const handleTextSelection = (event) => {
    const { selection } = event.nativeEvent;
    const selected = text.substring(selection.start, selection.end);
    setSelectedText(selected);

    // 選択が解除された場合、プレビューをクリア
    if (selection.start === selection.end) {
      setSelectedText("");
    }
  };

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
              {selectedText || text || "プレビュー"}
            </Text>
          </View>

          <TextInput
            style={[styles.modalInput, format]}
            value={text}
            onChangeText={setText}
            onSelectionChange={handleTextSelection} // テキスト選択時のイベントハンドラを追加
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

// 要素を個別に保存
const saveElement = async (element) => {
  try {
    const jsonValue = JSON.stringify(element); // 要素をJSON形式に変換
    await AsyncStorage.setItem(`@element_${element.id}`, jsonValue); // ローカルストレージに保存
    Alert.alert("保存完了", `${element.type}が保存されました`); // 保存完了メッセージを表示
  } catch (e) {
    console.error(e); // エラーをログに出力
    Alert.alert("保存失敗", `${element.type}の保存に失敗しました`); // 保存失敗メッセージを表示
  }
};



// ピンの状態を保存する関数
const savePinState = async (pinId, elements) => {
  try {
    const jsonValue = JSON.stringify(elements);
    await AsyncStorage.setItem(`@pin_${pinId}_elements`, jsonValue);
    Alert.alert("保存完了", "ピンの状態が保存されました");
  } catch (e) {
    console.error(e);
    Alert.alert("保存失敗", "ピンの状態の保存に失敗しました");
  }
};

// ピンの状態を読み込む関数
const loadPinState = async (pinId) => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@pin_${pinId}_elements`);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

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

  // メンバー追加ボタンの処理
  const handleAddMembers = () => {
    setShowMemberModal(true); // モーダルを開く
  };

  // メンバー選択後の処理
  const handleSaveMembers = (selectedMembers) => {
    setMembersWithPermissions(selectedMembers); // 選択されたメンバーを保存
    setShowMemberModal(false); // モーダルを閉じる
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
              format: { ...defaultTextFormat },
            },
            {
              id: "2",
              type: "text",
              content: marker.description,
              x: 50,
              y: 100,
              format: { ...defaultTextFormat },
            },
          ]);
        }
      }
    };
    loadElements();
  }, [marker]);

  useEffect(() => {
    const loadElements = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@elements"); //ローカルストレージから要素を取得
        if (jsonValue !== null) {
          setElements(JSON.parse(jsonValue)); // 取得した要素を状態に設定
        }
      } catch (e) {
        console.error(e); // エラーをログに出力
      }
    };
    loadElements();
  }, []);

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
        setShowMemberModal(true); // メンバー選択モーダルを表示
        console.log("ユーザー追加");
        break;
      case "layout":
        console.log("レイアウト追加");
        break;
      case "save":
        elements.forEach(saveElement);
        savePinState(marker.id, elements); // ピンの状態を保存
        console.log("保存");
        onClose();
        break;
      default:
        console.log("未対応のオプションが選択されました");
    }
    setFabOpen(false);
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
            onDragEnd={({ id, x, y }) => updateElementPosition(id, x, y)}
            onPress={handleElementPress}
            onLongPress={handleElementLongPress}
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
            onDragEnd={({ id, x, y }) => updateElementPosition(id, x, y)}
            onPress={handleElementPress}
            onLongPress={handleElementLongPress}
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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>{elements.map(renderElement)}</View>
      </ScrollView>
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
          navigation={navigation} // 必要に応じてナビゲーションを渡す
          route={{
            params: {
              onMembersSelected: handleSaveMembers, // メンバー選択後のコールバック
              redirectTo: "LogCreation", // 遷移先の指定
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