import React, { useEffect, useState, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  Pressable,
  Dimensions,
  Platform,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// FIREBASE
import { db, auth } from "../firebase/config";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  writeBatch,
  deleteDoc,
  getDocs
} from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [showClearModal, setShowClearModal] = useState(false);
  const user = auth.currentUser;

  // 1. LISTEN TO FIREBASE DATA (Real-time)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // 2. MARK ALL AS READ
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    const unreadDocs = notifications.filter(n => !n.isRead);
    if (unreadDocs.length === 0) return;

    try {
      const batch = writeBatch(db);
      unreadDocs.forEach(n => {
        const ref = doc(db, "users", user.uid, "notifications", n.id);
        batch.update(ref, { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Failed to update read status:", error);
    }
  };

  // 3. DELETE SINGLE NOTIFICATION
  const deleteNotification = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid, "notifications", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Failed to delete document:", error);
      Alert.alert("Error", "Could not delete notification.");
    }
  };

  // 4. CLEAR ALL NOTIFICATIONS
  const handleClearAll = async () => {
    if (!user) return;
    setIsDeleting(true);
    
    try {
      const batch = writeBatch(db);
      const colRef = collection(db, "users", user.uid, "notifications");
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        setShowClearModal(false);
        setIsDeleting(false);
        return;
      }

      snapshot.forEach((document) => {
        batch.delete(document.ref);
      });

      await batch.commit();
      setShowClearModal(false);
    } catch (error) {
      console.error("Failed to clear all:", error);
      Alert.alert("Error", "An error occurred while clearing all data.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 5. RELATIVE TIME FORMATTING
  const formatTime = (createdAt: any) => {
    if (!createdAt) return "Just now";
    try {
      const date = createdAt.toDate();
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch (e) { return "Recent"; }
  };

  const renderItem = ({ item }: any) => {
    const isStreak = item.type === 'streak';
    const isChallenge = item.type === 'challenge';

    return (
      <View style={[styles.cardContainer, !item.isRead && styles.unreadGlow]}>
        <Pressable 
          style={({ pressed }) => [
            styles.card, 
            !item.isRead && styles.unreadCard,
            pressed && { opacity: 0.8 }
          ]}
          onPress={async () => {
            if (!item.isRead) {
              await updateDoc(doc(db, "users", user!.uid, "notifications", item.id), { isRead: true });
            }
          }}
        >
          <View style={[
            styles.iconCircle, 
            { backgroundColor: isStreak ? '#FFF4E5' : isChallenge ? '#E1F9F0' : '#EAF2FF' }
          ]}>
            <MaterialCommunityIcons 
              name={isStreak ? "fire" : isChallenge ? "trophy" : "bell-ring-outline"} 
              size={24} 
              color={isStreak ? "#FF9800" : isChallenge ? "#10B981" : "#3843FF"} 
            />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          </View>

          <TouchableOpacity 
            style={styles.deleteBtnIndiv} 
            onPress={() => deleteNotification(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {!item.isRead && <View style={styles.activeDot} />}
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* --- CLEAR ALL MODAL --- */}
      <Modal visible={showClearModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBg}>
              <Ionicons name="alert-circle" size={34} color="#FF5A5A" />
            </View>
            <Text style={styles.modalTitle}>Clear All?</Text>
            <Text style={styles.modalDesc}>
              This action cannot be undone. All your notification history will be deleted forever.
            </Text>
            
            {isDeleting ? (
              <ActivityIndicator color="#FF5A5A" style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.modalBtnRow}>
                <TouchableOpacity 
                  style={styles.modalCancelBtn} 
                  onPress={() => setShowClearModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalDeleteBtn} 
                  onPress={handleClearAll}
                >
                  <Text style={styles.modalDeleteText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.roundBackBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.titleText}>Notifications</Text>
            <Text style={styles.subtitleText}>
                {notifications.filter(n => !n.isRead).length} new messages
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={markAllAsRead} style={styles.actionIconBtn}>
            <MaterialCommunityIcons name="check-all" size={22} color="#3843FF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowClearModal(true)} style={styles.actionIconBtn}>
            <Ionicons name="trash-outline" size={22} color="#FF5A5A" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3843FF" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons name="bell-sleep" size={60} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>Nothing Here</Text>
              <Text style={styles.emptyDesc}>No notifications yet. We'll let you know when something happens!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", 
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#FFF",
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9", elevation: 2
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  roundBackBtn: { 
    width: 44, height: 44, borderRadius: 15, 
    justifyContent: "center", alignItems: "center", 
    backgroundColor: "#F1F5F9", marginRight: 15 
  },
  titleText: { fontFamily: "InterBold", fontSize: 22, color: "#1E293B" },
  subtitleText: { fontFamily: "InterMedium", fontSize: 13, color: "#94A3B8", marginTop: -2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  actionIconBtn: { 
    width: 44, height: 44, borderRadius: 15, 
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  listPadding: { padding: 20, paddingBottom: 100 },
  cardContainer: { marginBottom: 15 },
  card: { 
    flexDirection: "row", backgroundColor: "#FFF", 
    padding: 16, borderRadius: 24, alignItems: "center",
    borderWidth: 1, borderColor: '#F1F5F9', elevation: 2
  },
  unreadCard: { backgroundColor: "#F4F7FF", borderColor: "#D0E2FF" },
  unreadGlow: { shadowColor: '#3843FF', shadowOpacity: 0.15 },
  iconCircle: { width: 52, height: 52, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  textContainer: { flex: 1, marginLeft: 15, marginRight: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontFamily: "InterBold", fontSize: 15, color: "#1E293B", flex: 1, marginRight: 10 },
  notifTime: { fontSize: 11, color: "#94A3B8", fontFamily: 'InterMedium' },
  notifBody: { fontFamily: "InterRegular", fontSize: 13, color: "#64748B", lineHeight: 18 },
  deleteBtnIndiv: { padding: 8 },
  activeDot: { 
    width: 10, height: 10, borderRadius: 5, 
    backgroundColor: "#3843FF", position: 'absolute', 
    top: -2, right: -2, borderWidth: 2, borderColor: '#FFF' 
  },
  emptyContainer: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 25, elevation: 4 },
  emptyTitle: { fontFamily: "InterBold", color: "#475569", fontSize: 20 },
  emptyDesc: { fontFamily: "InterMedium", color: "#94A3B8", textAlign: "center", marginTop: 10, lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: '#FFF', borderRadius: 32, padding: 25, alignItems: 'center' },
  modalIconBg: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'InterBold', fontSize: 20, color: '#1E293B', textAlign: 'center' },
  modalDesc: { fontFamily: 'InterMedium', fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  modalBtnRow: { flexDirection: 'row', marginTop: 25, gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center' },
  modalCancelText: { fontFamily: 'InterBold', color: '#64748B', fontSize: 15 },
  modalDeleteBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, backgroundColor: '#FF5A5A', alignItems: 'center' },
  modalDeleteText: { fontFamily: 'InterBold', color: '#FFF', fontSize: 15 },
});