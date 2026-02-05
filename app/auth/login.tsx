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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase (Asumsi service sudah ada)
import { login } from "../../services/auth";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // State untuk toggle password
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Logika Validasi: Tombol aktif jika email valid dan password minimal 6 karakter
  const isValidEmail = email.includes("@") && email.includes(".");
  const isButtonActive = isValidEmail && password.length >= 6;

  const handleLogin = async () => {
    if (!isButtonActive) return;
    
    setErrorMsg("");
    setLoading(true);

    const result = await login(email.trim(), password);

    if (result.error) {
      setErrorMsg("Email atau password salah.");
      setLoading(false);
      return;
    }

    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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

          {/* E-MAIL INPUT */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-MAIL</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={email}
                onChangeText={(val) => setEmail(val)}
                placeholder="Enter your e-mail"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              {email.length > 0 && (
                <TouchableOpacity onPress={() => setEmail("")}>
                  <Ionicons name="close-circle" size={20} color="#A0A0A0" />
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.inputLine, { backgroundColor: isValidEmail ? "#4CD964" : "#DADADA" }]} />
          </View>

          {/* PASSWORD INPUT */}
          <View style={[styles.inputGroup, { marginTop: 25 }]}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={password}
                onChangeText={(val) => setPassword(val)}
                placeholder="Enter your password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!isPasswordVisible} // Toggle visibility di sini
                style={styles.input}
              />
              {/* IKON MATA UNTUK LIHAT PASSWORD */}
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons 
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#A0A0A0" 
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputLine, { backgroundColor: password.length >= 6 ? "#4CD964" : "#DADADA" }]} />
          </View>

          {/* FORGOT PASSWORD */}
          <TouchableOpacity onPress={() => router.push("../auth/forgot")}>
            <Text style={styles.forgot}>I forgot my password</Text>
          </TouchableOpacity>

          {/* ERROR MESSAGE */}
          {errorMsg !== "" && <Text style={styles.errorText}>{errorMsg}</Text>}

          {/* REGISTER LINK */}
          <TouchableOpacity
            style={styles.registerContainer}
            onPress={() => router.push("../auth/register/register")}
          >
            <Text style={styles.registerText}>Don’t have account? <Text style={styles.registerBold}>Let’s create!</Text></Text>
          </TouchableOpacity>

          {/* BUTTON NEXT */}
          <TouchableOpacity
            style={[styles.button, !isButtonActive && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!isButtonActive || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "InterBold",
    color: "#111",
    marginLeft: 15,
  },
  inputGroup: {
    width: "100%",
  },
  label: {
    fontSize: 11,
    color: "#111",
    fontFamily: "InterBold",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 10,
    fontFamily: "InterSemiBold",
    color: "#111",
  },
  inputLine: {
    height: 2,
    width: "100%",
    marginTop: 2,
  },
  forgot: {
    marginTop: 15,
    color: "#777",
    fontSize: 14,
    fontFamily: "InterMedium",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 10,
    fontFamily: "InterMedium",
  },
  registerContainer: {
    marginTop: 80,
    alignItems: "center",
    marginBottom: 20,
  },
  registerText: {
    fontSize: 15,
    color: "#3843FF",
    fontFamily: "InterMedium",
  },
  registerBold: {
    fontFamily: "InterBold",
  },
  button: {
    backgroundColor: "#3843FF",
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#3843FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#6B7AFF",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "InterBold",
  },
});