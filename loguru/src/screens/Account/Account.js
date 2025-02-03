/**
 * ファイル名：Account.js
 * 画面名：アカウント画面
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ImageBackground, Image, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // 使用するアイコンセットを指定
import { signOut } from 'aws-amplify/auth';
import { getCurrentUser } from 'aws-amplify/auth';

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
          console.log("[error]JSONエラー：", error)
        }
      } else {
        console.log("[error]レスポンスエラー:", error)
      }
    } catch (error) {
      console.log("[error]fetchエラー:", error)
    }
  }

  // サインアウト
  const signout = async () => {
    try {
      await signOut()
      await AsyncStorage.removeItem("userId")
      navigation.navigate('SignIn')
    } catch (error) {
      console.log("[error]サインアウトエラー:", error)
    }
  }

  const getData = async() => {
    try{
      const { username, userId, signInDetails } = await getCurrentUser();

      console.log("username", username);
      console.log("user id", userId);
      console.log("sign-in details", signInDetails);
    }catch(error){
      console.log("[error]：", error)
    }
  }

  const onPressAccountData = () => {
    navigation.navigate('AccountDetails')
  }

  const onPressLikeList = () => {
    navigation.navigate('LikeList')
  }

  return (
    <ScrollView className='w-full h-full bg-white'>
      <View>
        <Pressable onPress={signout}>
          <Text>ログアウトする</Text>
        </Pressable>
      </View>
      <View>
        <Pressable onPress={getData}>
          <Text>データ取得</Text>
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
      <Pressable onPress={onPressLikeList}>
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