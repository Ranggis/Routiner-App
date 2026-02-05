import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

// Firebase Imports
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { sendInAppNotif } from "../../utils/notifHelper"; // Sesuaikan path-nya

interface HabitProps {
  id: string;
  label: string;
  progress: string;
  icon: any;
  iconColor: string;
  cardColor: string;
  currentProgress: number;
  target: number;
}

const getLocalFormattedDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HabitCard({ 
  id, label, progress, icon, iconColor, cardColor, currentProgress, target 
}: HabitProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const router = useRouter();
  
  // PENANDA STATUS SELESAI
  const isDone = currentProgress >= target;

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success" as "success" | "delete" | "confirm-done",
    onConfirm: () => {},
  });

  const [showSkipModal, setShowSkipModal] = useState(false);

  // --- 1. FUNGSI SIMPAN POIN & HISTORY ---
  const saveToHistoryAndPoints = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const todayStr = getLocalFormattedDate(new Date());
    const historyRef = collection(db, "users", user.uid, "history");
    const userRef = doc(db, "users", user.uid);

    const q = query(historyRef, where("habitId", "==", id), where("date", "==", todayStr));
    const existingDocs = await getDocs(q);

    if (existingDocs.empty) {
      await addDoc(historyRef, {
        habitId: id,
        habitName: label,
        date: todayStr,
        completedAt: serverTimestamp(),
        pointsEarned: 50,
      });

      await updateDoc(userRef, {
        totalPoints: increment(50),
        weeklyPoints: increment(50),
        dailyPoints: increment(50)
      });
    }
  };

  // --- 2. FUNGSI ADD PROGRESS (+) ---
  const handleAddProgress = async () => {
    if (isDone) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      const habitRef = doc(db, "users", user.uid, "habits", id);
      
      if (currentProgress < target) {
        await updateDoc(habitRef, { currentProgress: increment(1) });
        
        if (currentProgress + 1 === target) {
          await saveToHistoryAndPoints();

          // --- TAMBAHKAN KODE INI ---
          sendInAppNotif(
            user.uid, 
            "Goal Reached! 🔥", 
            `Amazing! You finished "${label}" for today.`, 
            "streak"
          );
          // --------------------------

          setModalConfig({
            visible: true,
            title: "Goal Reached!",
            message: `Amazing! You finished "${label}" and earned +50 points!`,
            type: "success",
            onConfirm: () => setModalConfig({ ...modalConfig, visible: false }),
          });
        }
      }
    } catch (error: any) { console.error(error.message); }
  };

  // --- 3. LOGIKA MARK DONE DENGAN KONFIRMASI ---
  const handleMarkDone = () => {
    swipeableRef.current?.close();
    if (isDone) return; // Mencegah klik jika sudah selesai

    setModalConfig({
      visible: true,
      title: "Finish Habit?",
      message: `Complete "${label}" for today and get +50 points?`,
      type: "confirm-done",
      onConfirm: actuallyMarkDone,
    });
  };

  const actuallyMarkDone = async () => {
    setModalConfig({ ...modalConfig, visible: false });
    try {
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid, "habits", id), { currentProgress: target });
      await saveToHistoryAndPoints();
      
      // --- TAMBAHKAN KODE INI ---
      sendInAppNotif(
        user.uid, 
        "Well Done! 🏆", 
        `Successfully completed "${label}"!`, 
        "streak"
      );
      // --------------------------

      setTimeout(() => {
        setModalConfig({
          visible: true,
          title: "Well Done!",
          message: `Successfully completed "${label}"!`,
          type: "success",
          onConfirm: () => setModalConfig({ ...modalConfig, visible: false }),
        });
      }, 500);
    } catch (error) { console.log(error); }
  };

  // --- 4. LOGIKA HAPUS (FIX LEADERBOARD BUG) ---
  const handleDelete = () => {
    swipeableRef.current?.close();
    setModalConfig({
      visible: true,
      title: "Delete Habit?",
      message: `Habit "${label}" and its earned points will be removed.`,
      type: "delete",
      onConfirm: actuallyDelete,
    });
  };

  const actuallyDelete = async () => {
    setModalConfig({ ...modalConfig, visible: false });
    try {
      const user = auth.currentUser;
      if (!user) return;

      const batch = writeBatch(db);
      const userRef = doc(db, "users", user.uid);
      const historyRef = collection(db, "users", user.uid, "history");
      const q = query(historyRef, where("habitId", "==", id));
      const historySnapshot = await getDocs(q);

      let totalPointsToDeduct = 0;
      let dailyPointsToDeduct = 0;
      const todayStr = getLocalFormattedDate(new Date());

      historySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const points = data.pointsEarned || 0;
        totalPointsToDeduct += points;
        if (data.date === todayStr) {
          dailyPointsToDeduct += points;
        }
        batch.delete(docSnap.ref);
      });

      batch.update(userRef, {
        totalPoints: increment(-totalPointsToDeduct),
        weeklyPoints: increment(-totalPointsToDeduct),
        dailyPoints: increment(-dailyPointsToDeduct)
      });

      batch.delete(doc(db, "users", user.uid, "habits", id));
      await batch.commit();
    } catch (error) { console.log(error); }
  };

  // --- 5. NAVIGASI & SKIP ---
  const handleViewDetail = () => {
    swipeableRef.current?.close();
    router.push(`/habit/${id}` as any);
  };

  const handleSkip = () => {
    swipeableRef.current?.close();
    setShowSkipModal(true);
  };

  const handleConfirmReschedule = async (selectedDayISO: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const todayStr = getLocalFormattedDate(new Date());
      await updateDoc(doc(db, "users", user.uid, "habits", id), {
        hiddenDates: arrayUnion(todayStr),
        rescheduledTo: selectedDayISO 
      });
      setShowSkipModal(false);
    } catch (error) { console.log(error); }
  };

  // --- RENDER ACTIONS (SWIPE) ---
  const renderLeftActions = () => (
    <View style={styles.leftActionsWrapper}>
      <TouchableOpacity style={styles.actionBtn} onPress={handleViewDetail}>
        <Ionicons name="eye-outline" size={20} color="#4A5CFF" />
        <Text style={styles.actionText}>Detail</Text>
      </TouchableOpacity>
      {/* Visual feedback jika sudah Done */}
      <TouchableOpacity 
        style={[styles.actionBtn, isDone && { opacity: 0.4 }]} 
        onPress={handleMarkDone}
        disabled={isDone}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color={isDone ? "#94A3B8" : "#4CD964"} />
        <Text style={styles.actionText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.rightActionsWrapper}>
      <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color="#FF5A5A" />
        <Text style={[styles.actionText, { color: '#FF5A5A' }]}>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={handleSkip}>
        <Ionicons name="play-forward-outline" size={20} color="#64748B" />
        <Text style={styles.actionText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Swipeable ref={swipeableRef} renderLeftActions={renderLeftActions} renderRightActions={renderRightActions} friction={2}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleViewDetail}>
          <View style={[styles.card, { backgroundColor: cardColor || "#F8F9FB" }]}>
            <View style={styles.leftSide}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={icon || "fire"} size={24} color={iconColor || "#3843FF"} />
              </View>
              <View style={styles.info}>
                <Text style={styles.label} numberOfLines={1}>{label}</Text>
                <Text style={styles.progressText}>{currentProgress} / {target} {progress}</Text>
              </View>
            </View>
            <View style={styles.rightSide}>
              {/* Visual feedback tombol Plus jika sudah selesai */}
              <TouchableOpacity 
                style={[styles.plusBtn, isDone && { opacity: 0.3 }]} 
                onPress={handleAddProgress}
                disabled={isDone}
              >
                <Ionicons name={isDone ? "checkmark-done" : "add"} size={20} color={isDone ? "#10B981" : "#111"} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>

      {/* MODAL SYSTEM */}
      <Modal visible={modalConfig.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[
              styles.modalIconCircle, 
              { 
                backgroundColor: 
                  modalConfig.type === 'delete' ? '#FFE5E5' : 
                  modalConfig.type === 'confirm-done' ? '#EBF0FF' : 
                  '#E0F2E9' 
              }
            ]}>
              <MaterialCommunityIcons 
                name={
                  modalConfig.type === 'delete' ? "trash-can-outline" : 
                  modalConfig.type === 'confirm-done' ? "checkbox-marked-circle-outline" : 
                  "check-decagram"
                } 
                size={50} 
                color={
                  modalConfig.type === 'delete' ? "#FF5A5A" : 
                  modalConfig.type === 'confirm-done' ? "#3843FF" : 
                  "#4CD964"
                } 
              />
            </View>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>

            <View style={styles.modalBtnWrapper}>
              {(modalConfig.type === 'delete' || modalConfig.type === 'confirm-done') && (
                <TouchableOpacity 
                  style={styles.modalCancelBtn} 
                  onPress={() => setModalConfig({ ...modalConfig, visible: false })}
                >
                  <Text style={styles.cancelBtnTextLabel}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.modalBtn, 
                  { 
                    backgroundColor: modalConfig.type === 'delete' ? '#FF5A5A' : '#3843FF',
                    flex: (modalConfig.type === 'delete' || modalConfig.type === 'confirm-done') ? 1 : 0,
                    width: (modalConfig.type === 'delete' || modalConfig.type === 'confirm-done') ? 'auto' : '100%' 
                  }
                ]} 
                onPress={modalConfig.onConfirm}
              >
                <Text style={styles.confirmBtnText}>
                  {modalConfig.type === 'delete' ? "Delete" : modalConfig.type === 'confirm-done' ? "Finish" : "Good!"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL SKIP */}
      <Modal visible={showSkipModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.skipModalContent}>
            <View style={styles.rescheduleHeader}>
              <MaterialCommunityIcons name="calendar-clock" size={40} color="#3843FF" />
              <Text style={styles.modalTitle}>Reschedule?</Text>
            </View>
            <View style={styles.daysList}>
              {[1,2,3].map((i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const iso = getLocalFormattedDate(date);
                const labelDate = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
                return (
                  <TouchableOpacity key={i} style={styles.dayOption} onPress={() => handleConfirmReschedule(iso)}>
                    <Text style={styles.dayText}>{labelDate}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.cancelSkipBtn} onPress={() => setShowSkipModal(false)}>
              <Text style={styles.cancelSkipText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 24, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  leftSide: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  info: { marginLeft: 14, flex: 1 },
  label: { fontFamily: "InterBold", fontSize: 16, color: "#111" },
  progressText: { fontFamily: "InterMedium", color: "#64748B", fontSize: 12, marginTop: 2 },
  rightSide: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  plusBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  leftActionsWrapper: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 24, marginBottom: 12, marginRight: 10, width: 140 },
  rightActionsWrapper: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 24, marginBottom: 12, marginLeft: 10, width: 140 },
  actionBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 11, color: '#64748B', marginTop: 4, fontFamily: 'InterSemiBold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 32, padding: 24, alignItems: 'center' },
  modalIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: 'InterBold', color: '#111', textAlign: 'center' },
  modalMessage: { fontSize: 14, fontFamily: 'InterRegular', color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  modalBtnWrapper: { flexDirection: 'row', width: '100%', gap: 12, marginTop: 24 },
  modalCancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#F1F5F9' },
  cancelBtnTextLabel: { color: '#64748B', fontSize: 16, fontFamily: 'InterBold' },
  modalBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'InterBold' },
  skipModalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 32, padding: 24 },
  rescheduleHeader: { alignItems: 'center', marginBottom: 20 },
  daysList: { gap: 10 },
  dayOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#F8F9FB', borderRadius: 15 },
  dayText: { fontFamily: 'InterSemiBold', color: '#1E293B' },
  cancelSkipBtn: { alignItems: 'center', marginTop: 15 },
  cancelSkipText: { color: '#94A3B8', fontFamily: 'InterBold' }
});