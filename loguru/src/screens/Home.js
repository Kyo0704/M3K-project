/**
 * ファイル名：Home.js
 * 画面名：ホーム画面
 */

import { Marquee } from "@animatereactnative/marquee";
import { useState } from "react";
import { View, ImageBackground, StyleSheet, Dimensions, Image, Text, ScrollView } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from 'react';

export default function Home() {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);  // 画面幅を取得
  const [homeLogData, setHomeLogData] = useState()  // ホーム画面に表示するログデータ
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await checkLogin()
        await getHomeLogData()
      })()
      const subscription = Dimensions.addEventListener('change', ({ window: { width } }) => {
        setScreenWidth(width);
      });

      return () => {
        subscription.remove();
      };
    }, [])
  );

  // ホーム画面に表示するログの取得
  const getHomeLogData = async () => {
    try {
      let url = new URL('http://10.108.1.128:3000/homeLog')
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        try {
          const data = await response.json()
          setHomeLogData(data)
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

  // ログインチェック
  const checkLogin = async () => {
    try {
      const value = await AsyncStorage.getItem("userId");
      if (value == null) {
        navigation.navigate('SignIn');
      }
    } catch (error) {
      console.log("[error]AsyncStorageエラー：", error)
    }
  }

  // スタイルの定義
  const styles = StyleSheet.create({
    backgroundImage: {
      width: screenWidth,
      height: 150,
      resizeMode: 'cover',
    },
    log_img: {
      flex: 1,
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
  })

  return (
    <View className="bg-white w-screen h-screen">
      <ScrollView>
        {/* ヘッダー */}
        <View>
          <ImageBackground
            style={styles.backgroundImage}
            source={require("@/assets/bg-img-sign/bg-img-home.png")}
            resizeMode="cover"
          ><Image
              style={{ width: 150, height: 75 }}
              className="text-center mx-auto mt-14"
              source={require("@/assets/logru_logo.png")}
              resizeMode="contain"
            />
          </ImageBackground>
        </View>
        {/* マルキーの表示 */}
        <Marquee speed={0.3}>
          <View className="flex flex-row">
            {homeLogData && Object.values(homeLogData).map((e, index) => (
              <View className="w-36 h-64 mt-8 mx-4" key={index}>
                <ImageBackground
                  source={{ uri: e.thumbnail }}
                  className="w-full h-full"
                  imageStyle={{ borderRadius: 10 }}
                  style={{ resizeMode: 'contain' }}
                ><View className="flex-1 flex-col items-end justify-end mb-2 mr-1">
                    <Text className="bg-white/75 px-2 py-1 rounded-md text-xs">{e.title}</Text>
                  </View>
                </ImageBackground>
              </View>
            ))}
          </View>
        </Marquee>
        <Marquee reverse={true} speed={0.3}>
          <View className="flex flex-row">
            {homeLogData && Object.values(homeLogData).map((e, index) => (
              <View className="w-36 h-64 mt-8 mx-4" key={index}>
                <ImageBackground
                  source={{ uri: e.thumbnail }}
                  className="w-full h-full"
                  imageStyle={{ borderRadius: 10 }}
                  style={{ resizeMode: 'contain' }}
                ><View className="flex-1 flex-col items-end justify-end mb-2 mr-1">
                    <Text className="bg-white/75 px-2 py-1 rounded-md text-xs">{e.title}</Text>
                  </View>
                </ImageBackground>
              </View>
            ))}
          </View>
        </Marquee>
      </ScrollView>
    </View>
  )
}