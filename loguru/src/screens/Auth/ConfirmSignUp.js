/**
 * 現在は未使用のページです。
 * ファイル名：ConfirmSignUp.js
 * 説明：サインアップ時のメールアドレスによるコード認証
 */

import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native"
import { confirmSignUp, resendSignUpCode, getCurrentUser, autoSignIn } from "aws-amplify/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function ConfirmSignUp() {
  const [authCode, setAuthCode] = useState()  // 入力された認証コードを格納
  const route = useRoute();
  const email = route.params;
  // const email = "rkushiro822@gmail.com"

  // 認証コードをCognitoに送信
  const onPressSendAuthCode = async () => {
    console.log(email)
    console.log(authCode)
    try {
      const { nextStep: confirmSignUpNextStep } = await confirmSignUp({
        username: email,
        confirmationCode: authCode,
      });
      console.log("認証コード　成功")

      // コード認証が成功し、autoSignInを実行
      if (confirmSignUpNextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        const { nextStep } = await autoSignIn();
        if (nextStep.signInStep === 'DONE') {
          console.log('Successfully signed in.');
        }
      }

      try {
        const { username, userId, signInDetails } = await getCurrentUser();
        await AsyncStorage.setItem("userId", username)
        navigation.navigate('MainTabs')
      } catch (error) {
        console.log("[error]AsyncStorageエラー:", error)
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

  return (
    <View className="mt-20 mx-auto">
      <Text>
        認証用コードを入力
      </Text>
      <TextInput
        id="AuthCode"
        className="pl-3 block w-60 rounded-md border-0 bg-white py-3 shadow-sm ring-1 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-balck sm:text-sm sm:leading-6"
        onChangeText={setAuthCode}
      />
      <Pressable onPress={onPressSendAuthCode}>
        <Text>送信</Text>
      </Pressable>
      <Pressable onPress={onPressResendCode}>
        <Text>再度コードを送信</Text>
      </Pressable>
    </View>
  )
}