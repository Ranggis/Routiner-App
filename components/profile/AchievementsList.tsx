import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AchievementItem from "./AchievementItem";
import { db, auth } from "../../firebase/config";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";

export default function AchievementList() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // PERBAIKAN: Tambahkan filter where agar hanya "challenge" yang masuk daftar Achievement
    // Jika habit harian biasa mau dimasukkan juga, hapus baris 'where' di bawah
    const q = query(
      collection(db, "users", user.uid, "history"),
      where("type", "==", "challenge"), 
      orderBy("completedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAchievements(list);
      setLoading(false);
    }, (error) => {
      console.error("Error achievements:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper waktu: Mengubah Firebase Timestamp menjadi format tanggal cantik
  const getTimeLabel = (timestamp: any) => {
    if (!timestamp) return "Baru saja";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (e) {
      return "Baru saja";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#3843FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeText}>{achievements.length}</Text>
        </View>
      </View>

      {achievements.length > 0 ? (
        achievements.map((item) => (
          <AchievementItem 
            key={item.id} 
            title={item.habitName} 
            iconName={item.icon} // Dikirim sebagai iconName sesuai AchievementItem baru
            color={item.color}    // Mengirim warna hex dari database
            time={getTimeLabel(item.completedAt)} 
          />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Belum ada tantangan yang diselesaikan. Semangat! 🚀</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 20, 
    marginTop: 20 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8
  },
  headerTitle: { 
    fontFamily: "InterBold", 
    fontSize: 18, 
    color: "#1E293B" 
  },
  badgeCount: {
    backgroundColor: '#3843FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'InterBold'
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center'
  },
  emptyBox: {
    padding: 20,
    backgroundColor: '#F8F9FB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center'
  },
  emptyText: {
    fontFamily: "InterMedium",
    fontSize: 14,
    color: "#94A3B8",
    textAlign: 'center',
    lineHeight: 20
  }
});