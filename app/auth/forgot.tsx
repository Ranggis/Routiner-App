import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal, // Tambahkan Modal
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State Modal

  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  const handleReset = async () => {
    if (!isValidEmail) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setShowSuccessModal(true); // Munculkan Custom Modal
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setErrorMsg("This email is not registered in our system.");
      } else {
        setErrorMsg("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forgot Password?</Text>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Missing Your Password?</Text>
            <Text style={styles.subtitle}>Enter your registered email address and we'll send you a link to reset your password.</Text>
          </View>

          {errorMsg !== "" && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#FF3B30" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.inputSection}>
            <Text style={styles.label}>E-MAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={20} color={isValidEmail ? "#3843FF" : "#9CA3AF"} />
              <TextInput
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if(errorMsg) setErrorMsg("");
                }}
                placeholder="Enter your registered e-mail"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              {isValidEmail && (
                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
              )}
            </View>
            <View style={[
              styles.inputLine, 
              { backgroundColor: errorMsg ? "#FF3B30" : (isValidEmail ? "#4CD964" : "#DADADA") }
            ]} />
          </View>

          <TouchableOpacity
            style={[styles.button, (!isValidEmail || loading) && styles.buttonDisabled]}
            disabled={!isValidEmail || loading}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomContainer}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.bottomText}>
              Remember your password?{" "}
              <Text style={styles.bottomBold}>Login</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- CUSTOM SUCCESS MODAL --- */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="send-check" size={50} color="#3843FF" />
            </View>
            
            <Text style={styles.modalTitle}>Email Sent!</Text>
            <Text style={styles.modalSubtitle}>
                We have sent a password reset link to{"\n"}
                <Text style={{fontFamily: 'InterBold', color: '#111'}}>{email}</Text>
            </Text>

            <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                    setShowSuccessModal(false);
                    router.replace("/auth/login");
                }}
            >
                <Text style={styles.modalButtonText}>Back to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => setShowSuccessModal(false)}
                style={{marginTop: 15}}
            >
                <Text style={{color: '#9CA3AF', fontFamily: 'InterMedium'}}>Try another email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { padding: 25, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 40 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: "#F8F9FB",
    justifyContent: "center", alignItems: "center", elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5,
    borderWidth: 1, borderColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 20, fontFamily: "InterBold", color: "#111", marginLeft: 15 },
  welcomeSection: { marginBottom: 30 },
  title: { fontSize: 28, fontFamily: "InterBold", color: "#111" },
  subtitle: { fontSize: 15, fontFamily: "InterRegular", color: "#64748B", marginTop: 10, lineHeight: 22 },
  errorBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFF5F5",
    padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: "#FFE5E5",
  },
  errorText: { color: "#FF3B30", marginLeft: 10, fontSize: 13, fontFamily: "InterMedium", flex: 1 },
  inputSection: { width: "100%" },
  label: { fontSize: 11, color: "#94A3B8", fontFamily: "InterBold", letterSpacing: 1, marginBottom: 4 },
  inputWrapper: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  input: { flex: 1, fontSize: 16, fontFamily: "InterSemiBold", color: "#1E293B", marginLeft: 12 },
  inputLine: { height: 2, width: "100%", backgroundColor: "#DADADA" },
  button: {
    backgroundColor: "#3843FF", height: 56, borderRadius: 18, marginTop: 40,
    alignItems: "center", justifyContent: "center", shadowColor: "#3843FF",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  buttonDisabled: { backgroundColor: "#E2E8F0", shadowOpacity: 0, elevation: 0 },
  buttonText: { color: "#FFF", fontSize: 16, fontFamily: "InterBold" },
  bottomContainer: { marginTop: 24, alignItems: "center" },
  bottomText: { color: "#64748B", fontSize: 14, fontFamily: "InterMedium" },
  bottomBold: { color: "#3843FF", fontFamily: "InterBold" },

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
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'InterBold',
    color: '#111',
    marginBottom: 10
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