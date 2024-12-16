import { Image, StyleSheet, View, Text, TextInput, Button, ImageBackground, ScrollView, Pressable } from "react-native"
import React, { useState } from "react"
import { Link } from "expo-router";
import '@/global.css'
import { useNavigation } from "@react-navigation/native";


export default function SignUp() {
  const [userName, setUserName] = useState('')  // ユーザーネーム入力値格納用
  const [email, setEmail] = useState('')  // メールアドレス入力値格納用
  const [password, setPassword] = useState('')  // パスワード入力値格納用
  const [confirmPassword, setConfirmPassword] = useState('')  // 確認用パスワード入力値格納用
  const [errorAllItemsFlag, setErrorAllItemsFlag] = useState(false)  // 必須入力項目エラーフラグ
  const [errorPassFlag, setErrorPassFlag] = useState(false)  // パスワードエラーフラグ
  const [errorProcessFlag, setErrorProcessFlag] = useState(false) // API処理エラー用
  let isRequireItem = false  // 必須アイテム入力確認フラグ true:入力済 false:未入力
  let isMatchPassword = false  // パスワード一致確認フラグ true:一致 false:不一致
  const navigation = useNavigation()

  // スタイルシートの定義
  const styles = StyleSheet.create({
    backgroundImage: {
      justifyContent: 'center',
      width: '100%',
      resizeMode: 'cover',
    },
  })

  // サインアップボタンが押された時の処理
  const onPressSignUp = async () => {
    // すべての項目に対して入力されているかのチェック
    if (userName == '' || email == '' || password == '' || confirmPassword == '') {
      setErrorAllItemsFlag(true)
      isRequireItem = false
    } else {
      setErrorAllItemsFlag(false)
      isRequireItem = true
    }

    // パスワードと確認用パスワードが一致しているかチェック
    if (password !== confirmPassword) {
      setErrorPassFlag(true)
      isMatchPassword = false
    } else {
      setErrorPassFlag(false)
      isMatchPassword = true
    }

    if (isRequireItem && isMatchPassword) {
      sendSignUp()
    }
  }

  // サインアップ情報送信
  const sendSignUp = async () => {
    try {
      const data = { userName: userName, email: email, password: password, confirmPassword: confirmPassword }
      const response = await fetch('/api/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      });

      if (response.ok) {
        setErrorProcessFlag(false)
      } else {
        setErrorProcessFlag(true)
      }
    } catch (error) {
      console.log(error)
      setErrorProcessFlag(true)
    }
  }

  const gotoSignIn = () => {
    navigation.navigate('SignIn')
  }

  // サインアップフォームエラー表示
  const ViewErrorMessage = () => {
    if (errorAllItemsFlag) {
      return (
        <View className="bg-white/50 p-2 rounded-lg w-80 mt-3">
          <Text className="text-red-500 font-bold">※すべての項目を入力してください。</Text>
        </View>
      )
    } else if (errorPassFlag) {
      return (
        <View className="bg-white/50 p-2 rounded-lg w-80 mt-3">
          <Text className="text-red-500 font-bold">パスワードと確認用パスワードを一致させてください。</Text>
        </View>
      )
    } else if (errorProcessFlag) {
      return (
        <View className="bg-white/50 p-2 rounded-lg w-80 mt-3">
          <Text className="text-red-500 font-bold">サインアップ処理中にエラーが発生しました。</Text>
        </View>
      )
    }

  }

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ alignItems: 'center', flex: 1 }}>
        <ImageBackground
          // style={{ width: '100%', height: '100%' }}
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
                  <Text className="bg-white/50 rounded-3xl max-w-fit px-2 block text-sm font-medium leading-6 text-balance">UserName</Text>
                  <View className="mt-2">
                    <TextInput
                      id="uname"
                      autoComplete="username"
                      className="pl-3 block w-full rounded-md border-0 bg-white py-3 shadow-sm ring-1 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-balck sm:text-sm sm:leading-6"
                      onChangeText={setUserName}
                    />
                  </View>
                </View>

                {/* メールアドレス */}
                <View>
                  <Text className="bg-white/50 rounded-3xl max-w-fit px-2 block text-sm font-medium leading-6 text-balance">E-mail</Text>
                  <View className="mt-2">
                    <TextInput
                      id="mail"
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

                {/* パスワードの確認 */}
                <View>
                  <Text className="bg-white/50 rounded-3xl max-w-fit px-2 block text-sm font-medium leading-6 text-balance">Re:Password</Text>
                  <View className="mt-2">
                    <TextInput
                      id="repass"
                      autoComplete="new-password"
                      secureTextEntry={true}
                      className="pl-3 block w-full rounded-md border-0 bg-white py-3 shadow-sm ring-1 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-balck sm:text-sm sm:leading-6"
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>
                <ViewErrorMessage />
                <View className="pt-5">
                  <View className="mt-5">
                    <Button
                      title="Sign Up"
                      onPress={onPressSignUp}
                    />
                  </View>
                  <Pressable onPress={gotoSignIn}>
                    <View className="mt-5">
                      <Text className="bg-blue-500 text-white text-center font-bold py-3">サインインページへ</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </View >
  )
}