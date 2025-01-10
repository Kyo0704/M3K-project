/**
 * ファイル名：ChangeEmail.js
 * 画面名：メールアドレス変更画面
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Pressable, Image, TextInput } from 'react-native';
import { useCallback } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

export default function ChangeEmail() {
  const [userData, setUserData] = useState()  // ユーザーデータ
  const [userId, setUserId] = useState()
  const [changeEmail, setChangeEmail] = useState()  // 変更後のメールアドレス
  const [isNullTextBox, setIsNullTextBox] = useState(false)  // テキストが入力されているか
  const [isError, setIsError] = useState(false)  // エラーフラグ
  const navigation = useNavigation()

  // 画面がフォーカスされた際に実行
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await checkLogin()  // ログイン確認
        await getUserData()  // ユーザーデータの取得
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

  // メールアドレス変更ボタンが押された時
  const onPressChangeEmail = async () => {
    if (changeEmail) {
      setIsNullTextBox(false)
      try {
        const data = { userId: userId, changeEmail: changeEmail }
        console.log(data)
        let url = new URL('http://10.108.1.128:3000/changeEmail')
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data })
        });

        if (response.ok) {
          // navigation.navigate('AccountDetails')
        } else {
          console.error("API処理に失敗しました：", response.status)
          setIsError(true)
        }
      } catch (error) {
        console.error("サインイン処理に失敗", error)
        setIsError(true)
      }
    } else {
      setIsNullTextBox(true)
    }
  }

  // 戻るボタンが押された時
  const onPressBack = () => {
    navigation.goBack()
  }

  return (
    <View className='bg-white w-full h-full'>
      <View className='mx-auto w-9/12 mt-32'>
        {/* 現在登録されているメールアドレスの表示 */}
        <View className='mt-5'>
          <Text className='text-gray-400'>現在登録しているメールアドレス</Text>
          {userData && <Text className='text-2xl'>{userData.mailAddress}</Text>}
        </View>
        {/* 新しいメールアドレスの入力 */}
        <View className='mt-5'>
          <Text className='text-gray-400'>新しいメールアドレスを入力してください</Text>
          <TextInput
            className="text-2xl"
            placeholder="メールアドレスを入力"
            placeholderTextColor="#666"
            onChangeText={setChangeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {isNullTextBox && <Text className='text-red-600 text-sm'>新しいメールアドレスを入力してください。</Text>}
        {isError && <Text className='text-red-600 text-sm'>エラーが発生しました。</Text>}
        <View className='flex flex-row mx-auto my-3'>
          <View className='mx-6'>
            <Pressable onPress={onPressChangeEmail}>
              <Text className='bg-orange-400 px-3 py-2 text-2xl text-white text-center rounded-2xl w-'>送信</Text>
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