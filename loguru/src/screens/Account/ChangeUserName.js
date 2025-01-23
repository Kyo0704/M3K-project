/**
 * ファイル名：ChangeUserName.js
 * 画面名：ユーザー名変更画面
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { updateUserAttribute } from 'aws-amplify/auth';

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
      console.log("[error]AsyncStorageエラー:", error)
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

  // 変更ボタンが押されたとき
  const onPressChangeUserName = async () => {
    if (changeUserName) {
      setIsNullTextBox(false)
      try {
        await updateUserAttribute({
          userAttribute: {
            name: changeUserName
          }
        })
        console.log("ユーザーネーム更新 成功")
        setIsError(false)
      } catch (error) {
        console.log("[error]ユーザーネーム更新エラー:", error)
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