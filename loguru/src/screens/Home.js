import { Marquee } from "@animatereactnative/marquee";
import { useEffect, useState } from "react";
import { View, ImageBackground, StyleSheet, Dimensions, Image, Text, ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import "@/global.css"
import '@/App'

export default function Home() {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const navigation = useNavigation();

  // ヘッダー画像表示用
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window: { width } }) => {
      setScreenWidth(width);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // 
  const gotoSign = () => {
    navigation.navigate('SignIn')
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
    <View>
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
        <View className="mt-5">
          <Pressable onPress={gotoSign}>
            {/* <Link className="bg-blue-500 text-white text-center font-bold py-3" href="/user/SignUp">サインアップページへ</Link> */}
            <Text className="bg-blue-500 text-white text-center font-bold py-3">サインアップページへ</Text>
          </Pressable>
        </View>
        {/* マルキーの表示 */}
        <Marquee speed={0.3}>
          <View className="flex flex-row">
            <View className="w-36 mt-16 mx-4">
              <ImageBackground
                source={require("@/assets/sample-log-img.png")}
                style={styles.log_img}
              ><View className="flex-1 flex-col items-end justify-end mb-2 mr-1">
                  <Text className="bg-white/75 px-2 py-1 rounded-md text-xs">log その１</Text>
                </View>
              </ImageBackground>
            </View>
            <View className="w-36 h-64 mt-16 mx-4">
              <ImageBackground
                source={require("@/assets/sample-log-img.png")}
                style={styles.log_img}
              ><View className="flex-1 flex-col items-end justify-end mb-2 mr-1">
                  <Text className="bg-white/75 px-2 py-1 rounded-md text-xs">log その２</Text>
                </View>
              </ImageBackground>
            </View>
          </View>
        </Marquee>
        <Marquee reverse={true} speed={0.3}>
          <View className="flex flex-row">
            <View className="w-36 h-64 mt-16 mx-4">
              <ImageBackground
                source={require("@/assets/sample-log-img.png")}
                style={styles.log_img}
              ><View className="flex-1 flex-col items-end justify-end mb-2 mr-1">
                  <Text className="bg-white/75 px-2 py-1 rounded-md text-xs">log その３</Text>
                </View>
              </ImageBackground>
            </View>
            <View className="w-36 h-64 mt-16 mx-4">
              <ImageBackground
                source={require("@/assets/sample-log-img.png")}
                style={styles.log_img}
              ><View className="flex-1 flex-col items-end justify-end mb-2 mr-1">
                  <Text className="bg-white/75 px-2 py-1 rounded-md text-xs">log その４</Text>
                </View>
              </ImageBackground>
            </View>
          </View>
        </Marquee>
      </ScrollView>
    </View>
  )
}