import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  Pressable 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; 

// FIREBASE
import { db, auth } from "../../firebase/config"; 
import { doc, onSnapshot, setDoc, collection, query, where } from "firebase/firestore";

interface Props {
  onCalendarPress?: () => void;
  onNotificationPress?: () => void;
}

const EMOJI_OPTIONS = ["👋", "🔥", "✨", "🎯", "🚀", "💪", "🧘", "🌿", "⭐", "🌈", "😎", "⚡️", "🏆", "🎨", "🍕", "🔋"];

export default function HomeHeader({
  onCalendarPress,
  onNotificationPress,
}: Props) {
  const router = useRouter();
  const [userData, setUserData] = useState({
    displayName: "User",
    emoji: "👋"
  });
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Listen Profile
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData({
          displayName: data.displayName || "User",
          emoji: data.emoji || "👋"
        });
      }
    });

    // Listen Notifikasi Unread
    const q = query(
      collection(db, "users", user.uid, "notifications"), 
      where("isRead", "==", false)
    );

    const unsubNotif = onSnapshot(q, (snap) => {
      setUnreadNotifications(snap.size);
    });

    return () => {
      unsubProfile();
      unsubNotif();
    };
  }, [user]);

  const handleUpdateEmoji = async (newEmoji: string) => {
    if (!user) return;
    setShowEmojiModal(false);
    setUserData(prev => ({ ...prev, emoji: newEmoji }));
    
    try {
      // --- UBAH DI SINI ---
      // Gunakan setDoc + merge: true
      await setDoc(doc(db, "users", user.uid), { 
        emoji: newEmoji 
      }, { merge: true });
    } catch (error) {
      console.error("Gagal update emoji:", error);
    }
  };

  // --- PERBAIKAN ROUTE ---
  const goToCalendar = () => {
    if (onCalendarPress) {
      onCalendarPress();
    } else {
      // Sesuai struktur: app/calendar.tsx -> "/calendar"
      router.push("/calendar"); 
    }
  };

  const goToNotifications = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      // Sesuai struktur: app/notifications.tsx -> "/notifications"
      router.push("/notifications"); 
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        {/* CALENDAR */}
        <TouchableOpacity style={styles.iconBox} onPress={goToCalendar}>
          <Ionicons name="calendar-outline" size={22} color="#111" />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {/* NOTIFICATIONS */}
        <TouchableOpacity style={styles.iconBox} onPress={goToNotifications}>
          <Ionicons name="notifications-outline" size={22} color="#111" />
          {unreadNotifications > 0 && (
            <View style={styles.redDot}>
               <Text style={styles.notifText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greet}>Hi, {userData.displayName} {userData.emoji}</Text>
          <Text style={styles.subtitle}>Let’s make habits together!</Text>
        </View>

        <TouchableOpacity 
          style={styles.emojiBubble} 
          onPress={() => setShowEmojiModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{userData.emoji}</Text>
          <View style={styles.editBadge}>
            <Ionicons name="add" size={10} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* MODAL EMOJI PICKER */}
      <Modal visible={showEmojiModal} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowEmojiModal(false)}>
          <Pressable style={styles.emojiCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Choose your status</Text>
            <FlatList
              data={EMOJI_OPTIONS}
              numColumns={4}
              keyExtractor={(item) => item}
              columnWrapperStyle={styles.columnWrapper}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.emojiItem, userData.emoji === item && styles.selectedEmojiItem]} 
                  onPress={() => handleUpdateEmoji(item)}
                >
                  <Text style={{ fontSize: 32 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginTop: 6 },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  iconBox: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", elevation: 3,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  redDot: {
    position: "absolute", top: -2, right: -2, 
    minWidth: 18, height: 18, backgroundColor: "#FF5A5A", 
    borderRadius: 9, borderWidth: 2, borderColor: "#FFFFFF",
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2
  },
  notifText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  bottomRow: { flexDirection: "row", alignItems: "center" },
  greet: { fontFamily: "InterBold", fontSize: 22, color: "#111", marginBottom: 2 },
  subtitle: { fontFamily: "InterRegular", fontSize: 14, color: "#6B7280", marginTop: -2 },
  emojiBubble: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: "#EAF2FF", 
    justifyContent: "center", alignItems: "center", marginLeft: 10,
    borderWidth: 1.5, borderColor: "#D0E2FF"
  },
  emoji: { fontSize: 26 },
  editBadge: {
    position: 'absolute', bottom: -5, right: -5, backgroundColor: '#3843FF',
    width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF'
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  emojiCard: { width: '100%', backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40, elevation: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#EEE', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  modalTitle: { fontFamily: 'InterBold', fontSize: 18, marginBottom: 20, textAlign: 'center', color: '#333' },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 10 },
  emojiItem: { width: 70, height: 70, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFF', borderRadius: 20 },
  selectedEmojiItem: { backgroundColor: '#EAF2FF', borderWidth: 2, borderColor: '#3843FF' }
});