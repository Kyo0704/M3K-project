import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, PanResponder, Animated, TextInput, ScrollView, Modal, Alert, FlatList } from 'react-native';
import { X, Plus, AlignLeft, UserPlus, Layout, Camera, Save, Type, Bold, Italic, Underline, AlignCenter, AlignRight, Palette, Trash2, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import io from 'socket.io-client';
import { useCallback } from 'react';
//ドラッグ処理
const DraggableElement = ({ children, id, initialX = 0, initialY = 0, onDragEnd, onPress, onLongPress }) => {
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const [isDragging, setIsDragging] = useState(false);
  const dragThreshold = 5;//ドラッグの閾値

  //画面取得
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging(false);
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: (_, gestureState) => {
      if (Math.abs(gestureState.dx) > dragThreshold || Math.abs(gestureState.dy) > dragThreshold) {
        setIsDragging(true);
      }
      Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(_, gestureState);
    },
    onPanResponderRelease: (_, gestureState) => {
      pan.flattenOffset();
      if (isDragging) {
        onDragEnd({ id, x: pan.x._value, y: pan.y._value });
      } else {
        onPress(id);
      }
      setIsDragging(false);
    },
    onPanResponderTerminationRequest: () => false,
    onLongPress: () => onLongPress(id),
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.draggable,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
    >
      {children}
    </Animated.View>
  );
};


//フォントサイズの変更
const FontSizeSelector = ({ currentSize, onSizeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40];

  return (
    <View style={styles.fontSizeSelector}>
      <TouchableOpacity 
        onPress={() => setIsOpen(!isOpen)} 
        style={styles.fontSizeButton} 
        accessibilityLabel="フォントサイズを選択"
      >
        <Text style={styles.fontSizeButtonText}>{currentSize}</Text>
        <ChevronDown size={16} color="#333" />
      </TouchableOpacity>
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.fontSizeModalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.fontSizeDropdownContainer}>
            <ScrollView style={styles.fontSizeDropdown}>
              {fontSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={styles.fontSizeOption}
                  onPress={() => {
                    onSizeChange(size);
                    setIsOpen(false);
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

//カラーピッチャー
const ColorPicker = ({ onColorChange }) => {
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF'];

  return (
    <View style={styles.colorPicker}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[styles.colorOption, { backgroundColor: color }]}
          onPress={() => onColorChange(color)}
          accessibilityLabel={`色を選択: ${color}`}
        />
      ))}
    </View>
  );
};

//テキストフォーマットの変更

