import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function RewardScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#FFC837", "#FFB037"]} style={styles.container}>
      
      {/* BACK BUTTON */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* BADGE ICON */}
      <View style={styles.badgeWrapper}>
        <Image
          source={require("../assets/badges/badge.png")} 
          style={styles.badge}
        />
      </View>

      {/* TITLE */}
      <Text style={styles.title}>Congrats!</Text>

      {/* SUBTITLE */}
      <Text style={styles.subtitle}>
        You just reached your{"\n"}first habit goal!
      </Text>

      {/* DESCRIPTION */}
      <Text style={styles.description}>
        This badge is a symbol of your commitment to yourself. 
        Keep going and earn more badges along the way.
      </Text>

      {/* CLAIM BUTTON */}
      <TouchableOpacity style={styles.claimBtn}>
        <Text style={styles.claimText}>Claim</Text>
      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
  },

  backBtn: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 22,
    color: "#4A4A4A",
  },

  badgeWrapper: {
    marginTop: 40,
    marginBottom: 20,
  },

  badge: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },

  title: {
    fontSize: 30,
    fontFamily: "InterBold",
    color: "#FFF",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#FFF",
    marginTop: 6,
    lineHeight: 26,
    fontFamily: "InterBold",
  },

  description: {
    width: "80%",
    textAlign: "center",
    color: "#FFF",
    marginTop: 18,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },

  claimBtn: {
    marginTop: 40,
    backgroundColor: "#FFF",
    width: "70%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  claimText: {
    fontFamily: "InterBold",
    fontSize: 16,
    color: "#000",
  },
});
