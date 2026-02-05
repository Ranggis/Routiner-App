import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// FIREBASE IMPORTS
import { db, auth } from "../../firebase/config";
import { 
  doc, 
  onSnapshot, 
  deleteDoc, 
  updateDoc, 
  increment 
} from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [habit, setHabit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Custom Modal
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success" as "success" | "delete" | "info",
    onConfirm: () => {},
  });

  // --- 1. AMBIL DATA DARI FIREBASE (REAL-TIME) ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !id) return;

    const habitRef = doc(db, "users", user.uid, "habits", id as string);

    const unsubscribe = onSnapshot(habitRef, (docSnap) => {
      if (docSnap.exists()) {
        setHabit({ id: docSnap.id, ...docSnap.data() });
      } else {
        router.back();
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetch detail:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // --- 2. FUNGSI ADD PROGRESS ---
  const handleAddProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !habit) return;

      const habitRef = doc(db, "users", user.uid, "habits", habit.id);
      
      if (habit.currentProgress < habit.target) {
        await updateDoc(habitRef, {
          currentProgress: increment(1)
        });
        
        // Jika setelah ditambah langsung mencapai target
        if (habit.currentProgress + 1 === habit.target) {
          setModalConfig({
            visible: true,
            title: "Goal Reached! 🎉",
            message: `Selamat! Kamu telah menyelesaikan target "${habit.name}" hari ini.`,
            type: "success",
            onConfirm: () => setModalConfig({ ...modalConfig, visible: false }),
          });
        }
      } else {
        setModalConfig({
          visible: true,
          title: "Great!",
          message: "Your target for this habit has been fully achieved.",
          type: "info",
          onConfirm: () => setModalConfig({ ...modalConfig, visible: false }),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- 3. FUNGSI DELETE ---
  const handleDeleteTrigger = () => {
    setModalConfig({
      visible: true,
      title: "Delete Habit?",
      message: "The progress data and habit history will be permanently deleted.",
      type: "delete",
      onConfirm: async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;
          setModalConfig({ ...modalConfig, visible: false });
          await deleteDoc(doc(db, "users", user.uid, "habits", habit.id));
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  // --- 4. FUNGSI EDIT ---
  const handleEdit = () => {
    router.push({
      pathname: "/AddHabbit",
      params: { 
        id: habit.id, 
        mode: "edit",
        name: habit.name,
        target: habit.target.toString(),
        unit: habit.unit,
        icon: habit.icon,
        iconColor: habit.iconColor,
        color: habit.color
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3843FF" />
      </View>
    );
  }

  if (!habit) return null;

  const current = Number(habit.currentProgress) || 0;
  const target = Number(habit.target) || 1;
  const progressPercent = Math.min(Math.round((current / target) * 100), 100);

  return (
    <SafeAreaView style={styles.safe}>
      {/* CUSTOM POP UP MODAL */}
      <Modal visible={modalConfig.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[
              styles.modalIconCircle, 
              { backgroundColor: modalConfig.type === 'delete' ? '#FFE5E5' : modalConfig.type === 'success' ? '#E0F2E9' : '#EBF0FF' }
            ]}>
              <MaterialCommunityIcons 
                name={modalConfig.type === 'delete' ? "trash-can-outline" : modalConfig.type === 'success' ? "check-decagram" : "information-outline"} 
                size={40} 
                color={modalConfig.type === 'delete' ? "#FF5A5A" : modalConfig.type === 'success' ? "#4CD964" : "#3843FF"} 
              />
            </View>
            
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            
            <View style={styles.modalActionRow}>
              {modalConfig.type === 'delete' && (
                <TouchableOpacity 
                  style={styles.modalCancelBtn} 
                  onPress={() => setModalConfig({ ...modalConfig, visible: false })}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.modalConfirmBtn, 
                  { backgroundColor: modalConfig.type === 'delete' ? '#FF5A5A' : '#3843FF' }
                ]} 
                onPress={modalConfig.onConfirm}
              >
                <Text style={styles.modalConfirmText}>
                  {modalConfig.type === 'delete' ? "Yes, Delete" : "Nice"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Habit Detail</Text>
          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Ionicons name="create-outline" size={22} color="#3843FF" />
          </TouchableOpacity>
        </View>

        {/* TOP CARD */}
        <View style={[styles.topCard, { backgroundColor: habit.color || "#F4F5F7" }]}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name={habit.icon || "fire"}
              size={34}
              color={habit.iconColor || "#3843FF"}
            />
          </View>

          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitTarget}>{habit.target} {habit.unit} Goal</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          <Text style={styles.progressText}>
            {current} / {target} {habit.unit} ({progressPercent}%)
          </Text>
        </View>

        {/* PROGRESS HISTORY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Progress History</Text>
        </View>

        <View style={styles.historyList}>
          <View style={styles.historyRow}>
            <Text style={styles.historyDay}>Today</Text>
            <View style={[styles.statusBadge, current >= target ? styles.done : styles.skip]}>
               <Text style={styles.statusText}>{current >= target ? "Completed" : "In Progress"}</Text>
            </View>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleAddProgress}>
            <Ionicons name="add-circle" size={26} color="#3843FF" />
            <Text style={styles.actionLabel}>Add Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteTrigger}>
            <Ionicons name="trash-outline" size={22} color="#FFF" />
            <Text style={styles.deleteText}>Delete Habit</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  backBtn: { width: 44, height: 44, backgroundColor: "#F4F5F7", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  editBtn: { width: 44, height: 44, backgroundColor: "#F4F5F7", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: "InterBold", fontSize: 20, color: "#111" },
  
  topCard: { marginHorizontal: 20, marginTop: 25, padding: 25, borderRadius: 32, alignItems: "center" },
  iconWrap: { width: 64, height: 64, backgroundColor: "#FFF", borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 15, elevation: 2, shadowOpacity: 0.1 },
  habitName: { fontFamily: "InterBold", fontSize: 22, color: "#111" },
  habitTarget: { color: "#555", marginTop: 4, fontFamily: "InterMedium", fontSize: 15 },
  progressBar: { height: 12, backgroundColor: "rgba(0,0,0,0.06)", width: "100%", marginTop: 25, borderRadius: 10, overflow: "hidden" },
  progressFill: { backgroundColor: "#3843FF", height: "100%" },
  progressText: { marginTop: 12, fontFamily: "InterBold", color: "#111", fontSize: 14 },
  
  sectionHeader: { marginTop: 35, marginLeft: 20 },
  sectionTitle: { fontFamily: "InterBold", fontSize: 18, color: "#1E293B" },
  historyList: { marginTop: 12, paddingHorizontal: 20 },
  historyRow: { backgroundColor: "#F8F9FA", padding: 16, borderRadius: 18, flexDirection: "row", alignItems: "center", marginBottom: 10, justifyContent: "space-between", borderWidth: 1, borderColor: "#F1F5F9" },
  historyDay: { fontFamily: "InterSemiBold", color: "#334155" },
  statusBadge: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
  statusText: { fontFamily: "InterBold", color: "#FFF", fontSize: 12 },
  done: { backgroundColor: "#10B981" },
  skip: { backgroundColor: "#94A3B8" },
  
  actionRow: { marginTop: 30, paddingHorizontal: 20 },
  actionBtn: { flexDirection: "row", backgroundColor: "#EEF2FF", padding: 18, borderRadius: 20, alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 },
  actionLabel: { fontFamily: "InterBold", fontSize: 16, color: "#3843FF" },
  deleteBtn: { flexDirection: "row", backgroundColor: "#FF5A5A", padding: 18, borderRadius: 20, alignItems: "center", justifyContent: "center", gap: 8 },
  deleteText: { fontFamily: "InterBold", color: "#FFF", fontSize: 16 },

  /* MODAL STYLES */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: '#FFF', borderRadius: 32, padding: 25, alignItems: 'center' },
  modalIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'InterBold', fontSize: 20, color: '#1E293B', textAlign: 'center' },
  modalMessage: { fontFamily: 'InterRegular', fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  modalActionRow: { flexDirection: 'row', marginTop: 25, gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', borderRadius: 16, backgroundColor: '#F1F5F9' },
  modalCancelText: { fontFamily: 'InterBold', color: '#64748B' },
  modalConfirmBtn: { flex: 2, paddingVertical: 15, alignItems: 'center', borderRadius: 16 },
  modalConfirmText: { fontFamily: 'InterBold', color: '#FFF' },
});