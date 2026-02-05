import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Platform
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"; 
import { db } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ClubLibrary() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const q = query(collection(db, "clubs"), orderBy("title", "asc"));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setClubs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredClubs = clubs.filter((club) =>
    club.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Clubs</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* SEARCH BAR SECTION */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Search communities..."
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

      {/* CONTENT AREA */}
      <View style={styles.contentWrapper}>
        {loading ? (
          <ActivityIndicator size="large" color="#3843FF" style={{ marginTop: 50 }} />
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent, 
              { paddingBottom: insets.bottom + 20 } 
            ]}
          >
            {/* --- FITUR COMMUNITY FOUND --- */}
            <View style={styles.foundContainer}>
              <Text style={styles.foundText}>
                {filteredClubs.length} Communities found
              </Text>
            </View>

            {filteredClubs.length > 0 ? (
              filteredClubs.map((club) => (
                <TouchableOpacity 
                  key={club.id} 
                  style={styles.libCard}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: "/club/[id]", params: { id: club.id } })}
                >
                  <View style={[styles.iconBox, { backgroundColor: club.color || '#F0F2FF' }]}>
                    <MaterialCommunityIcons name={club.icon as any || 'account-group'} size={24} color="#3843FF" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.libTitle}>{club.title}</Text>
                    <Text style={styles.libSub}>{club.membersCount || 0} members</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={50} color="#E2E8F0" />
                <Text style={styles.emptyText}>No clubs found.</Text>
              </View>
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
    backgroundColor: "#FFF",
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
    fontSize: 20,
    color: "#111"
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
    paddingHorizontal: 15,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "InterMedium",
    fontSize: 15,
    color: "#111",
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: "#F8F9FB", 
  },
  scrollContent: { 
    padding: 20,
  },
  // Style baru untuk Community Found
  foundContainer: {
    marginBottom: 15,
    paddingLeft: 5,
  },
  foundText: {
    fontFamily: "InterBold",
    fontSize: 14,
    color: "#94A3B8", // Warna abu-abu Slate yang estetik
  },
  libCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#FFF", 
    padding: 16, 
    borderRadius: 22, 
    marginBottom: 12, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  libTitle: { 
    fontFamily: "InterBold", 
    fontSize: 16, 
    color: "#1E293B" 
  },
  libSub: { 
    fontFamily: "InterMedium", 
    fontSize: 13, 
    color: "#64748B", 
    marginTop: 2 
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    fontFamily: "InterMedium",
    color: "#94A3B8",
    marginTop: 10,
    fontSize: 15
  }
});