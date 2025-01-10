/**
 * ファイル名：ChangePassword.js
 * 画面名：パスワード変更画面
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useCallback } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native';

export default function ChangePassword() {
  const [userId, setUserId] = useState()
  const [beforePassword, setBeforePassword] = useState()  // 変更前のパスワード
  const [afterPassword, setAfterPassword] = useState()  // 変更後のパスワード
  const [confirmAfterPassword, setConfirmAfterPassword] = useState()  // （確認用）変更後のパスワード
  const [isAfterPasswordMatch, setIsAfterPasswordMatch] = useState(true)  // 変更後のパスワードが一致しているかどうか
  const [isAllFieldsFilled, setIsAllFieldsFIlled] = useState(true)
  const [isError, setIsError] = useState(false)
  const navigation = useNavigation()

  // 画面がフォーカスされた際に実行
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await checkLogin()
      })()
    }, [])
  )

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

  const onPressChangePassword = () => {
    let AllItemFlag = false
    let MatchPassFlag = false
    if (beforePassword && afterPassword && confirmAfterPassword) {
      setIsAllFieldsFIlled(true)
      AllItemFlag = true
    } else {
      setIsAllFieldsFIlled(false)
      AllItemFlag = false
    }
    if (afterPassword === confirmAfterPassword) {
      setIsAfterPasswordMatch(true)
      MatchPassFlag = true
    } else {
      setIsAfterPasswordMatch(false)
      MatchPassFlag = false
    }

    if (AllItemFlag && MatchPassFlag) {
      sendChangePassword()
    }
  }

  const sendChangePassword = async () => {
    try {
      const data = { userId: userId, beforePassword: beforePassword, afterPassword: afterPassword }
      let url = new URL('http://192.168.0.20:3000/changePassword')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      });

      if (response.ok) {
        navigation.navigate('AccountDetails')
        setIsError(false)
      } else {
        console.error("API処理に失敗しました：", response.status)
        setIsError(true)
      }
    } catch (error) {
      console.error("サインイン処理に失敗", error)
      setIsError(true)
    }
  }

  // パスワードを忘れた時
  const onPressForgotPassword = () => {
    navigation.navigate('CheckEmail')
  }

  // 戻るボタンが押された時
  const onPressBack = () => {
    navigation.goBack()
  }

  return (
    <View className='bg-white w-full h-full'>
      <View className='mx-auto w-9/12 mt-32'>
        {/* 変更前のパスワード */}
        <View className='mt-5'>
          <Text className='text-gray-400'>変更前のパスワード</Text>
          <TextInput
            className=" text-2xl"
            placeholder="変更前のパスワードを入力"
            secureTextEntry={true}
            placeholderTextColor="#666"
            onChangeText={setBeforePassword}
          />
        </View>
        {/* 新しいパスワード */}
        <View className='mt-5'>
          <Text className='text-gray-400'>新しいパスワード</Text>
          <TextInput
            className=" text-2xl"
            placeholder="新しいパスワードを入力"
            secureTextEntry={true}
            placeholderTextColor="#666"
            onChangeText={setAfterPassword}
          />
        </View>
        {/* （確認用）新しいパスワード */}
        <View className='mt-5'>
          <Text className='text-gray-400'>（確認用）新しいパスワードを入力</Text>
          <TextInput
            className=" text-2xl"
            placeholder="新しいパスワードを入力"
            secureTextEntry={true}
            placeholderTextColor="#666"
            onChangeText={setConfirmAfterPassword}
          />
        </View>
        <View className='mx-auto'>
          <Pressable onPress={onPressForgotPassword}>
            <Text className='text-center text-blue-500 bg-gray-300 w-full px-4 py-2 rounded-xl'>パスワードを忘れたとき</Text>
          </Pressable>
        </View>
        {!isAllFieldsFilled && <Text className='text-red-600 text-sm'>すべての項目が入力されていません。</Text>}
        {!isAfterPasswordMatch && <Text className='text-red-600 text-sm'>パスワードが一致していません</Text>}
        {isError && <Text className='text-red-600 text-sm'>処理が正しく完了しませんでした。</Text>}
        <View className='flex flex-row mx-auto my-3'>
          <View className='mx-6'>
            <Pressable onPress={onPressChangePassword}>
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