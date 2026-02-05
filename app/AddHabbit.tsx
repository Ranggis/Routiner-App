import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, auth } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

export default function AddHabit() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // --- PERBAIKAN 1: Sanitasi data awal agar tidak NaN ---
  const cleanInitialTarget = params.target 
    ? String(params.target).replace(/[^0-9]/g, "") 
    : "";

  // STATE
  const [habitName, setHabitName] = useState((params.name as string) || "");
  const [target, setTarget] = useState(cleanInitialTarget);
  
  // PERBAIKAN 2: Unit sekarang mengambil dari params (agar tidak default ke 'times' terus)
  const [unit, setUnit] = useState((params.unit as string) || "times");
  
  const [repeat, setRepeat] = useState("Everyday");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // DATE STATES
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  // CONFIG
  const units = ["times", "min", "km", "ml", "pages"];
  const iconName = (params.icon as any) || "fire";
  const iconColor = (params.iconColor as string) || "#3843FF";
  const cardBg = (params.color as string) || "#F0F2FF";

  const onStartChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStart(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEnd(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return Alert.alert("Error", "User not logged in.");
      
      const trimmedName = habitName.trim();
      const numTarget = parseInt(target, 10);

      // --- VALIDASI ---
      if (!trimmedName) {
        return Alert.alert("Incomplete", "Please enter a habit name.");
      }
      if (!target || isNaN(numTarget) || numTarget <= 0) {
        return Alert.alert("Incomplete", "Please enter a valid target number (minimum 1).");
      }
      if (endDate < startDate) {
        return Alert.alert("Date Error", "End date cannot be earlier than start date.");
      }

      setLoading(true);
      const habitId = Date.now().toString();

      // SIMPAN KE FIRESTORE
      await setDoc(doc(db, "users", user.uid, "habits", habitId), {
        name: trimmedName,
        target: numTarget,
        currentProgress: 0, // Proteksi agar di Home tidak NaN
        unit: unit,
        repeat: repeat,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        icon: iconName,
        iconColor: iconColor,
        color: cardBg,
        createdAt: new Date().toISOString(),
      });

      setLoading(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Habit</Text>
          <View style={{ width: 44 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* PREVIEW CARD */}
          <View style={[styles.previewCard, { backgroundColor: cardBg }]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name={iconName} size={28} color={iconColor} />
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.previewName}>{habitName || "Habit Name"}</Text>
              <Text style={styles.previewTarget}>{target || "0"} {unit} • {repeat}</Text>
            </View>
          </View>

          {/* INPUTS */}
          <Text style={styles.label}>HABIT NAME</Text>
          <TextInput
            style={styles.input}
            value={habitName}
            onChangeText={setHabitName}
            placeholder="Enter habit name..."
            placeholderTextColor="#999"
          />
          <View style={styles.line} />

          <Text style={[styles.label, { marginTop: 30 }]}>TARGET & UNIT</Text>
          <View style={styles.targetRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={target}
              // PERBAIKAN 3: Filter angka saja saat mengetik
              onChangeText={(val) => setTarget(val.replace(/[^0-9]/g, ""))}
              placeholder="0"
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
            <View style={styles.unitBadge}>
              <Text style={styles.unitBadgeText}>{unit}</Text>
            </View>
          </View>
          <View style={styles.line} />

          {/* UNIT CHIPS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {units.map((u) => (
              <TouchableOpacity 
                key={u} 
                style={[styles.chip, unit === u && styles.chipActive]} 
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* DATES */}
          <View style={styles.dateSection}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>START DATE</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowStart(true)}>
                <Ionicons name="calendar-outline" size={18} color="#3843FF" />
                <Text style={styles.dateBtnText}>{startDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.label}>END DATE</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowEnd(true)}>
                <Ionicons name="calendar-outline" size={18} color="#3843FF" />
                <Text style={styles.dateBtnText}>{endDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStart && <DateTimePicker value={startDate} mode="date" display="default" onChange={onStartChange} />}
          {showEnd && <DateTimePicker value={endDate} mode="date" display="default" onChange={onEndChange} />}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Create Habit</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- SUCCESS MODAL --- */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconCircle}>
              <MaterialCommunityIcons name="check-decagram" size={60} color="#4CD964" />
            </View>
            <Text style={styles.modalTitle}>Habit Created!</Text>
            <Text style={styles.modalSubtitle}>
              Great job! Your habit <Text style={{fontFamily: 'InterBold', color: '#111'}}>"{habitName}"</Text> telah berhasil ditambahkan.
            </Text>
            
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
            >
              <Text style={styles.modalButtonText}>Let's start!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#F8F9FB", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#F1F5F9" },
  headerTitle: { fontFamily: "InterBold", fontSize: 20, color: "#111" },
  scrollContent: { padding: 25 },
  previewCard: { flexDirection: "row", padding: 20, borderRadius: 24, marginBottom: 35, alignItems: "center" },
  iconCircle: { width: 52, height: 52, backgroundColor: "#FFF", borderRadius: 16, justifyContent: "center", alignItems: "center" },
  previewName: { fontFamily: "InterBold", fontSize: 18, color: "#111" },
  previewTarget: { fontFamily: "InterMedium", color: "#64748B", marginTop: 4, fontSize: 13 },
  label: { fontSize: 11, fontFamily: "InterBold", color: "#94A3B8", letterSpacing: 1, marginBottom: 5 },
  input: { fontSize: 18, fontFamily: "InterSemiBold", color: "#111", paddingVertical: 10 },
  line: { height: 2, backgroundColor: "#F3F4F6" },
  targetRow: { flexDirection: "row", alignItems: "center" },
  unitBadge: { backgroundColor: "#F0F2FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  unitBadgeText: { color: "#3843FF", fontFamily: "InterBold", fontSize: 12 },
  chipScroll: { marginTop: 15, marginBottom: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: "#F8F9FB", borderRadius: 14, marginRight: 10, borderWidth: 1, borderColor: "#F1F5F9" },
  chipActive: { backgroundColor: "#3843FF", borderColor: "#3843FF" },
  chipText: { fontFamily: "InterSemiBold", color: "#64748B", fontSize: 13 },
  chipTextActive: { color: "#FFF" },
  dateSection: { flexDirection: "row", marginTop: 30 },
  datePickerBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FB", padding: 14, borderRadius: 16, marginTop: 8, borderWidth: 1, borderColor: "#F1F5F9", gap: 10 },
  dateBtnText: { fontFamily: "InterSemiBold", color: "#111", fontSize: 14 },
  saveBtn: { backgroundColor: "#3843FF", paddingVertical: 18, borderRadius: 20, alignItems: "center", marginTop: 50, shadowColor: "#3843FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  saveBtnText: { color: "#FFF", fontSize: 16, fontFamily: "InterBold" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 35, padding: 30, alignItems: 'center', elevation: 10 },
  successIconCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#E0F2E9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontFamily: 'InterBold', color: '#111', marginBottom: 10 },
  modalSubtitle: { fontSize: 15, fontFamily: 'InterRegular', color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  modalButton: { backgroundColor: '#3843FF', width: '100%', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  modalButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'InterBold' }
});