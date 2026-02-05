import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Dimensions 
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// --- IMPORT GESTURE HANDLER ---
import { GestureHandlerRootView } from "react-native-gesture-handler"; 

// FIREBASE
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import HabitCard from "../../components/home/HabitCard"; 

const { width } = Dimensions.get("window");

export default function AllHabitsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Ambil SEMUA habit, urutkan berdasarkan nama secara alfabetis
    const q = query(collection(db, "users", user.uid, "habits"), orderBy("name", "asc"));
    
    const unsub = onSnapshot(q, (snap) => {
      setHabits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching habits:", error);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  // Logika Filter Pencarian
  const filteredHabits = habits.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // 1. WAJIB dibungkus GestureHandlerRootView agar fitur Swipe di HabitCard jalan
    // 2. WAJIB pakai style={{ flex: 1 }} agar layar tidak blank putih
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        
        {/* HEADER FIXED */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All My Habits</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.container}>
          {/* SEARCH BAR */}
          <View style={styles.searchWrapper}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#94A3B8" />
              <TextInput 
                placeholder="Search your habits..."
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
              {/* STATS ROW */}
              <View style={styles.statsRow}>
                 <Text style={styles.countText}>{filteredHabits.length} Habits found</Text>
              </View>

              {filteredHabits.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#E2E8F0" />
                  <Text style={styles.emptyTitle}>No Habits Found</Text>
                  <Text style={styles.emptySub}>
                    {searchQuery ? "Try searching with another name" : "Start creating your first habit!"}
                  </Text>
                </View>
              ) : (
                filteredHabits.map((item) => (
                  <HabitCard
                    key={item.id}
                    id={item.id}
                    label={item.name}
                    progress={item.unit}
                    icon={item.icon}
                    iconColor={item.iconColor}
                    cardColor={item.color || item.cardColor}
                    currentProgress={item.currentProgress}
                    target={item.target}
                  />
                ))
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: "#F8F9FB", 
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  headerTitle: { 
    fontFamily: "InterBold", 
    fontSize: 18, 
    color: "#111" 
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB" 
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