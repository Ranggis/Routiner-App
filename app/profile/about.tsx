import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  Image, // Import Image dari react-native
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AboutUs() {
  const router = useRouter();

  const handleLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Don't know how to open this URL");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* APP IDENTITY SECTION */}
        <View style={styles.appSection}>
          <View style={styles.logoShadow}>
            <View style={styles.logoWrapper}>
                {/* GANTI ICON DENGAN LOGO DARI ASSETS */}
                <Image 
                  source={require("../../assets/images/icon.png")} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
            </View>
          </View>
          <Text style={styles.appName}>Routiner</Text>
          <Text style={styles.appVersion}>Version 1.0.0 (Beta)</Text>
        </View>

        {/* MISSION CARD */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>OUR MISSION</Text>
          <Text style={styles.cardTitle}>Better Habits, Better Life</Text>
          <Text style={styles.cardDescription}>
            Routiner was built to help people build consistency and achieve their personal goals. 
            We believe that small, daily actions lead to big, life-changing results.
          </Text>
        </View>

        {/* VALUES SECTION */}
        <View style={styles.valuesRow}>
          <View style={styles.valueItem}>
            <View style={[styles.valueIconBg, { backgroundColor: "#FFF7E6" }]}>
              <MaterialCommunityIcons name="flash" size={24} color="#FF9500" />
            </View>
            <Text style={styles.valueLabel}>Fast</Text>
          </View>

          <View style={styles.valueItem}>
            <View style={[styles.valueIconBg, { backgroundColor: "#EEF2FF" }]}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#3843FF" />
            </View>
            <Text style={styles.valueLabel}>Secure</Text>
          </View>

          <View style={styles.valueItem}>
            <View style={[styles.valueIconBg, { backgroundColor: "#FFF0F5" }]}>
              <MaterialCommunityIcons name="heart" size={24} color="#E1306C" />
            </View>
            <Text style={styles.valueLabel}>Built for You</Text>
          </View>
        </View>

        {/* DEVELOPER SECTION */}
        <View style={[styles.card, { marginTop: 25 }]}>
          <Text style={styles.cardLabel}>THE DEVELOPER</Text>
          <View style={styles.devRow}>
            <View style={styles.devAvatar}>
                {/* GANTI ICON DENGAN FOTO PROFIL DARI ASSETS */}
                <Image 
                  source={require("../../assets/images/profile.jpg")} 
                  style={styles.avatarImage}
                />
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.devName}>M Ranggis Refaldi</Text>
              <Text style={styles.devRole}>Lead Developer & Designer</Text>
            </View>
          </View>
        </View>

        {/* LEGAL LINKS */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => handleLink('https://routiner.com/privacy')}>
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.dotSeparator} />
          <TouchableOpacity onPress={() => handleLink('https://routiner.com/terms')}>
            <Text style={styles.legalText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2026 Routiner App. Made with ☕</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#1E293B", shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: { fontSize: 20, fontFamily: "InterBold", color: "#1E293B" },
  scrollContainer: { paddingBottom: 40 },
  appSection: { alignItems: 'center', marginVertical: 40 },
  logoShadow: {
    shadowColor: "#3843FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: "#FFF", // Background putih agar logo gambar terlihat jelas
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: { fontSize: 28, fontFamily: "InterBold", color: "#1E293B", marginTop: 20 },
  appVersion: { fontSize: 14, fontFamily: "InterMedium", color: "#94A3B8", marginTop: 5 },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 25,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardLabel: { fontSize: 11, fontFamily: "InterBold", color: "#94A3B8", letterSpacing: 1.2, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontFamily: "InterBold", color: "#1E293B", marginBottom: 10 },
  cardDescription: { fontSize: 14, fontFamily: "InterRegular", color: "#64748B", lineHeight: 22 },
  valuesRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, marginTop: 25 },
  valueItem: { width: '30%', alignItems: 'center' },
  valueIconBg: { width: 54, height: 54, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  valueLabel: { fontSize: 12, fontFamily: "InterSemiBold", color: "#64748B", textAlign: 'center' },
  devRow: { flexDirection: 'row', alignItems: 'center' },
  devAvatar: { 
    width: 60, // Sedikit lebih besar agar foto terlihat jelas
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#E2E8F0', 
    overflow: 'hidden', // Wajib agar gambar tetap bulat
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  devName: { fontSize: 16, fontFamily: "InterBold", color: "#1E293B" },
  devRole: { fontSize: 13, fontFamily: "InterMedium", color: "#94A3B8" },
  legalLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  legalText: { fontSize: 13, fontFamily: "InterSemiBold", color: "#3843FF" },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", marginHorizontal: 12 },
  copyright: { textAlign: 'center', marginTop: 15, fontSize: 12, fontFamily: "InterMedium", color: "#94A3B8" },
});