/**
 * ファイル名：SignIn.js
 * 画面名：サインイン
 */

import { Image, View, Text, TextInput, Button, ImageBackground, ScrollView, StyleSheet, Pressable } from "react-native"
import React, { useState } from "react"
import { useNavigation } from "@react-navigation/native";
import '@/global.css'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signIn } from "aws-amplify/auth"
import { getCurrentUser } from "aws-amplify/auth";


export default function SignIn() {
  const [email, setEmail] = useState('')  // ユーザーネーム
  const [password, setPassword] = useState('')  // パスワード
  const [errorAllItemsFlag, setErrorAllItemsFlag] = useState(false)  // 必須項目入力フラグ
  const [errorProcessFlag, setErrorProcessFlag] = useState(false) // API処理エラー用
  const navigation = useNavigation()

  // スタイルシートの定義
  const styles = StyleSheet.create({
    backgroundImage: {
      justifyContent: 'center',
      width: '100%',
      resizeMode: 'cover'
    }
  })

  // サインインが押された時に発火
  const onPressSignIn = async () => {
    if (email == '' || password == '') {
      setErrorAllItemsFlag(true)
    } else {
      setErrorAllItemsFlag(false)
      sendSignIn()
    }
  }

  // サインイン情報送信
  const sendSignIn = async () => {
    try {
      // const { nextStep } = await signIn({
      //   username: email,
      //   password: password,
      // })
      const { nextStep: signInNextStep } = await signIn({
        username: email,
        password: password,
        options: {
          authFlowType: 'USER_AUTH',
          preferredChallenge: 'PASSWORD', // or 'PASSWORD'
        },
      });

      console.log("サインイン処理が完了")
      console.log(signInNextStep.signInStep)
      setErrorProcessFlag(false)
      onLoginSuccess()
    } catch (error) {
      console.log("[error]サインインエラー:", error); // 現在のエラー表示
      console.log("[error]サインインエラー(詳細):", error.message); // エラーメッセージを表示
      console.log("[error]サインインエラー(コード):", error.code); // エラーコードを表示
      setErrorProcessFlag(true)
    }
  }

  // ログイン処理が成功したときの処理
  const onLoginSuccess = async () => {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      await AsyncStorage.setItem("userId", username)
      navigation.navigate('MainTabs')
    } catch (error) {
      console.log("[error]AsyncStorageエラー:", error)
    }
  }

  // サインアップページへの遷移処理
  const gotoSignUp = () => {
    navigation.navigate('SignUp')
  }

  // サインアップフォームエラー表示
  const ViewErrorMessage = () => {
    if (errorAllItemsFlag) {
      return (
        <View className="bg-white/50 p-2 rounded-lg w-80 mt-3">
          <Text className="text-red-500 font-bold">※すべての項目を入力してください。</Text>
        </View>
      )
    } else if (errorProcessFlag) {
      return (
        <View className="bg-white/50 p-2 rounded-lg w-80 mt-3">
          <Text className="text-red-500 font-bold">サインイン処理が正しく完了しませんでした。</Text>
        </View>
      )
    }
  }

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ alignItems: 'center', flex: 1 }}>
        <ImageBackground
          style={styles.backgroundImage}
          source={require("@/assets/bg-img-sign/bg-img-1.png")}
        >
          <View className="flex min-h-full flex-col justify-center py-12 lg:px-8 mx-auto w-80">
            <View className="mx-auto">
              <Image
                style={{ width: 150, height: 75 }}
                className="text-center"
                source={require('@/assets/logru_logo.png')}
              />
            </View>
            <View className="mt-10">
              <View className="space-y-6">
                {/* ユーザーネーム*/}
                <View>
                  <Text className="bg-white/50 rounded-3xl max-w-fit px-2 block text-sm font-medium leading-6 text-balance">Email</Text>
                  <View className="mt-2">
                    <TextInput
                      id="email"
                      autoComplete="email"
                      className="pl-3 block w-full rounded-md border-0 bg-white py-3 shadow-sm ring-1 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-balck sm:text-sm sm:leading-6"
                      onChangeText={setEmail}
                    />
                  </View>
                </View>
                {/* パスワード */}
                <View>
                  <Text className="bg-white/50 rounded-3xl max-w-fit px-2 block text-sm font-medium leading-6 text-balance">Password</Text>
                  <View className="mt-2">
                    <TextInput
                      id="pass"
                      autoComplete="new-password"
                      secureTextEntry={true}
                      className="pl-3 block w-full rounded-md border-0 bg-white py-3 shadow-sm ring-1 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-balck sm:text-sm sm:leading-6"
                      onChangeText={setPassword}
                    />
                  </View>
                </View>
                <ViewErrorMessage />
                <View className="pt-5">
                  <View className="mt-5">
                    <Button
                      title="Sign In"
                      onPress={onPressSignIn}
                    />
                  </View>
                  <Pressable onPress={gotoSignUp}>
                    <View className="mt-5">
                      <Text className="bg-blue-500 text-white text-center font-bold py-3">サインアップページへ</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </ScrollView >
    </View >
  )
}