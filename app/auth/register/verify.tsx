import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal, // Tambahkan Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons"; // Tambahkan MaterialCommunityIcons
import { useRouter, useLocalSearchParams } from "expo-router";
import { auth } from "../../../firebase/config";
import { sendEmailVerification, reload } from "firebase/auth";

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  
  const [timer, setTimer] = useState(60);
  const [isChecking, setIsChecking] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State untuk Custom Modal

  // ---------------------------------------------------------
  // 1. LOGIKA OTOMATISASI (POLLING)
  // ---------------------------------------------------------
  useEffect(() => {
    // Gunakan tipe data 'any' atau 'ReturnType<typeof setInterval>' untuk menghindari error TS
    let checkStatusInterval: any;

    const startPolling = () => {
      // Tambahkan window. di depan setInterval untuk memastikan tipe data number
      checkStatusInterval = setInterval(async () => {
        if (auth.currentUser) {
          try {
            await reload(auth.currentUser);
            if (auth.currentUser.emailVerified) {
              clearInterval(checkStatusInterval); // Hentikan polling
              setShowSuccessModal(true); // Tampilkan Custom Modal Sukses
            }
          } catch (error) {
            console.log("Polling error:", error);
          }
        } else {
          clearInterval(checkStatusInterval);
        }
      }, 3000); 
    };

    if (auth.currentUser) {
      startPolling();
    }

    return () => {
      if (checkStatusInterval) clearInterval(checkStatusInterval);
    };
  }, []);

  // ---------------------------------------------------------
  // 2. TIMER UNTUK RESEND EMAIL
  // ---------------------------------------------------------
  useEffect(() => {
    const t = setInterval(() => {
      setTimer((prev) => (prev === 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const resendEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setTimer(60);
        Alert.alert("Link Sent", "A new verification link has been sent to your inbox.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const navigateToLogin = () => {
    setShowSuccessModal(false); // Tutup modal
    router.replace("/auth/login"); // Redirect ke Login
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>
        </View>

        {/* ILLUSTRATION AREA */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Feather name="mail" size={50} color="#3843FF" />
            <View style={styles.smallBadge}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          </View>
        </View>

        {/* TEXT CONTENT */}
        <View style={styles.content}>
          <Text style={styles.title}>Confirm your E-mail</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to:{"\n"}
            <Text style={styles.emailText}>{email || "your e-mail"}</Text>
          </Text>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3843FF" />
            <Text style={styles.infoText}>
              The page will <Text style={{fontFamily: 'InterBold'}}>automatically</Text> redirect once you click the link in the email.
            </Text>
          </View>
        </View>

        {/* LOADING INDICATOR (VISUAL FEEDBACK) */}
        <View style={styles.statusBox}>
           <Text style={styles.statusText}>Waiting for verification...</Text>
        </View>

        {/* RESEND SECTION */}
        <View style={styles.resendWrapper}>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend link in <Text style={{color: '#3843FF'}}>{timer}s</Text></Text>
          ) : (
            <TouchableOpacity onPress={resendEmail}>
              <Text style={styles.resendBtnText}>Resend Verification Email</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* --- CUSTOM SUCCESS MODAL --- */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
                <MaterialCommunityIcons name="check-circle" size={60} color="#4CD964" />
            </View>
            
            <Text style={styles.modalTitle}>Verified Successfully!</Text>
            <Text style={styles.modalSubtitle}>
                Your email <Text style={{fontFamily: 'InterBold', color: '#111'}}>{email || 'address'}</Text> has been successfully verified. 
                You can now log in to your account.
            </Text>

            <TouchableOpacity 
                style={styles.modalButton}
                onPress={navigateToLogin}
            >
                <Text style={styles.modalButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { marginTop: 10, marginBottom: 20 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: "#F8F9FB",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#F1F5F9",
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F2FF",
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  smallBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#3843FF',
    padding: 8,
    borderRadius: 20,
    elevation: 4
  },
  content: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontFamily: "InterBold", color: "#111", textAlign: 'center' },
  subtitle: { fontSize: 16, fontFamily: "InterRegular", color: "#64748B", marginTop: 12, textAlign: 'center', lineHeight: 24 },
  emailText: { color: "#111", fontFamily: "InterBold" },
  
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F2FF',
    padding: 15,
    borderRadius: 16,
    marginTop: 30,
    alignItems: 'center',
    gap: 12
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#3843FF',
    fontFamily: 'InterMedium',
    lineHeight: 18
  },

  statusBox: {
    alignItems: 'center',
    marginTop: 20
  },
  statusText: {
    fontFamily: 'InterMedium',
    color: '#94A3B8',
    fontSize: 14
  },

  resendWrapper: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 50
  },
  timerText: { fontSize: 14, fontFamily: "InterMedium", color: "#94A3B8" },
  resendBtnText: { fontSize: 14, fontFamily: "InterBold", color: "#3843FF" },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Overlay gelap semi transparan
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20
  },
  modalIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0F2E9', // Hijau muda untuk sukses
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'InterBold',
    color: '#111',
    marginBottom: 10,
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 15,
    fontFamily: 'InterRegular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30
  },
  modalButton: {
    backgroundColor: '#3843FF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3843FF',
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'InterBold'
  }
});