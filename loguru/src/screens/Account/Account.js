/**
 * ファイル名：Account.js
 * 画面名：アカウント画面
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Pressable, ImageBackground, Image } from 'react-native';
import { useCallback } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native'; // StyleSheetをインポート
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // 使用するアイコンセットを指定

export default function Home() {
  const [userData, setUserData] = useState()
  let userId = ''
  const navigation = useNavigation()


  // 画面がフォーカスされた際に実行（画面表示時、戻ってきた時など）
  useFocusEffect(
    useCallback(() => {
      (async () => {
        await checkLogin()
        await getUserData()
      })()
    }, [])
  );

  // ログインチェック
  const checkLogin = async () => {
    try {
      const value = await AsyncStorage.getItem("userId");
      userId = value
      if (value == null) {
        navigation.navigate('SignIn');
      }
    } catch (error) {
      console.error('AsyncStorageでエラー：', error);
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

  // サインアウト
  const signout = async () => {
    try {
      await AsyncStorage.removeItem("userName")
      navigation.navigate('SignIn')
    } catch (error) {
      console.error('Error delete data', error)
    }
  }

  const onPressAccountData = () => {
    navigation.navigate('AccountDetails')
  }

  return (
    <ScrollView className='w-full h-full bg-white'>
      <View>
        <Pressable onPress={signout}>
          <Text>ログアウトする</Text>
        </Pressable>
      </View>
      {/* ヘッダ */}
      <View>
        <ImageBackground
          source={require("@/assets/Account_bg_image.png")}
          className='w-full h-72'
        >
          <View>
            {userData && <Image style={{ resizeMode: 'cover' }} className="mt-10 w-32 h-32 mx-auto rounded-full text-center" source={{ uri: userData.profile_image }}></Image>}
            <View className='mt-10 rounded-2xl px-4 py-3' style={styles.textContainer}>
              {userData && <Text className='text-2xl rounded-2xl'>{userData.name}</Text>}
            </View>
          </View>
        </ImageBackground>
      </View>
      {/* アカウント情報確認・編集 */}
      <Pressable onPress={onPressAccountData}>
        <View className='flex flex-row items-center justify-center mx-auto my-4 mt-5 w-9/12 bg-orange-100 h-24 rounded-2xl'>
          <Icon name="account" size={36} color="black" />
          <Text className='text-xl text-center font-bold'>アカウント情報確認・編集</Text>
        </View>
      </Pressable>
      {/* いいね一覧 */}
      <Pressable>
        <View className='flex flex-row items-center justify-center mx-auto my-4 w-9/12 bg-orange-100 h-24 rounded-2xl'>
          <Icon name="cards-heart" size={36} color="black" />
          <Text className='text-xl text-center font-bold ml-5'>いいね一覧</Text>
        </View>
      </Pressable>
      {/* サブスク管理 */}
      <Pressable>
        <View className='flex flex-row items-center justify-center mx-auto my-4 w-9/12 bg-orange-100 h-24 rounded-2xl'>
          <Icon name="card-account-details" size={36} color="black"/>
          <Text className='text-xl text-center font-bold ml-5'>サブスク管理</Text>
        </View>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  textContainer: {
    backgroundColor: 'white',
    alignSelf: 'center' // 親要素内で中央寄せにする場合
  },
});