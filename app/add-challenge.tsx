import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  Platform,
  Modal,
  Dimensions
} from "react-native";
import { db, auth } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");

export default function AddChallenge() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // State untuk Pop Up

  // STATE FORM
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [unit, setUnit] = useState("km");
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // STATE BARU: ICON & WARNA
  const [selectedIcon, setSelectedIcon] = useState("trophy");
  const [selectedColor, setSelectedColor] = useState("#3843FF");

  const units = ["km", "steps", "min", "times", "ml"];
  
  const icons = [
    "trophy", "run", "walk", "bike", "water", 
    "arm-flex", "timer-outline", "star", "fire", "heart"
  ];

  const colors = [
    "#3843FF", "#FF5A5A", "#00C853", "#FFAB00", 
    "#AA00FF", "#00B8D4", "#F50057", "#37474F"
  ];

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleCreateChallenge = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!title.trim() || !goal) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "challenges"), {
        title: title.trim(),
        goal: Number(goal),
        unit: unit,
        endDate: endDate.toISOString(),
        icon: selectedIcon,
        color: selectedColor,
        participants: [user.uid],
        participantPhotos: [user.photoURL || ""],
        userScores: { [user.uid]: 0 },
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      // Tampilkan Custom Pop Up daripada Alert standar
      setShowSuccess(true);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* MODAL SUCCESS (POP UP) */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.successIconBadge, { backgroundColor: selectedColor }]}>
               <MaterialCommunityIcons name="check-bold" size={40} color="#FFF" />
            </View>
            <Text style={styles.modalTitle}>Challenge Launched!</Text>
            <Text style={styles.modalDesc}>
              Tantangan "{title}" berhasil dibuat. Yuk, mulai gerak dan capai targetmu!
            </Text>
            <TouchableOpacity 
              style={[styles.modalBtn, { backgroundColor: selectedColor }]} 
              onPress={() => {
                setShowSuccess(false);
                router.back();
              }}
            >
              <Text style={styles.modalBtnText}>Mantap, Ayo Mulai!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Challenge</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PREVIEW CARD */}
        <View style={[styles.previewCard, { backgroundColor: selectedColor + '15', borderColor: selectedColor + '30' }]}>
           <View style={[styles.iconCircle, { backgroundColor: selectedColor }]}>
              <MaterialCommunityIcons name={selectedIcon as any} size={28} color="#FFF" />
           </View>
           <View style={{marginLeft: 15, flex: 1}}>
              <Text style={styles.previewTitle} numberOfLines={1}>{title || "Nama Challenge..."}</Text>
              <Text style={styles.previewSub}>{goal || "0"} {unit} • Ends in {endDate.toLocaleDateString()}</Text>
           </View>
        </View>

        <Text style={styles.label}>CHALLENGE TITLE</Text>
        <TextInput 
          style={styles.input}
          placeholder="Contoh: 100km lari bersama"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#94A3B8"
        />

        <Text style={[styles.label, { marginTop: 25 }]}>CHOOSE ICON</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {icons.map((ic) => (
            <TouchableOpacity 
              key={ic} 
              style={[styles.iconOption, selectedIcon === ic && { borderColor: selectedColor, backgroundColor: selectedColor + '10' }]} 
              onPress={() => setSelectedIcon(ic)}
            >
              <MaterialCommunityIcons 
                name={ic as any} 
                size={24} 
                color={selectedIcon === ic ? selectedColor : "#94A3B8"} 
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { marginTop: 25 }]}>CHOOSE COLOR</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {colors.map((c) => (
            <TouchableOpacity 
              key={c} 
              style={[styles.colorOption, { backgroundColor: c }]} 
              onPress={() => setSelectedColor(c)}
            >
              {selectedColor === c && <Ionicons name="checkmark" size={20} color="#FFF" />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { marginTop: 25 }]}>TARGET & UNIT</Text>
        <View style={styles.row}>
          <TextInput 
            style={[styles.input, { flex: 1 }]}
            placeholder="0"
            keyboardType="numeric"
            value={goal}
            onChangeText={setGoal}
          />
          <View style={[styles.unitBadge, { backgroundColor: selectedColor }]}>
            <Text style={styles.unitText}>{unit}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {units.map((u) => (
            <TouchableOpacity 
              key={u} 
              style={[styles.chip, unit === u && { backgroundColor: selectedColor, borderColor: selectedColor }]} 
              onPress={() => setUnit(u)}
            >
              <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { marginTop: 25 }]}>END DATE</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={selectedColor} />
          <Text style={styles.dateBtnText}>{endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker 
            value={endDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: selectedColor }]} 
          onPress={handleCreateChallenge}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Launch Challenge</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#F8F9FB", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: "InterBold", fontSize: 18, color: "#111" },
  scrollContent: { padding: 25 },
  label: { fontSize: 11, fontFamily: "InterBold", color: "#94A3B8", letterSpacing: 1, marginBottom: 10 },
  input: { backgroundColor: "#F8F9FB", padding: 16, borderRadius: 16, fontSize: 16, fontFamily: "InterMedium", borderWidth: 1, borderColor: "#F1F5F9" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  unitBadge: { paddingHorizontal: 15, paddingVertical: 16, borderRadius: 16 },
  unitText: { color: "#FFF", fontFamily: "InterBold" },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, backgroundColor: "#F1F5F9", marginRight: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  chipText: { color: "#64748B", fontFamily: "InterSemiBold" },
  chipTextActive: { color: "#FFF" },
  dateBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FB", padding: 16, borderRadius: 16, gap: 10, borderWidth: 1, borderColor: "#F1F5F9" },
  dateBtnText: { fontFamily: "InterSemiBold", fontSize: 15 },
  submitBtn: { padding: 20, borderRadius: 20, marginTop: 40, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  submitText: { color: "#FFF", fontFamily: "InterBold", fontSize: 16 },
  
  // PREVIEW STYLES
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderStyle: 'dashed' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  previewTitle: { fontFamily: 'InterBold', fontSize: 18, color: '#1E293B' },
  previewSub: { fontFamily: 'InterMedium', fontSize: 13, color: '#64748B', marginTop: 4 },

  // SELECTOR STYLES
  selectorScroll: { marginBottom: 5 },
  iconOption: { width: 50, height: 50, borderRadius: 15, backgroundColor: "#F8F9FB", justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 2, borderColor: 'transparent' },
  colorOption: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12, justifyContent: 'center', alignItems: 'center' },

  // POP UP / MODAL STYLES
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: width * 0.85, 
    backgroundColor: '#FFF', 
    borderRadius: 32, 
    padding: 30, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  successIconBadge: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { 
    fontFamily: 'InterBold', 
    fontSize: 22, 
    color: '#1E293B', 
    marginBottom: 10 
  },
  modalDesc: { 
    fontFamily: 'InterMedium', 
    fontSize: 14, 
    color: '#64748B', 
    textAlign: 'center', 
    lineHeight: 20,
    marginBottom: 25
  },
  modalBtn: { 
    width: '100%', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  modalBtnText: { 
    color: '#FFF', 
    fontFamily: 'InterBold', 
    fontSize: 16 
  }
});