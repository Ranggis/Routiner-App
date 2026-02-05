import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// FIREBASE
import { auth, db } from "../../firebase/config";
import { sendPasswordResetEmail, deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function SecurityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  // --- CONFIGURASI MODAL DINAMIS ---
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'info' as 'success' | 'error' | 'confirm' | 'delete',
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showAlert = (type: any, title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      onConfirm: onConfirm || (() => setAlertConfig(prev => ({ ...prev, visible: false }))),
    });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  // 1. LOGIKA RESET PASSWORD
  const handleResetPassword = () => {
    if (!user?.email) return;

    showAlert(
      "confirm",
      "Reset Password?",
      `We will send a secure password reset link to your email: ${user.email}`,
      async () => {
        closeAlert();
        try {
          setLoading(true);
          await sendPasswordResetEmail(auth, user.email!);
          setTimeout(() => {
            showAlert("success", "Email Sent! ✉️", "Please check your inbox and follow the instructions to reset your password.");
          }, 500);
        } catch (error: any) {
          showAlert("error", "Failed", error.message);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // 2. LOGIKA HAPUS AKUN
  const triggerDelete = () => {
    showAlert(
      "delete",
      "Delete Account?",
      "This is permanent. All your habits, points, and challenges will be lost forever. Are you sure?",
      handleDeleteAccount
    );
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    closeAlert();
    setLoading(true);
    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      router.replace("/auth/login" as any);
    } catch (error: any) {
      console.error(error);
      showAlert("error", "Security Alert", "For your protection, please log out and sign back in before deleting your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3843FF" />
        </View>
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text style={styles.sectionLabel}>ACCOUNT PROTECTION</Text>
        <View style={styles.card}>
          <SecurityRow 
            icon="mail-outline" 
            title="Email Verification" 
            status={user?.emailVerified ? "Verified" : "Unverified"}
            statusColor={user?.emailVerified ? "#10B981" : "#F59E0B"}
          />
          <TouchableOpacity style={styles.row} onPress={handleResetPassword}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBg, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#3843FF" />
              </View>
              <Text style={styles.rowText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: '#FF4B4B', marginTop: 30 }]}>DANGER ZONE</Text>
        <TouchableOpacity style={styles.deleteCard} onPress={triggerDelete}>
          <View style={styles.rowLeft}>
            <View style={styles.iconBgDanger}>
              <Ionicons name="trash-outline" size={22} color="#FF4B4B" />
            </View>
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.deleteTitle}>Delete Account</Text>
              <Text style={styles.deleteSub}>Erase all data and progress</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFD1D1" />
        </TouchableOpacity>
      </ScrollView>

      {/* --- PREMIUM GLOBAL MODAL --- */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* ICON DINAMIS BERDASARKAN TIPE */}
            <View style={[
                styles.modalIconCircle, 
                alertConfig.type === 'success' && { backgroundColor: '#E1F9F0' },
                alertConfig.type === 'delete' || alertConfig.type === 'error' ? { backgroundColor: '#FFF0F0' } : null,
                alertConfig.type === 'confirm' && { backgroundColor: '#EEF2FF' }
            ]}>
              <MaterialCommunityIcons 
                name={
                    alertConfig.type === 'success' ? "check-decagram" : 
                    alertConfig.type === 'delete' ? "alert-octagon-outline" : 
                    alertConfig.type === 'error' ? "close-octagon-outline" : "information-variant"
                } 
                size={45} 
                color={
                    alertConfig.type === 'success' ? "#10B981" : 
                    alertConfig.type === 'delete' || alertConfig.type === 'error' ? "#FF4B4B" : "#3843FF"
                } 
              />
            </View>
            
            <Text style={styles.modalTitle}>{alertConfig.title}</Text>
            <Text style={styles.modalDesc}>{alertConfig.message}</Text>

            <View style={styles.modalFooter}>
              {/* TOMBOL BATAL (Hanya muncul di tipe confirm & delete) */}
              {(alertConfig.type === 'confirm' || alertConfig.type === 'delete') && (
                <TouchableOpacity style={styles.cancelModalBtn} onPress={closeAlert}>
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                    styles.confirmModalBtn, 
                    alertConfig.type === 'delete' && { backgroundColor: '#FF4B4B' },
                    alertConfig.type === 'success' && { backgroundColor: '#10B981' }
                ]} 
                onPress={alertConfig.onConfirm}
              >
                <Text style={styles.confirmModalText}>
                    {alertConfig.type === 'confirm' ? "Continue" : alertConfig.type === 'delete' ? "Delete" : "Got it"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

/* ----------------- COMPONENTS ----------------- */
function SecurityRow({ icon, title, status, statusColor, isLast }: any) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBg, { backgroundColor: '#F8FAFC' }]}>
          <Ionicons name={icon} size={20} color="#64748B" />
        </View>
        <Text style={styles.rowText}>{title}</Text>
      </View>
      {status && <Text style={[styles.statusText, { color: statusColor || "#94A3B8" }]}>{status}</Text>}
    </View>
  );
}

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { 
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", 
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: "InterBold", fontSize: 20, color: "#1E293B" },
  container: { padding: 25 },
  sectionLabel: { fontFamily: "InterBold", fontSize: 12, color: "#94A3B8", letterSpacing: 1.2, marginBottom: 12 },
  card: { backgroundColor: "#FFF", borderRadius: 28, paddingHorizontal: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  iconBg: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rowText: { fontSize: 16, fontFamily: "InterSemiBold", marginLeft: 14, color: "#1E293B" },
  statusText: { fontSize: 13, fontFamily: "InterBold" },
  
  deleteCard: { 
    backgroundColor: "#FFF", borderRadius: 28, padding: 20, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#FFE4E4' 
  },
  iconBgDanger: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF1F1', justifyContent: 'center', alignItems: 'center' },
  deleteTitle: { fontSize: 16, fontFamily: "InterBold", color: "#FF4B4B" },
  deleteSub: { fontSize: 12, fontFamily: "InterMedium", color: "#94A3B8", marginTop: 2 },
  
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },

  // --- MODAL PREMIUM STYLES ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
    width: width * 0.85, backgroundColor: '#FFF', borderRadius: 35, 
    padding: 30, alignItems: 'center',
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20
  },
  modalIconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#EEF2FF' },
  modalTitle: { fontFamily: 'InterBold', fontSize: 22, color: '#1E293B', textAlign: 'center' },
  modalDesc: { fontFamily: 'InterMedium', fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  modalFooter: { width: '100%', marginTop: 30, gap: 12 },
  confirmModalBtn: { 
    width: '100%', paddingVertical: 16, borderRadius: 18, backgroundColor: '#3843FF', alignItems: 'center',
    shadowColor: '#3843FF', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }
  },
  confirmModalText: { fontFamily: 'InterBold', color: '#FFF', fontSize: 16 },
  cancelModalBtn: { width: '100%', paddingVertical: 16, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelModalText: { fontFamily: 'InterBold', color: '#64748B', fontSize: 16 },
});