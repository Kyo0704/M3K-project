/**
 * ファイル名：PhotoUpload.js
 * 画面名：画像タグ付け画面
 * 説明：画像のタグ付け
 * 　　　画像の新規アップロード
 */

import { Pressable, Text, View, TextInput, ScrollView, Image } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import "@/global.css"
import uuid from 'react-native-uuid'; // uuid のインポート


export default function PhotoUpload() {
  const [image, setImage] = useState(null);  // デバイスから選択した画像
  const [selectedTag, setSelectedTag] = useState([])  // ユーザーが選択しているタグ
  const [exitingTags, setExitingTags] = useState([])  // 既存タグ
  const [viewExitingTags, setViewExitingTags] = useState([])  // 表示する既存タグ
  const [serchExitingTagText, setSearchExitingTagText] = useState()  // 既存タグの検索テキスト
  const [exifData, setExifData] = useState()  // 画像の日時情報
  const [isNewUpload, setIsNewUpload] = useState(true)  // 新規アップロードフラグ
  const [photoId, setPhotoId] = useState()  // photo_idを格納
  const [s3, setS3] = useState()  // 画像のs3URL
  const [userId, setUserId] = useState()  // ユーザーID
  const [isImageFile, setIsImageFile] = useState(true)  // 画像ファイルの有無
  const [manualTag, setManualTag] = useState()  // マニュアルタグ
  const navigation = useNavigation()
  const route = useRoute()

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (route.params) {
          setPhotoId(route.params.photo_id)
          setS3(route.params.s3)
          setIsNewUpload(false)
        }
        await getUserId()
        await getExitingTag()
        await getSelectedTag()
        checkMediaAccess()
      })();
    }, [])
  );

  // ユーザーネームの取得
  const getUserId = async () => {
    try {
      let userId = await AsyncStorage.getItem("userId");
      setUserId(userId)
    } catch (error) {
      console.error("AsyncStorageでエラー：", error)
    }
  }

  // メディアのアクセス権
  const checkMediaAccess = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  // 既存タグの取得
  const getExitingTag = async () => {
    try {
      const response = await fetch('http://192.168.0.20:3000/exitingTags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        try {
          const data = await response.json()
          setExitingTags(data)
          setViewExitingTags(data)
        } catch (error) {
          console.error("JSONのパースに失敗：", error)
        }
      } else {
        console.error("レスポンスエラー：", response.status)
      }
    } catch (error) {
      console.error("fetch処理でエラー：", error)
    }
  }

  // 現在選択中のタグを取得
  const getSelectedTag = async () => {
    try {
      let url = new URL('http://192.168.0.20:3000/selectedTags')
      url.searchParams.append('userId', userId)
      url.searchParams.append('photo_id', photoId)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        try {
          const data = await response.json()
          setSelectedTag(data)
        } catch (error) {
          console.error("JSONのパースに失敗:", error)
        }
      } else {
        console.error("レスポンスエラー:", response.status)
      }
    } catch (error) {
      console.error("fetch処理でエラー：", error)
    }
  }

  // 写真のアップロードボタンが押されたとき
  const onPressPhotoUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      exif: true
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setExifData(result.assets[0].exif.DateTime)
    } else {
      console.error("画像が正しく選択されませんでした。")
    }
  }

  // タグの削除ボタン(×ボタン)が押されたとき
  const onPressTagDelete = (tag) => {
    setSelectedTag(selectedTag.filter(selected => selected.tempId !== tag && selected.id !== tag));
  }

  // 既存タグの検索
  const onSubmitEditingSerchExitingText = () => {
    setViewExitingTags(exitingTags.filter(item => item.tagName.includes(serchExitingTagText)))
  }

  // 既存タグの追加ボタンが押されたとき
  const onPressAddExitingTag = (tagNumber) => {
    if (!selectedTag.find(selected => selected.id === tagNumber)) {
      setSelectedTag([...selectedTag, exitingTags.find(data => data.id === tagNumber)]);
    }
  }

  // 手動でタグを追加
  const onSubmitEditingManualTag = () => {
    if (manualTag && manualTag.trim() !== "") {
      // 重複チェック
      const isDuplicate = selectedTag.some(
        (tag) => tag.tagName === manualTag.trim()
      );

      if (isDuplicate) {
        alert("同じ名前のタグが既に存在します。");
        setManualTag("");
        return;
      }

      const newTag = { tagName: manualTag.trim(), tempId: uuid.v4() };
      setSelectedTag([...selectedTag, newTag]);
      setManualTag("");
    }
  }

  // 保存ボタンが押されたとき
  const onPressSave = async () => {
    /**
     * タグの格納
     * 新規タグ(手動で追加) -> tagName
     * 既存タグ -> tag.id
     */
    let tagsToSend = selectedTag.map(tag => {
      if (tag.tempId) {
        return { tagName: tag.tagName } // 手動タグの場合
      } else {
        return { id: tag.id } // 既存タグの場合
      }
    })
    if (isNewUpload && image) {
      // 新規アップロードかつ画像があるとき
      setIsImageFile(true)
      try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('tags', tagsToSend)
        formData.append("date", exifData)
        const responseImage = await fetch(image);
        const blob = await responseImage.blob();
        formData.append('image', blob, {
          uri: image, // 必要に応じて
          type: 'image/png', // または 'image/jpeg' など適切なmime type
          name: `${userId}_nwePhoto.png`
        });
        let url = new URL('http://192.168.0.20:3000/newPhoto')
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.ok) {
          navigation.navigate('Photo')
        } else {
          console.error("API処理でエラー：", response.status)
        }
      } catch (error) {
        console.error("fetch処理でエラー", error)
      }
    } else if (isNewUpload && !image) {
      // 新規アップロードかつ画像ファイルがない時
      setIsImageFile(false)
    } else {
      // 新規アップロードではないとき
      try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('tags', tagsToSend)
        formData.append('photo_id', photoId)
        let url = new URL('http://192.168.0.20:3000/newPhoto')
        const response = await fetch(url, {
          method: 'POST',
          body: formData, // body に FormData をセット
        });

        if (response.ok) {
          navigation.navigate('Photo')
        } else {
          console.error("API処理でエラー：", response.status)
        }
      } catch (error) {
        console.error("fetch処理でエラー：", error)
      }
    }
  }

  // 戻るボタンが押されたとき
  const onPressBack = () => {
    navigation.navigate('Photo')
  }

  // 画像をアップロードするテキスト
  const ViewImageUploadText = () => {
    if (isNewUpload && image) {
      return (
        <Pressable onPress={onPressPhotoUpload}>
          <Text className="text-center bg-orange-500 text-white py-2 w-52 mx-auto mt-5 rounded-2xl">写真を変更する</Text>
        </Pressable>
      )
    } else if (isNewUpload && !image) {
      return (
        <Pressable onPress={onPressPhotoUpload}>
          <Text className="text-center bg-orange-500 text-white py-2 w-52 mx-auto mt-5 rounded-2xl">写真をアップロードする</Text >
        </Pressable >
      )
    }
  }

  // 画像の表示
  const ViewImage = () => {
    if (!isNewUpload) {
      return (
        <View>
          <Image className="h-56 mt-3" style={{ resizeMode: 'contain' }} source={{ uri: s3 }}></Image>
        </View>
      )
    }
    if (image) {
      return (
        <View>
          {image && <Image className="h-56 mt-3" style={{ resizeMode: 'contain' }} source={{ uri: image }} />}
        </View>
      )
    }
  }

  // エラーテキストの表示
  const ViewErrorText = () => {
    if (!isImageFile) {
      return (
        <View>
          <Text className="ml-6 text-red-600 font-bold">※画像が選択されていません。</Text>
        </View>
      )
    }
  }

  return (
    <ScrollView className="bg-white w-screen h-screen">
      <View>
        <ViewImageUploadText />
        {/* 画像の表示 */}
        <ViewImage />
        {/* 撮影日 */}
        <View className=" bg-white rounded-lg mx-auto my-5 py-3 w-11/12 overflow-hidden shadow-lg">
          <Text className="ml-5">撮影日</Text>
          {/* {exifData && <Text className="ml-5">{exifData}</Text>} */}
          {exifData ? (
            <Text className="ml-5">{exifData}</Text>
          ) : (
            <Text className="ml-5">日時情報がありません</Text>
          )}
        </View>
        {/* タグ */}
        <View className=" bg-white rounded-lg mx-auto my-5 pt-3 w-11/12 overflow-hidden shadow-lg">
          <Text className="ml-5">タグ</Text>
          <View className=" flex-row flex-wrap">
            {selectedTag && Object.values(selectedTag).map((e, index) => (
              <View className="flex-row bg-white rounded-3xl py-1 my-3 ml-5 px-3 border border-gray-300" key={index}>
                <Text className="w-fit">{e.tagName}</Text>
                <Pressable onPress={() => onPressTagDelete(e.id)}>
                  <Feather className="w-fit pt-1 pl-1" name="x" size={16} color="#666" />
                </Pressable>
              </View>
            ))}
            <View className="mb-5" />
          </View>
        </View>
        {/* 既存タグの追加 */}
        <View className=" bg-white rounded-lg mx-auto my-5 pt-3 w-11/12 overflow-hidden shadow-lg" >
          <View className="flex-row">
            <Text className="ml-5">既存タグの追加</Text>
            <View className='flex flex-row items-center bg-gray-100 mx-4 rounded-lg h-8 w-64'>
              <Feather name="search" size={15} color="#666" />
              <TextInput
                className="flex-1 text-sm h-10"
                placeholder="検索"
                placeholderTextColor="#666"
                onChangeText={setSearchExitingTagText}
                onSubmitEditing={onSubmitEditingSerchExitingText}
              />
            </View>
          </View>
          <View>
            <View className=" flex-row flex-wrap">
              {viewExitingTags && Object.values(viewExitingTags).map((e, index) => (
                <Pressable onPress={() => onPressAddExitingTag(e.id)} key={index}>
                  <View className="flex-row bg-white rounded-3xl py-1 my-3 ml-5 px-3 border border-gray-300 ">
                    <Text className="w-fit">{e.tagName}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        {/* 手動でタグを追加 */}
        <View className=" bg-white rounded-lg mx-auto my-5 pt-3 w-11/12 overflow-hidden shadow-lg" >
          <View>
            <Text className="ml-5">手動でタグを追加</Text>
            {/* widthの調整 */}
            <View className='flex flex-row items-center bg-gray-100 mx-4rounded-lg h-12 w-10/12 my-2 mx-5 rounded-xl'>
              <TextInput
                className="flex-1 text-lg h-12"
                placeholder="テキストを入力"
                placeholderTextColor="#666"
                onChangeText={setManualTag}
                onSubmitEditing={onSubmitEditingManualTag}
              />
            </View>
          </View>
        </View>
        {/* エラーメッセージ */}
        <ViewErrorText />
        {/* 保存＆戻るボタン */}
        <View className="flex-row mx-auto my-3">
          <View className="mx-12">
            <Pressable onPress={onPressSave}>
              <Text className="bg-orange-400 px-4 py-2 text-2xl text-white text-center rounded-2xl">保存</Text>
            </Pressable>
          </View>
          <View className="mx-12">
            <Pressable onPress={onPressBack}>
              <Text className="bg-orange-400 px-4 py-2 text-2xl text-white text-center rounded-2xl">戻る</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView >
  )
}