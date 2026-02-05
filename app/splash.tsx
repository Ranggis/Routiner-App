import { useEffect } from "react";
import { View, StyleSheet, Image, StatusBar } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

export default function Splash() {
  const router = useRouter();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(1.2);
  const textWidth = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateX = useSharedValue(-30);

  useEffect(() => {
    // Logo Fade In + Gentle Zoom Out
    logoOpacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });

    logoScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });

    const START = 1400;

    // Reveal mask width
    textWidth.value = withDelay(
      START,
      withTiming(200, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Move text horizontally + fade in
    textTranslateX.value = withDelay(
      START,
      withTiming(0, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      })
    );

    textOpacity.value = withDelay(
      START + 200,
      withTiming(1, { duration: 700, easing: Easing.ease })
    );

    const timer = setTimeout(() => {
      router.replace("/onboarding/onboarding");
    }, 4200);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textContainerStyle = useAnimatedStyle(() => ({
    width: textWidth.value,
    opacity: textOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textTranslateX.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.contentWrapper}>
        <Animated.View style={[styles.logoBox, logoStyle]}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.textWrapper, textContainerStyle]}>
          <Animated.Text style={[styles.text, textStyle]} numberOfLines={1}>
            Routiner
          </Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A37FF",
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 85,
    height: 85,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 76,
    height: 76,
  },
  textWrapper: {
    overflow: "hidden",
    justifyContent: "center",
  },
  text: {
    fontFamily: "InterBold",
    fontSize: 40,
    color: "#FFFFFF",
    marginLeft: 15,
  },
});