const TextFormatToolbar = ({ onFormatChange, currentFormat, onDelete }) => (
  <View style={styles.toolbarContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar}>
      <View style={styles.toolbarGroup}>
        <TouchableOpacity 
          style={styles.toolbarButton} 
          onPress={() => onFormatChange('fontFamily', currentFormat.fontFamily === 'System' ? 'Hiragino' : 'System')}
          accessibilityLabel="フォントファミリーを変更"
        >
          <Type size={24} color={currentFormat.fontFamily === 'Hiragino' ? '#C1A14E' : '#333'} />
        </TouchableOpacity>
        <FontSizeSelector
          currentSize={currentFormat.fontSize}
          onSizeChange={(size) => onFormatChange('fontSize', size)}
        />
      </View>

      <View style={styles.toolbarGroup}>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => onFormatChange('fontWeight', currentFormat.fontWeight === 'normal' ? 'bold' : 'normal')}
          accessibilityLabel="太字を切り替え"
        >
          <Bold size={24} color={currentFormat.fontWeight === 'bold' ? '#C1A14E' : '#333'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => onFormatChange('fontStyle', currentFormat.fontStyle === 'normal' ? 'italic' : 'normal')}
          accessibilityLabel="斜体を切り替え"
        >
          <Italic size={24} color={currentFormat.fontStyle === 'italic' ? '#C1A14E' : '#333'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => onFormatChange('textDecorationLine', currentFormat.textDecorationLine === 'none' ? 'underline' : 'none')}
          accessibilityLabel="下線を切り替え"
        >
          <Underline size={24} color={currentFormat.textDecorationLine === 'underline' ? '#C1A14E' : '#333'} />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbarGroup}>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => onFormatChange('textAlign', 'left')}
          accessibilityLabel="左揃え"
        >
          <AlignLeft size={24} color={currentFormat.textAlign === 'left' ? '#C1A14E' : '#333'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => onFormatChange('textAlign', 'center')}
          accessibilityLabel="中央揃え"
        >
          <AlignCenter size={24} color={currentFormat.textAlign === 'center' ? '#C1A14E' : '#333'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => onFormatChange('textAlign', 'right')}
          accessibilityLabel="右揃え"
        >
          <AlignRight size={24} color={currentFormat.textAlign === 'right' ? '#C1A14E' : '#333'} />
        </TouchableOpacity>
      </View>
    </ScrollView>
    
    <TouchableOpacity 
      style={styles.deleteButton}
      onPress={() => {
        Alert.alert(
          "要素の削除",
          "この要素を削除してもよろしいですか？",
          [
            { text: "キャンセル", style: "cancel" },
            { 
              text: "削除", 
              onPress: onDelete,
              style: "destructive" 
            }
          ]
        );
      }}
      accessibilityLabel="テキストを削除"
    >
      <Trash2 size={24} color="#FF0000" />
    </TouchableOpacity>
  </View>
);
//テキスト入力モーダル
const TextInputModal = ({ visible, initialText, initialFormat, onClose, onSave, onDelete }) => {
  const [text, setText] = useState(initialText);
  const [format, setFormat] = useState(initialFormat);
  const [previewText, setPreviewText] = useState('');
  const [otherUsers, setOtherUsers] = useState([]);
  const [socket, setSocket] = useState(null);



  useEffect(() => {
    // WebSocket接続を確立
    const newSocket = io('YOUR_WEBSOCKET_SERVER_URL');
    setSocket(newSocket);

    // クリーンアップ関数
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      // 他のユーザーの更新を受信
      socket.on('userUpdate', (userData) => {
        setOtherUsers((prevUsers) => {
          const existingUserIndex = prevUsers.findIndex(user => user.id === userData.id);
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
      socket.on('userLeft', (userId) => {
        setOtherUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      });
    }
  }, [socket]);

  const debouncedEmitChanges = useCallback(
    debounce((newText, newFormat) => {
      if (socket) {
        socket.emit('textUpdate', { text: newText, format: newFormat });
      }
    }, 100),
    [socket]
  );

  useEffect(() => {
    // テキストまたはフォーマットが変更されたときに更新を送信
    debouncedEmitChanges(text, format);
  }, [text, format, debouncedEmitChanges]);

  const handleFormatChange = (key, value) => {
    setFormat(prev => ({ ...prev, [key]: value }));
  };

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
            <ColorPicker onColorChange={(color) => handleFormatChange('color', color)} />
          </View>

          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, format]}>{previewText || 'プレビュー'}</Text>
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

const OtherUsersPreview = ({ users }) => (
  <View style={styles.otherUsersContainer}>
    {users.map(user => (
      <View key={user.id} style={styles.otherUserPreview}>
        <Text style={styles.otherUserName}>{user.name}</Text>
        <Text style={[styles.otherUserText, user.format]}>{user.text}</Text>
      </View>
    ))}
  </View>
);
//メイン処理・マーカーの情報取得
export default function LogCreation({ marker, onClose }) {
  const [fabOpen, setFabOpen] = useState(false);
  const [elements, setElements] = useState([]);
  const [editingElement, setEditingElement] = useState(null);
  const [showTextInputModal, setShowTextInputModal] = useState(false);
  const [newTextPosition, setNewTextPosition] = useState({ x: 0, y: 0 });

  const defaultTextFormat = {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecorationLine: 'none',
    color: '#333',
    textAlign: 'left',
  };

  useEffect(() => {
    if (marker) {
      setElements([
        { id: '1', type: 'text', content: marker.title, x: 50, y: 50, format: { ...defaultTextFormat } },
        { id: '2', type: 'text', content: marker.description, x: 50, y: 100, format: { ...defaultTextFormat } },
      ]);
    }
  }, [marker]);
  //画像アップロード
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],//アスペクト比
      quality: 1,
    });

    if (!result.canceled) {
      addElement('image', result.assets[0].uri, 100, 100);
    }
  };

  //FAB
  const toggleFab = () => {
    setFabOpen(!fabOpen);
  };

  //FAB展開処理
  const handleFabOptionPress = (option) => {
    switch (option) {
      case 'text':
        setNewTextPosition({ x: 100, y: 100 });
        setShowTextInputModal(true);
        break;
      case 'photo':
        pickImage();
        break;
      case 'user':
        console.log('ユーザー追加');
        break;
      case 'layout':
        console.log('レイアウト追加');
        break;
      case 'save':
        console.log('保存');
        onClose();
        break;
      default:
        console.log('未対応のオプションが選択されました');
    }
    setFabOpen(false);
  };

  //テキストなどの情報に位置情報を付与
  const addElement = (type, content, x, y, format) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      content,
      x,
      y,
      format,
    };
    setElements([...elements, newElement]);
  };

  //位置情報更新
  const updateElementPosition = (id, x, y) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      )
    );
  };

  //テキストの長押し処理
  const handleElementPress = (id) => {
    const element = elements.find(el => el.id === id);
    if (element.type === 'text') {
      setEditingElement(element);
      setShowTextInputModal(true);
    }
  };

  //使用されてないっすね
  const handleElementLongPress = (id) => {
    Alert.alert(
      "要素の削除",
      "この要素を削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "削除", style: "destructive", onPress: () => deleteElement(id) }
      ]
    );
  };

  //テキスト保存処理
  const handleSaveText = (text, format) => {
    if (editingElement) {
      setElements((prevElements) =>
        prevElements.map((el) =>
          el.id === editingElement.id ? { ...el, content: text, format } : el
        )
      );
      setEditingElement(null);
    } else {
      addElement('text', text, newTextPosition.x, newTextPosition.y, format);
    }
    setShowTextInputModal(false);
  };

  //テキスト削除処理
  const deleteElement = (id) => {
    setElements((prevElements) => prevElements.filter((el) => el.id !== id));
    setEditingElement(null);
    setShowTextInputModal(false);
  };

  //ドラッグ処理の中身
  const renderElement = (element) => {
    switch (element.type) {
      case 'text':
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
            <Text style={[styles.draggableText, element.format]}>{element.content}</Text>
          </DraggableElement>
        );
      case 'image':
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

  //テキスト入力モーダル
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} accessibilityLabel="閉じる">
          <X size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ログ作成</Text>
        <TouchableOpacity onPress={() => handleFabOptionPress('save')} accessibilityLabel="保存">
          <Save size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {elements.map(renderElement)}
      </View>
      <TouchableOpacity style={styles.fab} onPress={toggleFab} accessibilityLabel="オプションを追加">
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
      {fabOpen && (
        <View style={styles.fabOptions}>
          <TouchableOpacity
            style={styles.fabOption}
            onPress={() => handleFabOptionPress('text')}
            accessibilityLabel="テキストを追加"
          >
            <AlignLeft size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabOption}
            onPress={() => handleFabOptionPress('photo')}
            accessibilityLabel="写真を追加"
          >
            <Camera size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabOption}
            onPress={() => handleFabOptionPress('user')}
            accessibilityLabel="ユーザーを追加"
          >
            <UserPlus size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabOption}
            onPress={() => handleFabOptionPress('layout')}
            accessibilityLabel="レイアウトを追加"
          >
            <Layout size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      <TextInputModal
        visible={showTextInputModal}
        initialText={editingElement ? editingElement.content : ''}
        initialFormat={editingElement ? editingElement.format : defaultTextFormat}
        onClose={() => {
          setShowTextInputModal(false);
          setEditingElement(null);
        }}
        onSave={handleSaveText}
        onDelete={() => editingElement && deleteElement(editingElement.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    paddingRight: 8,
    marginRight: 8,
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff1f0',
  },
  colorPickerContainer: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  colorPickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  previewContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 120,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#C1A14E',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  otherUsersContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  otherUserPreview: {
    marginBottom: 8,
  },
  otherUserName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  otherUserText: {
    fontSize: 14,
    color: '#666',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff1f0',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabOptions: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    alignItems: 'center',
  },
  fabOption: {
    backgroundColor: '#555',
    padding: 12,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  draggable: {
    position: 'absolute',
    padding: 8,
  },
  draggableText: {
    fontSize: 16,
    color: '#333',
  },
  draggableImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  toolbarText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginVertical: 16,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 16,
    padding: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  fontSizeSelector: {
    position: 'relative',
    marginHorizontal: 8,
  },
  fontSizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fontSizeButtonText: {
    fontSize: 16,
    marginRight: 4,
  },
  fontSizeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  fontSizeDropdownContainer: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '60%',
  },
  fontSizeDropdown: {
    padding: 8,
  },
  fontSizeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fontSizeOptionText: {
    color: '#333',
    textAlign: 'center',
  },
  memberChip: {
    backgroundColor: '#C1A14E',
    borderRadius:16,
    paddingVertical: 4,
    paddingHorizonal: 8,
  },
  memberChipText: {
    color: '#fff',
    fontSize: 14,
  },
});

//デバウンス処理
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