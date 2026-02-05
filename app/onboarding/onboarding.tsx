import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { slides } from "../../constants/slides";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const goToLogin = () => router.push("/auth/login");

  return (
    <SafeAreaView style={styles.container}>
      {/* 
          CAROUSEL SECTION 
          - mode="parallax": Memberikan efek kedalaman saat digeser
          - loop: Membuat slider tidak pernah habis (kembali ke awal otomatis)
      */}
      <View style={styles.carouselWrapper}>
        <Carousel
          loop
          width={width}
          height={width * 1.4}
          autoPlay={true}
          autoPlayInterval={4000}
          data={slides}
          scrollAnimationDuration={1000}
          onSnapToItem={(index) => setActiveIndex(index)}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,    // Slide samping mengecil 10%
            parallaxScrollingOffset: 50,    // Jarak antar slide
            parallaxAdjacentItemScale: 0.8, // Slide tetangga mengecil 20%
          }}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          )}
        />
      </View>

      {/* INDICATOR (DOTS) */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              activeIndex === i && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* FOOTER SECTION */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={goToLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue with E-mail</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our {"\n"}
          <Text style={{ textDecorationLine: 'underline' }}>
            Terms of Service & Privacy Policy.
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A37FF", // Background biru sesuai permintaan
  },

  carouselWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  image: {
    width: "100%",
    height: 320,
    resizeMode: "contain",
    marginBottom: 30,
  },

  textContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "InterBold", // Pastikan font ini sudah di-load di app/_layout.tsx
    textAlign: "left",
    lineHeight: 38,
  },

  subtitle: {
    color: "#ffffffc0",
    fontSize: 16,
    fontFamily: "InterRegular",
    marginTop: 12,
    lineHeight: 22,
  },

  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff50",
    marginHorizontal: 4,
  },

  dotActive: {
    width: 24, // Dot memanjang saat aktif
    backgroundColor: "#fff",
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  button: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: "center",
    // Shadow untuk iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Elevation untuk Android
    elevation: 5,
  },

  buttonText: {
    fontFamily: "InterBold",
    fontSize: 16,
    color: "#000",
  },

  terms: {
    color: "#ffffff80",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    fontFamily: "InterRegular",
    lineHeight: 18,
  },
});