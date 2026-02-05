import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "../../firebase/config"; // sesuaikan path
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function ClubsContent() {
  const router = useRouter();
  const [joinedClubs, setJoinedClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // QUERY: Ambil club yang di dalam array 'members'-nya ada UID user ini
    const q = query(
      collection(db, "clubs"),
      where("members", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJoinedClubs(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your Clubs</Text>
        {/* Tombol Buat Club Baru */}
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => router.push("/add-club")}
        >
          <Ionicons name="add-circle" size={24} color="#3843FF" />
          <Text style={styles.addBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3843FF" style={{ marginTop: 30 }} />
      ) : joinedClubs.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="account-group-outline" size={50} color="#CBD5E1" />
          <Text style={styles.emptyText}>You haven't joined any clubs yet.</Text>
          <TouchableOpacity 
             style={styles.findBtn}
             onPress={() => router.push("/club-library")}
          >
            <Text style={styles.findBtnText}>Explore Clubs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        joinedClubs.map((club) => (
          <TouchableOpacity 
            key={club.id} 
            style={styles.card}
            onPress={() => router.push({ pathname: "/club/[id]", params: { id: club.id } })}
          >
            <View style={[styles.iconBox, { backgroundColor: club.color || "#F0F2FF" }]}>
              <MaterialCommunityIcons name={club.icon || "account-group"} size={26} color="#3843FF" />
            </View>
            <View style={styles.info}>
              <Text style={styles.cardTitle}>{club.title}</Text>
              <Text style={styles.desc}>{club.membersCount || 0} Members • Joined</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingHorizontal: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontFamily: "InterBold", fontSize: 20, color: "#111" },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontFamily: 'InterBold', color: '#3843FF', fontSize: 14 },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  cardTitle: { fontFamily: "InterBold", fontSize: 16, color: '#1E293B' },
  desc: { fontFamily: "InterRegular", fontSize: 13, color: "#64748B", marginTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: 40, backgroundColor: '#FFF', padding: 30, borderRadius: 32, borderWidth: 1, borderColor: '#F1F5F9' },
  emptyText: { fontFamily: 'InterMedium', color: '#94A3B8', marginTop: 10, textAlign: 'center' },
  findBtn: { marginTop: 20, backgroundColor: '#F0F2FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  findBtnText: { color: '#3843FF', fontFamily: 'InterBold', fontSize: 14 }
});