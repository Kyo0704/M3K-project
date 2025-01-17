/**
 * ファイル名：ChangeUserName.js
 * 画面名：ユーザー名変更画面
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useCallback } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native';
import '@/global.css'

export default function ChangeUserName() {
  const [userId, setUserId] = useState()  // ユーザーID
  const [userData, setUserData] = useState()  // ユーザーデータ
  const [changeUserName, setChangeUserName] = useState()  // 変更後のユーザー名
  const [isError, setIsError] = useState(false)  // エラーフラグ
  const [isNullTextBox, setIsNullTextBox] = useState(false)  // テキストボックスに入力されているか
  const navigation = useNavigation()

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
      console.error("AsyncStorageでエラー：", error)
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
          console.error("JSONのパースに失敗:", error)
        }
      } else {
        console.error("レスポンスエラー:", response.status)
      }
    } catch (error) {
      console.error("fetch処理でエラー：", error)
    }
  }

  // 変更ボタンが押されたとき
  const onPressChangeUserName = async () => {
    if (changeUserName) {
      setIsNullTextBox(false)
      try {
        const data = { userId: userId, changeUserName: changeUserName }
        console.log(data)
        let url = new URL('http://10.65.10.82:3000/changeUserName')
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data })
        });

        if (response.ok) {
          navigation.navigate('AccountDetails')
        } else {
          console.error("API処理に失敗しました：", response.status)
          setIsError(true)
        }
      } catch (error) {
        console.error("fetch処理でエラー：", error)
        setIsError(true)
      }
    } else {
      setIsNullTextBox(true)
    }
  }

  // 戻るボタンが押されたとき
  const onPressBack = () => {
    navigation.goBack()
  }


  return (
    <View className='bg-white w-full h-full'>
      <View className='mx-auto w-9/12 mt-32'>
        <Text className='text-gray-400'>変更前のユーザー名</Text>
        {userData && <Text className='text-2xl'>{userData.name}</Text>}
        <View className='mt-10'>
          <Text className='text-gray-400'>変更後のユーザー名を入力してください。</Text>
        </View>
        <View className='h-16'>
          <TextInput
            className=" text-2xl"
            placeholder="ユーザー名を入力"
            placeholderTextColor="#666"
            onChangeText={setChangeUserName}
          />
        </View>
        {isNullTextBox && <Text className='text-red-600 text-sm'>変更後のユーザー名を入力してください。</Text>}
        {isError && <Text className='text-red-600 text-sm'>エラーが発生しました。</Text>}
        <View className='flex flex-row mx-auto my-3'>
          <View className='mx-6'>
            <Pressable onPress={onPressChangeUserName}>
              <Text className='bg-orange-400 px-3 py-2 text-2xl text-white text-center rounded-2xl w-'>変更する</Text>
            </Pressable>
          </View>
          <View className='mx-6'>
            <Pressable onPress={onPressBack}>
              <Text className='bg-orange-400 px-3 py-2 text-2xl text-white text-center rounded-2xl'>戻る</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}