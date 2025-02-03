/**
 * ファイル名：SignUp.js
 * 画面名：サインアップ
 */

import { Image, StyleSheet, View, Text, TextInput, Button, ImageBackground, ScrollView, Pressable } from "react-native"
import React, { useState } from "react"
import '@/global.css'
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signUp, confirmSignUp, resendSignUpCode, getCurrentUser, autoSignIn } from "aws-amplify/auth"

export default function SignUp() {
  const [userName, setUserName] = useState('')  // ユーザーネーム
  const [email, setEmail] = useState('')  // メールアドレス
  const [password, setPassword] = useState('')  // パスワード
  const [confirmPassword, setConfirmPassword] = useState('')  // 確認用パスワード
  const [errorAllItemsFlag, setErrorAllItemsFlag] = useState(false)  // 必須項目エラーフラグ
  const [errorPassFlag, setErrorPassFlag] = useState(false)  // パスワードエラーフラグ
  const [errorProcessFlag, setErrorProcessFlag] = useState(false)  // API処理エラーフラグ
  const [authCode, setAuthCode] = useState()  // 入力された認証コードを格納
  const [authCodeMode, setAuthCodeMode] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  let isRequireItem = false  // 必須アイテム入力フラグ
  let isMatchPassword = false  // パスワード一致フラグ
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

    // バリデーションチェックが成功したとき
    if (isRequireItem && isMatchPassword) {
      sendSignUp()
    }
  }

  // サインアップ情報送信
  const sendSignUp = async () => {
    try {
      // const { nextStep: signUpNextStep } = await signUp({
      //   username: userName,
      //   password: password,
      //   options: {
      //     userAttributes: {
      //       name: userName,
      //       email: email,
      //     }
      //   },
      // })
      const { nextStep: signUpNextStep } = await signUp({
        "username": email,
        "password": password,
        "UserAttributes": [
          {
            "Name": "custom:username",
            "Value": userName
          }
        ]
      })
      console.log("サインアップ処理が完了")

      // サインアッププロセスの完全終了
      if (signUpNextStep.signUpStep === 'DONE') {
        console.log(`サインアッププロセスが完全に終了`);
        onLoginSuccess()
      }

      // コード認証をする必要あり
      if (signUpNextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        console.log("コード認証を行う必要があります。")
        setAuthCodeMode(true)
      }
      setErrorProcessFlag(false)
    } catch (error) {
      setErrorProcessFlag(true)
      console.log("[error]サインアップエラー:", error)
    }
  }

  // コード認証
  const onPressSendAuthCode = async () => {
    console.log("コード認証メールアドレス:", email)
    console.log("送信コード:", authCode)
    try {
      const { nextStep: confirmSignUpNextStep } = await confirmSignUp({
        username: email,
        confirmationCode: authCode,
      });
      console.log("認証コード　成功")
      console.log(confirmSignUpNextStep.signUpStep)

      // コード認証が成功し、autoSignInを実行
      if (confirmSignUpNextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        try {
          const { nextStep } = await autoSignIn();
          if (nextStep.signInStep === 'DONE') {
            console.log('Successfully signed in.');
            onLoginSuccess()
          } else {
            console.log("autoSignInが出来なかった。")
          }
        } catch (error) {
          console.error("[error]:", error)
          console.log(error)
        }
      }

      if (confirmSignUpNextStep.signUpStep === 'DONE') {
        console.log("サインアップが完了しました。サインインします。")
        setIsComplete(true)
      }

    } catch (error) {
      console.log("[error]コード認証エラー:", error)
    }
  }

  // 認証コードの再送信
  const onPressResendCode = async () => {
    try {
      await resendSignUpCode({
        username: email
      });
      console.log("新しい認証コードが送信されました。");
    } catch (resendError) {
      console.log("[error]コード再送信エラー:", resendError);
    }
  }

  // ログイン処理が成功したときの処理
  const onLoginSuccess = async () => {
    try {
      // AsyncStorageにidを格納
      // const { username, userId, signInDetails } = await getCurrentUser();
      console.log("ユーザーネームは：", email)
      await AsyncStorage.setItem("userId", email)
      navigation.navigate('MainTabs')
    } catch (error) {
      console.log("[error]onLoginSccessでエラー:", error)
    }
  }

  // サインインページに遷移する
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

  const ViewForm = () => {
    return (
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
        <View className="mt-5">
          <View>
            <Text className="bg-white/50 rounded-3xl max-w-fit px-2 block text-sm font-medium leading-6 text-balance">
              認証用コードを入力
            </Text>
            <TextInput
              id="AuthCode"
              className="mt-2 pl-3 block w-full rounded-md border-0 bg-white py-3 shadow-sm ring-1 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-balck sm:text-sm sm:leading-6"
              onChangeText={setAuthCode}
            />
            <Pressable onPress={onPressSendAuthCode}>
              <Text className="bg-blue-500 text-white text-center font-bold py-3 mt-5">送信</Text>
            </Pressable>
            <Pressable onPress={onPressResendCode}>
              <Text className="bg-blue-500 text-white text-center font-bold py-3 mt-2">再度コードを送信</Text>
            </Pressable>
            {authCodeMode && <Text>メールアドレスに認証コードを送信しました。コード認証を行ってください。</Text>}
            {isComplete && <Text>SignUpが完了しました。サインインページに戻りサインインしてください。</Text>}
          </View>
        </View>
      </View>
    )
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
            <View className="mt-5">
              <View>
                <Text className="bg-white/50 rounded-3xl max-w-fit px-2 block text-sm font-medium leading-6 text-balance">
                  認証用コードを入力
                </Text>
                <TextInput
                  id="AuthCode"
                  className="mt-2 pl-3 block w-full rounded-md border-0 bg-white py-3 shadow-sm ring-1 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-balck sm:text-sm sm:leading-6"
                  onChangeText={setAuthCode}
                />
                <Pressable onPress={onPressSendAuthCode}>
                  <Text className="bg-blue-500 text-white text-center font-bold py-3 mt-5">送信</Text>
                </Pressable>
                <Pressable onPress={onPressResendCode}>
                  <Text className="bg-blue-500 text-white text-center font-bold py-3 mt-2">再度コードを送信</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </View >
  )
}