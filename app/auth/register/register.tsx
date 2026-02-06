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
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Firebase
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../../../firebase/config"; // Tambahkan db di sini
// Tambahkan fungsi firestore
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // States untuk visibilitas password
  const [isPassVisible, setIsPassVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  // Validasi
  const validEmail = /\S+@\S+\.\S+/.test(email);
  const isPasswordStrong = pass.length >= 6;
  const matchPassword = isPasswordStrong && pass === confirm;
  const canContinue = validEmail && username.length >= 3 && matchPassword;

  const handleRegister = async () => {
    if (!canContinue) return;
    setLoading(true);

    try {
      // 1. Buat user di Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = result.user;

      // 2. BUAT DOKUMEN DI FIRESTORE (Ini yang kurang!)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username, // field username
        displayName: username, // field display name awal disamakan
        email: email,
        photoURL: "https://via.placeholder.com/150", // foto default
        emoji: "👋", // emoji default
        createdAt: serverTimestamp(),
      });

      // 3. Kirim verifikasi email
      await sendEmailVerification(user);

      router.push({
        pathname: "../register/verify",
        params: { email, username },
      });
    } catch (error: any) {
      console.error("Register Error:", error);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = "Email sudah terdaftar.";
      Alert.alert("Registration Error", msg);
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
          
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Continue with E-mail</Text>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Join Routiner!</Text>
            <Text style={styles.subtitle}>Start your journey towards better habits today.</Text>
          </View>

          {/* EMAIL INPUT */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-MAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={20} color={validEmail ? "#3843FF" : "#9CA3AF"} />
              <TextInput
                placeholder="Enter your e-mail"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
              {validEmail && <Ionicons name="checkmark-circle" size={20} color="#4CD964" />}
            </View>
            <View style={[styles.line, { backgroundColor: validEmail ? "#4CD964" : "#DADADA" }]} />
          </View>

          {/* USERNAME INPUT */}
          <View style={[styles.inputGroup, { marginTop: 25 }]}>
            <Text style={styles.label}>USERNAME</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={20} color={username.length >= 3 ? "#3843FF" : "#9CA3AF"} />
              <TextInput
                placeholder="Enter a username"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />
            </View>
            <View style={[styles.line, { backgroundColor: username.length >= 3 ? "#3843FF" : "#DADADA" }]} />
          </View>

          {/* PASSWORD INPUT */}
          <View style={[styles.inputGroup, { marginTop: 25 }]}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color={isPasswordStrong ? "#3843FF" : "#9CA3AF"} />
              <TextInput
                placeholder="Min. 6 characters"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!isPassVisible}
                value={pass}
                onChangeText={setPass}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setIsPassVisible(!isPassVisible)}>
                <Ionicons name={isPassVisible ? "eye-off-outline" : "eye-outline"} size={22} color="#A0A0A0" />
              </TouchableOpacity>
            </View>
            <View style={[styles.line, { backgroundColor: isPasswordStrong ? "#4CD964" : "#DADADA" }]} />
          </View>

          {/* CONFIRM PASSWORD INPUT */}
          <View style={[styles.inputGroup, { marginTop: 25 }]}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Feather name="shield" size={20} color={matchPassword ? "#3843FF" : "#9CA3AF"} />
              <TextInput
                placeholder="Re-enter password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!isConfirmVisible}
                value={confirm}
                onChangeText={setConfirm}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setIsConfirmVisible(!isConfirmVisible)}>
                <Ionicons name={isConfirmVisible ? "eye-off-outline" : "eye-outline"} size={22} color="#A0A0A0" />
              </TouchableOpacity>
            </View>
            <View style={[styles.line, { backgroundColor: matchPassword ? "#4CD964" : "#DADADA" }]} />
          </View>

          {/* REGISTER BUTTON */}
          <TouchableOpacity
            disabled={!canContinue || loading}
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <TouchableOpacity 
            style={styles.footerLink} 
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.footerText}>Already have an account? <Text style={styles.footerBold}>Login</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    padding: 25,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F8F9FB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "InterBold",
    color: "#111",
    marginLeft: 15,
  },
  welcomeSection: {
    marginBottom: 35,
  },
  title: {
    fontSize: 28,
    fontFamily: "InterBold",
    color: "#111",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "InterRegular",
    color: "#64748B",
    marginTop: 8,
    lineHeight: 22,
  },
  inputGroup: {
    width: "100%",
  },
  label: {
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: "InterBold",
    letterSpacing: 1,
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontFamily: "InterSemiBold",
    color: "#111",
    marginLeft: 12,
  },
  line: {
    height: 2,
    backgroundColor: "#DADADA",
    width: "100%",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#3843FF",
    paddingVertical: 18,
    borderRadius: 25,
    marginTop: 45,
    alignItems: "center",
    shadowColor: "#3843FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#E2E8F0",
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "InterBold",
  },
  footerLink: {
    marginTop: 25,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "InterMedium",
  },
  footerBold: {
    color: "#3843FF",
    fontFamily: "InterBold",
  },
});