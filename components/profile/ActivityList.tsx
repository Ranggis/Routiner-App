import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import ActivityItem from "./ActivityItem";
import { Ionicons } from "@expo/vector-icons";

// FIREBASE IMPORTS
import { db, auth } from "../../firebase/config";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";

export default function ActivityList() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Ambil data dari sub-koleksi 'history' milik user
    // Urutkan berdasarkan waktu selesai terbaru
    const q = query(
      collection(db, "users", user.uid, "history"),
      orderBy("completedAt", "desc"),
      limit(15) // Ambil 15 aktivitas terakhir
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // 2. Transformasi data Firestore ke format yang dibutuhkan ActivityItem
        return {
          id: doc.id,
          text: data.type === "challenge" 
            ? `Challenge "${data.habitName}" completed!` 
            : `${data.pointsEarned} points earned from ${data.habitName}!`,
          time: formatActivityTime(data.completedAt),
          // Logika menentukan Icon/Tipe: medal untuk challenge, up untuk habit
          type: data.type === "challenge" ? "medal" : "up" 
        };
      });

      setActivities(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching activity list:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // HELPER: Format Timestamp ke waktu yang cantik
  const formatActivityTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    const now = new Date();
    
    // Jika hari ini
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Jika kemarin
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Tanggal lainnya
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <ActivityIndicator color="#3843FF" style={{ marginTop: 30 }} />;
  }

  return (
    <View style={styles.wrapper}>
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {activities.length > 0 ? "Recent activities" : "No recent activity"}
        </Text>

        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="options-outline" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      {/* LIST ITEMS DINAMIS DARI DATABASE */}
      {activities.length > 0 ? (
        activities.map((item) => (
          <ActivityItem 
            key={item.id} 
            text={item.text} 
            time={item.time} 
            type={item.type} 
          />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Selesaikan habit pertamamu untuk melihat riwayat di sini!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontFamily: "InterSemiBold",
    fontSize: 14,
    color: "#111",
  },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    marginTop: 10
  },
  emptyText: {
    fontFamily: 'InterMedium',
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20
  }
});