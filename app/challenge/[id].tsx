import React, { useEffect, useState, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Dimensions,
  Modal,
  Alert,
  Pressable 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { db, auth } from "../../firebase/config";
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  increment,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
  setDoc
} from "firebase/firestore";

const { width } = Dimensions.get("window");

const getLocalTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function ChallengeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, "challenges", id as string), (docSnap) => {
      if (docSnap.exists()) {
        setChallenge({ id: docSnap.id, ...docSnap.data() });
      } else {
        if (!showDeleteModal) router.back();
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching challenge:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, showDeleteModal]);

  // --- LOGIKA STATUS ---
  const isJoined = useMemo(() => challenge?.participants?.includes(user?.uid), [challenge, user]);
  const isOwner = useMemo(() => challenge?.createdBy === user?.uid, [challenge, user]);
  const userScore = useMemo(() => challenge?.userScores?.[user?.uid || ""] || 0, [challenge, user]);
  const progressPercent = Math.min(Math.round((userScore / (challenge?.goal || 1)) * 100), 100);
  const isCompleted = userScore >= (challenge?.goal || 0);
  const themeColor = challenge?.color || "#3843FF";

  // --- LOGIKA CEK TANGGAL BERAKHIR ---
  const isEnded = useMemo(() => {
    if (!challenge?.endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam agar perbandingan tanggal murni
    
    const end = new Date(challenge.endDate);
    end.setHours(0, 0, 0, 0);
    
    return today > end; // True jika hari ini sudah melewati tanggal akhir
  }, [challenge]);

  const saveChallengeToHistory = async () => {
    if (!user || !challenge) return;
    const todayStr = getLocalTodayStr();
    const historyRef = collection(db, "users", user.uid, "history");
    const userRef = doc(db, "users", user.uid);

    try {
      const q = query(historyRef, where("habitId", "==", challenge.id), where("type", "==", "challenge"));
      const existingDocs = await getDocs(q);

      if (existingDocs.empty) {
        await addDoc(historyRef, {
          habitId: challenge.id,
          habitName: challenge.title,
          date: todayStr,
          completedAt: serverTimestamp(),
          pointsEarned: 200,
          type: "challenge",
          icon: challenge.icon || "trophy",
          color: themeColor
        });

        await setDoc(userRef, {
          totalPoints: increment(200),
          weeklyPoints: increment(200),
          dailyPoints: increment(200)
        }, { merge: true });

        setShowSuccessModal(true); 
      }
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const handleUpdateProgress = async () => {
    // JANGAN UPDATE JIKA SUDAH SELESAI ATAU SUDAH BERAKHIR
    if (isCompleted || isEnded || !user) return;
    
    const amount = 5; 
    const challengeRef = doc(db, "challenges", challenge.id);
    try {
      await updateDoc(challengeRef, { [`userScores.${user.uid}`]: increment(amount) });
      if (userScore + amount >= challenge.goal) {
        await saveChallengeToHistory();
      }
    } catch (e) { console.error(e); }
  };

  const handleJoin = async () => {
    if (!user) return;

    // VALIDASI: GAK BOLEH JOIN KALO UDAH LEWAT TANGGALNYA
    if (isEnded && !isJoined) {
        Alert.alert("Challenge Ended", "Sorry, this challenge is already closed and you cannot join anymore.");
        return;
    }

    const challengeRef = doc(db, "challenges", challenge.id);
    try {
      if (isJoined) {
        await updateDoc(challengeRef, {
          participants: arrayRemove(user.uid),
          participantPhotos: arrayRemove(user.photoURL || "")
        });
      } else {
        await updateDoc(challengeRef, {
          participants: arrayUnion(user.uid),
          participantPhotos: arrayUnion(user.photoURL || ""),
          [`userScores.${user.uid}`]: userScore || 0
        });
      }
    } catch (e) { console.error(e); }
  };

  const confirmDelete = async () => {
    if (!user || !challenge) return;
    try {
      const batch = writeBatch(db);
      const historyRef = collection(db, "users", user.uid, "history");
      const q = query(historyRef, where("habitId", "==", challenge.id));
      const historySnapshot = await getDocs(q);

      historySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const challengeDocRef = doc(db, "challenges", challenge.id);
      batch.delete(challengeDocRef);

      await batch.commit();
      setShowDeleteModal(false);
      router.replace("/(tabs)/home"); 
    } catch (e) {
      console.error("Gagal menghapus:", e);
      Alert.alert("Error", "Gagal menghapus challenge.");
      setShowDeleteModal(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3843FF" /></View>;
  if (!challenge) return null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* IMPROVED POP UP MODAL */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <Pressable 
          style={styles.modalBackdrop} 
          onPress={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.warningIconWrapper}>
                <Ionicons name="trash-outline" size={32} color="#FF4B4B" />
              </View>
              
              <Text style={styles.modalTitleText}>Delete Challenge?</Text>
              <Text style={styles.modalSubtitleText}>
                All your progress and achievement history in the challenge <Text style={{fontFamily: 'InterBold', color: '#1E293B'}}>"{challenge.title}"</Text> will be lost forever.
              </Text>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.btnSecondary} 
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.btnDanger} 
                  onPress={confirmDelete}
                >
                  <Text style={styles.btnDangerText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* CUSTOM SUCCESS CELEBRATION MODAL */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.successModalContainer}>
            <MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
            
            <Text style={styles.successTitleText}>Challenge Completed!</Text>
            <Text style={styles.successSubtitleText}>
              Amazing work! You've successfully finished the <Text style={{fontFamily: 'InterBold', color: '#111'}}>"{challenge.title}"</Text> challenge.
            </Text>

            <View style={styles.rewardCard}>
              <Text style={styles.rewardLabel}>REWARD EARNED</Text>
              <View style={styles.rewardRow}>
                  <Ionicons name="medal" size={24} color="#FF9800" />
                  <Text style={styles.rewardPoints}>+200 Points</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: themeColor, width: '100%' }]} 
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.btnActionText}>Great, thanks!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Challenge</Text>
        {isOwner ? (
          <TouchableOpacity style={styles.deleteHeaderBtn} onPress={() => setShowDeleteModal(true)}>
            <Ionicons name="trash-outline" size={22} color="#FF5A5A" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainCard, { backgroundColor: themeColor }]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
               <MaterialCommunityIcons name={challenge.icon || "trophy"} size={32} color={themeColor} />
            </View>
            <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                    {isEnded ? "Ended" : isJoined ? "Joined" : "Public"}
                </Text>
            </View>
          </View>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.goalText}>Target: {challenge.goal} {challenge.unit}</Text>
          
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.percentText}>{progressPercent}% Selesai</Text>
              <Text style={styles.scoreText}>{userScore} / {challenge.goal}</Text>
            </View>
            <View style={styles.progressBarLarge}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.label}>DESCRIPTION</Text>
            <Text style={styles.desc}>{challenge.description || "This challenge is designed to test your consistency. Come on, stay motivated!"}</Text>
        </View>

        <View style={styles.infoRow}>
            <View style={styles.infoItem}>
                <Ionicons name="people" size={20} color="#64748B" />
                <Text style={styles.infoValue}>{challenge.participants?.length || 0} Participants</Text>
            </View>
            <View style={styles.infoItem}>
                <Ionicons name={isEnded ? "calendar-outline" : "calendar"} size={20} color={isEnded ? "#FF5A5A" : "#64748B"} />
                <Text style={[styles.infoValue, isEnded && { color: "#FF5A5A" }]}>
                    {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : 'No date'}
                    {isEnded && " (Ended)"}
                </Text>
            </View>
        </View>

        <View style={styles.footer}>
          {/* TOMBOL LOG PROGRESS (DIKUNCI KALO ENDED) */}
          {isJoined && (
            <TouchableOpacity 
              style={[
                styles.actionBtn, 
                { backgroundColor: (isCompleted || isEnded) ? "#10B981" : themeColor },
                (isCompleted || isEnded) && { opacity: 0.8 }
              ]} 
              onPress={handleUpdateProgress}
              disabled={isCompleted || isEnded}
            >
              <Ionicons name={isCompleted ? "checkmark-circle" : isEnded ? "lock-closed" : "add-circle"} size={24} color="#FFF" />
              <Text style={styles.actionBtnText}>
                {isCompleted ? "Goal Reached!" : isEnded ? "Challenge Ended" : `Log ${challenge.unit}`}
              </Text>
            </TouchableOpacity>
          )}

          {/* TOMBOL JOIN (DIKUNCI KALO ENDED DAN BELUM GABUNG) */}
          <TouchableOpacity 
            style={[
                styles.joinBtn, 
                isJoined ? styles.leaveBtn : { backgroundColor: themeColor + '15' },
                (isEnded && !isJoined) && { opacity: 0.5 }
            ]} 
            onPress={handleJoin}
            disabled={isEnded && !isJoined}
          >
            <Text style={[styles.joinBtnText, { color: isJoined ? "#FF5A5A" : themeColor }]}>
              {isEnded && !isJoined 
                ? "Registration Closed" 
                : isJoined ? "Exit Challenge" : "Join the Challenge"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F9FB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 44, height: 44, backgroundColor: "#FFF", borderRadius: 14, justifyContent: "center", alignItems: "center", elevation: 2, shadowOpacity: 0.05 },
  deleteHeaderBtn: { width: 44, height: 44, backgroundColor: "#FFF", borderRadius: 14, justifyContent: "center", alignItems: "center", elevation: 2, shadowOpacity: 0.05 },
  headerTitle: { fontFamily: "InterBold", fontSize: 18, color: '#1E293B' },
  content: { padding: 20 },
  mainCard: { padding: 25, borderRadius: 32, marginBottom: 25, elevation: 12, shadowColor: "#3843FF", shadowOpacity: 0.2, shadowRadius: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 56, height: 56, backgroundColor: '#FFF', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { color: '#FFF', fontFamily: 'InterBold', fontSize: 12 },
  title: { color: "#FFF", fontSize: 24, fontFamily: "InterBold" },
  goalText: { color: "rgba(255,255,255,0.8)", marginTop: 5, fontSize: 15, fontFamily: 'InterMedium' },
  progressSection: { marginTop: 25 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  percentText: { color: "#FFF", fontSize: 14, fontFamily: 'InterBold' },
  scoreText: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: 'InterSemiBold' },
  progressBarLarge: { height: 10, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: "#FFF", borderRadius: 10 },
  section: { marginBottom: 25 },
  label: { fontFamily: "InterBold", color: "#94A3B8", fontSize: 11, letterSpacing: 1, marginBottom: 8 },
  desc: { fontSize: 15, color: "#475569", lineHeight: 22, fontFamily: 'InterMedium' },
  infoRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoValue: { color: '#64748B', fontFamily: 'InterSemiBold', fontSize: 14 },
  footer: { gap: 12, marginBottom: 30 },
  actionBtn: { flexDirection: 'row', padding: 18, borderRadius: 20, alignItems: "center", justifyContent: 'center', gap: 10, elevation: 4 },
  actionBtnText: { color: "#FFF", fontFamily: "InterBold", fontSize: 16 },
  joinBtn: { padding: 18, borderRadius: 20, alignItems: "center" },
  joinBtnText: { fontFamily: "InterBold", fontSize: 16 },
  leaveBtn: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: '#FECACA' },

  // IMPROVED MODAL STYLES
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20
  },
  modalContent: {
    alignItems: 'center',
  },
  warningIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD1D1'
  },
  modalTitleText: {
    fontFamily: 'InterBold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 12,
  },
  modalSubtitleText: {
    fontFamily: 'InterMedium',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnSecondaryText: {
    fontFamily: 'InterBold',
    color: '#64748B',
    fontSize: 15
  },
  btnDanger: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#FF4B4B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#FF4B4B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  btnDangerText: {
    fontFamily: 'InterBold',
    color: '#FFF',
    fontSize: 15
  },
  // ... (styles yang sudah ada)

  successModalContainer: {
    width: width * 0.78, // Diperkecil dari 0.85
    backgroundColor: '#FFF',
    borderRadius: 28, // Sedikit lebih tajam agar tidak terlalu bulky
    padding: 20, // Diperkecil dari 30
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20
  },
  successTitleText: {
    fontFamily: 'InterBold',
    fontSize: 19, // Diperkecil dari 24
    color: '#1E293B',
    marginTop: 12,
    textAlign: 'center'
  },
  successSubtitleText: {
    fontFamily: 'InterMedium',
    fontSize: 13, // Diperkecil dari 15
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18, // Line height disesuaikan
    marginTop: 6,
    marginBottom: 18
  },
  rewardCard: {
    backgroundColor: '#F8FAFC',
    width: '100%',
    padding: 12, // Diperkecil dari 20
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 20, // Margin dikurangi
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  rewardLabel: {
    fontFamily: 'InterBold',
    fontSize: 10, // Diperkecil dari 11
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 // Gap dikurangi
  },
  rewardPoints: {
    fontFamily: 'InterBold',
    fontSize: 18, // Diperkecil dari 22
    color: '#FF9800'
  },
  btnAction: {
    paddingVertical: 14, // Diperkecil dari 18 agar lebih slim
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#3843FF',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }
  },
  btnActionText: {
    color: '#FFF',
    fontFamily: 'InterBold',
    fontSize: 14 // Diperkecil dari 16
  }
});