/**
 * ファイル名：CheckEmail.js
 * 画面名：パスワード変更画面（パスワードを忘れた時）
 * 説明：パスワード変更画面で、パスワードを忘れた際に初めに遷移する画面
 * 　　　認証コードを送るメールアドレスの確認を行う。
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useCallback } from 'react';
import { TextInput } from 'react-native';

export default function CheckEmail() {
  const [userId, setUserId] = useState()  // ユーザーID
  const [userData, setUserData] = useState()  // ユーザーデータ
  const [isError, setIsError] = useState()  // エラーフラグ
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
  const onPressAuthCode = async () => {
    navigation.navigate('CreateNewPassword')  // テスト用：実際には削除する
    try {
      const data = { userId: userId, mailAddress: userData.mailAddress }
      console.log(data)
      let url = new URL('http://10.65.10.82:3000/sendAuthCode')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      });

      if (response.ok) {
        navigation.navigate('CreateNewPassword')
      } else {
        console.error("API処理に失敗しました：", response.status)
        setIsError(true)
      }
    } catch (error) {
      console.error("fetch処理でエラー：", error)
      setIsError(true)
    }
  }

  // 戻るボタンが押されたとき
  const onPressBack = () => {
    navigation.goBack()
  }


  return (
    <View className='bg-white w-full h-full'>
      <View className='mx-auto w-9/12 mt-32'>
        <Text className='text-gray-400'>メールアドレス</Text>
        {userData && <Text className='text-2xl'>{userData.mailAddress}</Text>}
        <View className='mt-10'>
          <Text className='text-gray-400'>このメールアドレス宛に認証コードを送信します。</Text>
        </View>
        {isError && <Text className='text-red-600 text-sm'>処理の途中でエラーが発生しました。</Text>}
        <View className='flex flex-row mx-auto my-3'>
          <View className='mx-6'>
            <Pressable onPress={onPressAuthCode}>
              <Text className='bg-orange-400 px-3 py-2 text-2xl text-white text-center rounded-2xl w-'>送信する</Text>
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