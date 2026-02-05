import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../firebase/config";

const { width } = Dimensions.get("window");

export default function ChallengeLibrary() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Ambil data challenge, urutkan berdasarkan waktu dibuat terbaru
    const q = query(collection(db, "challenges"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setChallenges(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error loading challenges: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Logika Filter Pencarian
  const filteredChallenges = challenges.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* HEADER FIXED */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Challenges</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.container}>
        {/* SEARCH BAR */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput 
              placeholder="Search challenges..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#304FFE" />
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent, 
              { paddingBottom: insets.bottom + 20 }
            ]}
          >
            <View style={styles.statsRow}>
               <Text style={styles.countText}>{filteredChallenges.length} Challenge found</Text>
            </View>

            {filteredChallenges.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="trophy-variant-outline" size={80} color="#E2E8F0" />
                <Text style={styles.emptyTitle}>No Challenges Found</Text>
                <Text style={styles.emptySub}>Coba cari dengan kata kunci lain</Text>
              </View>
            ) : (
              filteredChallenges.map((item) => {
                const accentColor = item.color || "#304FFE";
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.listCard}
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: "/challenge/[id]", params: { id: item.id } })}
                  >
                    {/* Icon Box Dinamis */}
                    <View style={[styles.iconBox, { backgroundColor: accentColor + '15' }]}>
                      <MaterialCommunityIcons 
                        name={item.icon as any || "trophy-outline"} 
                        size={26} 
                        color={accentColor} 
                      />
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.cardSub}>{item.participants?.length || 0} participants</Text>
                        <View style={styles.dot} />
                        <Text style={styles.cardUnit}>{item.goal} {item.unit}</Text>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: "#FFF" 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: "#F8F9FB", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  headerTitle: { 
    fontFamily: "InterBold", 
    fontSize: 18, 
    color: "#111" 
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB" // Background abu-abu muda agar kartu putih terlihat pop
  },
  searchWrapper: {
    padding: 20,
    backgroundColor: "#FFF"
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 15,
    height: 52,
    borderRadius: 16,
    gap: 10
  },
  searchInput: {
    flex: 1,
    fontFamily: "InterMedium",
    fontSize: 15,
    color: "#111"
  },
  scrollContent: { 
    padding: 20 
  },
  statsRow: {
    marginBottom: 15,
    paddingLeft: 5
  },
  countText: {
    fontFamily: "InterBold",
    fontSize: 14,
    color: "#94A3B8"
  },
  listCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 14, 
    backgroundColor: "#FFF", 
    borderRadius: 22, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    // Shadow halus
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardInfo: { 
    flex: 1, 
    marginLeft: 15 
  },
  cardTitle: { 
    fontFamily: "InterBold", 
    fontSize: 16, 
    color: "#1E293B" 
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  cardSub: { 
    color: "#64748B", 
    fontSize: 13, 
    fontFamily: "InterMedium" 
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8
  },
  cardUnit: {
    color: "#304FFE",
    fontSize: 13,
    fontFamily: "InterBold"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontFamily: "InterBold",
    fontSize: 18,
    color: "#1E293B",
    marginTop: 20
  },
  emptySub: {
    fontFamily: "InterMedium",
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20
  }
});