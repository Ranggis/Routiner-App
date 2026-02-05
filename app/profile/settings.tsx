import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  Modal, 
  Pressable, 
  ActivityIndicator 
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// FIREBASE
import { auth } from "../../firebase/config"; 
import { signOut } from "firebase/auth";

// Rating Component
import RatingModal from "../../components/profile/RatingModal";

export default function SettingsScreen() {
  const router = useRouter();
  
  // State Modals
  const [ratingVisible, setRatingVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fungsi Eksekusi Logout
  const onConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      setLogoutVisible(false);
      router.replace("/auth/login"); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text style={styles.sectionTitle}>ACCOUNT & ACTIVITY</Text>
        <View style={styles.card}>
          <SettingRow icon="person-outline" label="Edit Profile" onPress={() => router.push("/profile/edit" as any)} />
          <SettingRow icon="bookmark-outline" label="Bookmarks" onPress={() => router.push("/profile/bookmark" as any)} />
          <SettingRow icon="notifications-outline" label="Notifications" onPress={() => router.push("/notifications" as any)} />
          <SettingRow icon="shield-checkmark-outline" label="Security" isLast onPress={() => router.push("/profile/security" as any)} />
        </View>

        <Text style={styles.sectionTitle}>ABOUT & SUPPORT</Text>
        <View style={styles.card}>
          <SettingRow icon="star-outline" label="Rate Routiner" onPress={() => setRatingVisible(true)} />
          <SettingRow icon="help-circle-outline" label="Support Center" onPress={() => router.push("/profile/support" as any)} />
          <SettingRow icon="information-circle-outline" label="About Us" isLast onPress={() => router.push("/profile/about" as any)} />
        </View>

        {/* TOMBOL LOGOUT (Trigger Modal) */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={() => setLogoutVisible(true)} 
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={22} color="#FF4B4B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0 (Beta)</Text>
      </ScrollView>

      {/* RATING MODAL */}
      <RatingModal visible={ratingVisible} onClose={() => setRatingVisible(false)} />

      {/* --- CUSTOM LOGOUT MODAL --- */}
      <Modal visible={logoutVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !isLoggingOut && setLogoutVisible(false)} />
          <View style={styles.logoutModalCard}>
            <View style={styles.warnIconBg}>
              <Ionicons name="log-out" size={28} color="#FF4B4B" />
            </View>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalSub}>Are you sure you want to leave? Your habits will miss you!</Text>
            
            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setLogoutVisible(false)}
                disabled={isLoggingOut}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={onConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ----------------- COMPONENTS ----------------- */

function SettingRow({ icon, label, isLast, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.row, !isLast && styles.rowBorder]} onPress={onPress} activeOpacity={0.5}>
      <View style={styles.iconContent}>
        <View style={styles.iconBg}><Ionicons name={icon} size={20} color="#3843FF" /></View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

/* ----------------- STYLES ----------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", marginRight: 15,
    ...Platform.select({ ios: { shadowColor: "#1E293B", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } }),
  },
  headerTitle: { fontSize: 24, fontFamily: "InterBold", color: "#1E293B" },
  container: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "InterBold", color: "#94A3B8", letterSpacing: 1.2, marginBottom: 12, marginTop: 25 },
  card: { backgroundColor: "#FFF", borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: "#F1F5F9" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  iconContent: { flexDirection: "row", alignItems: "center" },
  iconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#F0F2FF", justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 16, fontFamily: "InterSemiBold", marginLeft: 15, color: "#1E293B" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF", marginTop: 30, paddingVertical: 16,
    borderRadius: 20, borderWidth: 1, borderColor: "#FEE2E2", gap: 10,
  },
  logoutText: { color: "#FF4B4B", fontFamily: "InterBold", fontSize: 16 },
  versionText: { textAlign: "center", color: "#CBD5E1", fontSize: 11, fontFamily: "InterMedium", marginTop: 30 },

  // --- LOGOUT MODAL STYLES ---
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", alignItems: "center", padding: 25 },
  logoutModalCard: { backgroundColor: "#FFF", width: "85%", maxWidth: 320, borderRadius: 28, padding: 24, alignItems: "center" },
  warnIconBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFF1F2", justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontFamily: "InterBold", color: "#1E293B" },
  modalSub: { fontSize: 14, color: "#64748B", textAlign: "center", marginTop: 8, marginBottom: 24, lineHeight: 20, fontFamily: "InterRegular" },
  modalActionRow: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center" },
  cancelBtnText: { color: "#64748B", fontFamily: "InterBold", fontSize: 15 },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: "#FF4B4B", alignItems: "center", elevation: 4, shadowColor: "#FF4B4B", shadowOpacity: 0.2, shadowRadius: 8 },
  confirmBtnText: { color: "#FFF", fontFamily: "InterBold", fontSize: 15 }
});