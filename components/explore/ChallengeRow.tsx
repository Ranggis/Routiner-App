import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "../../firebase/config";
import { collection, query, onSnapshot, limit } from "firebase/firestore";

// Tambahkan Interface Props untuk menerima searchQuery
interface ChallengeRowProps {
  searchQuery?: string;
}

export default function ChallengeRow({ searchQuery = "" }: ChallengeRowProps) {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil data challenges dari Firestore
    const q = query(collection(db, "challenges"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChallenges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter challenges berdasarkan searchQuery
  const filteredChallenges = challenges.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper hitung sisa waktu
  const getTimeLeft = (endDate: string) => {
    try {
      const total = Date.parse(endDate) - Date.now();
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      if (days > 0) return `${days} days left`;
      if (days === 0) return "Ends today";
      return "Ended";
    } catch (e) {
      return "Active";
    }
  };

  // Jika sedang loading
  if (loading) return <ActivityIndicator size="small" color="#3843FF" style={{ marginTop: 20 }} />;

  // Jika sedang mencari dan tidak ada hasil, sembunyikan baris ini
  if (searchQuery !== "" && filteredChallenges.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Challenges</Text>
        <TouchableOpacity onPress={() => router.push("/challenge-library" as any)}>
          <Text style={styles.viewAll}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredChallenges.map((item) => {
          // Ambil warna tema dari database, jika tidak ada pakai biru default
          const cardColor = item.color || "#304FFE";
          
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, { backgroundColor: cardColor }]}
              onPress={() => router.push({
                pathname: "/challenge/[id]",
                params: { id: item.id }
              })}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name={item.icon || "trophy-outline"} size={22} color="#FFF" />
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unit}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardTime}>{getTimeLeft(item.endDate)}</Text>

              {/* Progress Bar (Gunakan 0% untuk awal) */}
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: '10%' }]} /> 
              </View>

              <View style={styles.footer}>
                <Ionicons name="people" size={14} color="#FFF" />
                <Text style={styles.joined}>{item.participants?.length || 0} Joined</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 22 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    marginBottom: 12 
  },
  title: { fontFamily: "InterBold", fontSize: 18, color: "#111" },
  viewAll: { fontFamily: "InterBold", fontSize: 13, color: "#3843FF" },
  scrollContent: { paddingLeft: 20, paddingRight: 10 },
  
  card: { 
    width: 200, 
    padding: 16, 
    borderRadius: 24, 
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 10, fontFamily: 'InterBold' },
  
  cardTitle: { color: "#FFF", fontFamily: "InterBold", fontSize: 16, marginBottom: 4 },
  cardTime: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 12, fontFamily: 'InterMedium' },
  
  progressBar: { backgroundColor: "rgba(255,255,255,0.25)", height: 6, borderRadius: 6, overflow: "hidden", marginBottom: 12 },
  progress: { height: 6, backgroundColor: "#FFF" },
  
  footer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  joined: { color: "#FFF", fontSize: 11, fontFamily: 'InterBold' },
});