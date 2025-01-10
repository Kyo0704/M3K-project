/**
 * ファイル名：Photo.js
 * 画面名：写真閲覧画面
 * 説明：タブの写真閲覧を押したときのトップ画面
 */

import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, Button, Pressable, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Home() {
  const navigation = useNavigation()
  const [photoData, setPhotoData] = useState([])  // 写真データ
  const [viewPhotoData, setViewPhotoData] = useState([])  // 表示する写真データ(検索のため)
  const [searchTagText, setSearchTagText] = useState()  // 検索テキスト
  let userId = '';

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await getUserId();
        await fetchPhotoData();
      })();
    }, [])
  );

  // ユーザーネームの取得
  const getUserId = async () => {
    try {
      userId = await AsyncStorage.getItem("userId");
    } catch (error) {
      console.error('Error reading data:', error);
    }
  }

  // 写真データの取得
  const fetchPhotoData = async () => {
    let url = new URL('http://192.168.0.20:3000/photos');
    url.searchParams.append('userId', userId);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      try {
        const data = await response.json()
        setPhotoData(data)
        setViewPhotoData(groupedPhotos(data))
      } catch (error) {
        console.error("JSONのパースに失敗:", error)
      }
    } else {
      console.error("レスポンスエラー:", response.status)
    }
  }

  // 配列構造の変更
  const groupedPhotos = (data) => {
    const groupedByTag = {};

    data.forEach(item => {
      const tag = item.tags;
      if (!groupedByTag[tag]) {
        groupedByTag[tag] = [];
      }
      groupedByTag[tag].push(item);
    })
    return groupedByTag
  };

  // アップロードボタンが押された時の処理
  const onPressUpload = () => {
    navigation.navigate('PhotoUpload')
  }

  // タグ検索
  const onSubmitEditingSearchTag = () => {
    setViewPhotoData(groupedPhotos(photoData.filter(item => item.tags.includes(searchTagText))))
  }

  // 画像が押されたときの処理
  const onPressImage = (photo_id, s3) => {
    navigation.navigate('PhotoUpload', {
      photo_id: photo_id,
      s3: s3
    })
  }

  return (
    <ScrollView className='bg-white w-screen h-screen'>
      <View>
        {/* 検索ボックス */}
        <View className='flex flex-row items-center bg-gray-100 mx-4 my-2 rounded-lg'>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-8 text-2xl"
            placeholder="検索"
            placeholderTextColor="#666"
            onChangeText={setSearchTagText}
            onSubmitEditing={onSubmitEditingSearchTag}
          />
        </View>
        {/* アップロードボタン */}
        <Pressable onPress={onPressUpload}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }} className="mr-5">
            <Text className=" bg-orange-600 text-white text-center py-2 w-28 rounded-xl">アップロード</Text>
          </View>
        </Pressable>
        {/* タグ付き写真 */}
        {viewPhotoData && Object.values(viewPhotoData).map((e, index) => (
          <View key={index}>
            <Text className="text-2xl ml-3">{e[0].tags}</Text>
            <View className=" border-b-2 " />
            <View className='flex flex-row items-center p-2.5 flex-wrap justify-start'>
              {e && Object.values(e).map((photo) => (
                <Pressable onPress={() => onPressImage(photo.photo_id, photo.s3)} key={photo.photo_id}>
                  <Image
                    key={photo.photo_id} // key propを追加
                    className='m-2'
                    style={{ resizeMode: 'contain', width: 100, height: 100 }} // 幅と高さを追加
                    source={{ uri: photo.s3 }}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}