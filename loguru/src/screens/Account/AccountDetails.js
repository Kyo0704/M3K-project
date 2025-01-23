/**
 * ファイル名：AccountDetails.js
 * 画面名：アカウント情報確認・編集
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useCallback } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

export default function AccountDetails() {
  const [userData, setUserData] = useState()  // ユーザーデータ
  const navigation = useNavigation()
  const [changeIcon, setChangeIcon] = useState()  // 変更後のユーザーアイコン
  const [changeUserName, setChangeUserName] = useState()  // 変更後のユーザーネーム
  const [userId, setUserId] = useState()

  // 画面がフォーカスされた際に実行
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await checkLogin()
        await getUserData()
        checkMediaAccess()
      })()
    }, [])
  );

  // ログイン確認
  const checkLogin = async () => {
    try {
      const value = await AsyncStorage.getItem("userId")
      setUserId(value)
      if (!value) {
        navigation.navigate('SignIn')
      }
    } catch (error) {
      console.log("[error]AsyncStorageエラー:", error)
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

  // ユーザーデータの取得
  const getUserData = async () => {
    try {
      let url = new URL('http://10.108.1.128:3000/userData')
      url.searchParams.append('userId', userId)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        try {
          const data = await response.json()
          setUserData(data[0])
        } catch (error) {
          console.log("[error]JSONエラー:", error)
        }
      } else {
        console.log("[error]レスポンスエラー:", response.status)
      }
    } catch (error) {
      console.log("[error]fetchエラー:", error)
    }
  }

  // アカウント画像変更ボタンを押したとき
  const onPressChangeIcon = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      exif: true,
      aspect: [1, 1]
    });

    if (!result.canceled) {
      setChangeIcon(result.assets[0].uri);
      sendIcon()
    } else {
      console.log("[error]画像が正しく選択されませんでした。")
    }
  }

  // アカウント画像の送信
  const sendIcon = async () => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      const responseImage = await fetch(changeIcon);
      const blob = await responseImage.blob();
      formData.append('image', blob, {
        uri: changeIcon, // 必要に応じて
        type: 'image/png', // または 'image/jpeg' など適切なmime type
        name: `${userId}_Icon.png`
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

      } else {
        console.log("[error]APIエラー:", response.status)
      }
    } catch (error) {
      console.log("[error]fetchエラー:", error)
    }
  }

  // アカウント名変更ボタンを押したとき
  const onPressChangeName = () => {
    navigation.navigate('ChangeUserName')
  }

  // メールアドレス変更ボタンを押したとき
  const onPressChangeMailAddress = () => {
    navigation.navigate('ChangeEmail')
  }

  // パスワード変更ボタンを押したとき
  const onPressChangePassword = () => {
    navigation.navigate('ChangePassword')
  }

  // 戻るボタンが押されたとき
  const onPressConfirmed = () => {
    navigation.navigate('Account')
  }

  // アカウント画像表示
  const ViewAccountIcon = () => {
    if (userData && !changeIcon) {
      return (
        <View className='flex flex-row mx-auto mt-10'>
          <Image style={{ resizeMode: 'cover' }} className="w-16 h-16 rounded-full my-auto" source={{ uri: userData.profile_image }}></Image>
          <View className='flex flex-col h-24 justify-center'>
            <View className='flex flex-row'>
              <Text className='text-2xl ml-3'>アカウント画像</Text>
              <Pressable onPress={onPressChangeIcon}>
                <Text className='text-xl ml-3 border-black px-3 rounded-2xl border'>変更する</Text>
              </Pressable>
            </View>
            <Text className='h-12 ml-3 text-gray-400'>アカウント画像を変更する場合は{"\n"}こちらから行ってください。</Text>
          </View>
        </View>
      )
    } else if (changeIcon) {
      return (
        <View className='flex flex-row mx-auto mt-10'>
          <Image style={{ resizeMode: 'cover' }} className="w-16 h-16 rounded-full my-auto" source={{ uri: changeIcon }}></Image>
          <View className='flex flex-col h-24 justify-center'>
            <View className='flex flex-row'>
              <Text className='text-2xl ml-3'>アカウント画像</Text>
              <Pressable onPress={onPressChangeIcon}>
                <Text className='text-xl ml-3 border-black px-3 rounded-2xl border'>変更する</Text>
              </Pressable>
            </View>
            <Text className='h-12 ml-3 text-gray-400'>アカウント画像を変更する場合は{"\n"}こちらから行ってください。</Text>
          </View>
        </View>
      )
    }
  }

  // アカウント名の表示
  const ViewAccountName = () => {
    if (userData) {
      return (
        <View className='mx-auto w-10/12 mt-5'>
          <Text className=' text-gray-400'>アカウント名</Text>
          <View className='flex flex-row justify-between'>
            <Text className='text-2xl'>{userData.name}</Text>
            <Pressable onPress={onPressChangeName}>
              <Text className=' border border-black rounded-2xl px-3 items-center my-auto text-xl'>変更する</Text>
            </Pressable>
          </View>
          <Text className='text-gray-400'>アカウント名を変更する場合はこちらから行ってください。</Text>
        </View>
      )
    }
  }

  // メールアドレスの表示
  const ViewMailAddress = () => {
    if (userData) {
      return (
        <View className='mx-auto w-10/12 mt-5'>
          <Text className=' text-gray-400'>メールアドレス</Text>
          <View className='flex flex-row justify-between'>
            <Text className='text-2xl'>{userData.mailAddress}</Text>
            <Pressable onPress={onPressChangeMailAddress}>
              <Text className=' border border-black rounded-2xl px-3 items-center my-auto text-xl'>変更する</Text>
            </Pressable>
          </View>
          <Text className='text-gray-400'>メールアドレスを変更する場合はこちらから行ってください。</Text>
        </View>
      )
    }
  }

  // パスワードの表示
  const ViewPassword = () => {
    if (userData) {
      return (
        <View className='mx-auto w-10/12 mt-5'>
          <Text className=' text-gray-400'>パスワード</Text>
          <View className='flex flex-row justify-between'>
            <Text className='text-2xl'>*************</Text>
            <Pressable onPress={onPressChangePassword}>
              <Text className=' border border-black rounded-2xl px-3 items-center my-auto text-xl'>変更する</Text>
            </Pressable>
          </View>
          <Text className='text-gray-400'>パスワードを変更する場合はこちらから行ってください。</Text>
        </View>
      )
    }
  }

  return (
    <ScrollView className='w-full h-full bg-white'>
      <View>
        {/* アカウント画像 */}
        <ViewAccountIcon />
        {/* アカウント名 */}
        <ViewAccountName />
        {/* メールアドレス */}
        <ViewMailAddress />
        {/* パスワード */}
        <ViewPassword />
        <Pressable onPress={onPressConfirmed} className='bg-orange-400 w-9/12 mx-auto mt-10 py-3'>
          <Text className='text-white text-center text-2xl'>戻る</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}