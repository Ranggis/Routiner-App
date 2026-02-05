import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "../../firebase/config";
import { collection, query, onSnapshot, limit } from "firebase/firestore";

// Tambahkan interface untuk menerima searchQuery dari parent
interface ClubsRowProps {
  searchQuery?: string;
}

export default function ClubsRow({ searchQuery = "" }: ClubsRowProps) {
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil 5 club terbaru dari Firestore
    const q = query(collection(db, "clubs"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clubList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClubs(clubList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- LOGIKA FILTER BERDASARKAN SEARCH QUERY ---
  const filteredClubs = clubs.filter((club) =>
    club.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <ActivityIndicator size="small" color="#3843FF" style={{ marginTop: 20 }} />;

  // Jika sedang mencari dan tidak ada hasil, sembunyikan baris ini
  if (searchQuery !== "" && filteredClubs.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.rowHeader}>
        <Text style={styles.title}>Habit Clubs</Text>
        <TouchableOpacity onPress={() => router.push("/club-library" as any)}>
          <Text style={styles.viewAll}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* Gunakan filteredClubs sebagai sumber data */}
        {filteredClubs.map((item) => {
          const isJoined = item.members?.includes(auth.currentUser?.uid);
          
          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => router.push({ pathname: "/club/[id]", params: { id: item.id } })}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.color || "#F0F2FF" }]}>
                <MaterialCommunityIcons name={item.icon || "account-group"} size={24} color="#3843FF" />
              </View>
              <Text style={styles.clubTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.members}>{item.membersCount || 0} members</Text>
              
              {isJoined && (
                <View style={styles.joinedBadge}>
                  <Text style={styles.joinedText}>Joined</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 20, marginTop: 20 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontFamily: "InterBold", fontSize: 18, color: "#111" },
  viewAll: { fontFamily: "InterBold", fontSize: 13, color: "#3843FF" },
  card: { width: 140, padding: 16, borderRadius: 24, marginRight: 12, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#F1F5F9" },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  clubTitle: { fontFamily: "InterBold", fontSize: 15, color: "#111" },
  members: { marginTop: 2, color: "#64748B", fontSize: 12, fontFamily: "InterMedium" },
  joinedBadge: { marginTop: 8, backgroundColor: "#E0F2E9", paddingVertical: 4, borderRadius: 8, alignItems: "center" },
  joinedText: { color: "#2D9D53", fontSize: 10, fontFamily: "InterBold" }
});