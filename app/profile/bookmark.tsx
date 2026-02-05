import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// FIREBASE
import { db, auth } from "../../firebase/config";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";

export default function BookmarkScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  // 1. LISTEN DATA BOOKMARK SECARA REAL-TIME
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "bookmarks"),
      orderBy("savedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookmarks(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookmarks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. FUNGSI HAPUS BOOKMARK DARI DAFTAR
  const removeBookmark = async (articleId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "bookmarks", articleId));
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  // 3. RENDER ITEM ARTIKEL
  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: "/explore-article", // Sesuaikan path detail artikel kamu
        params: { data: JSON.stringify(item) }
      })}
    >
      <Image 
        source={{ uri: item.urlToImage || 'https://via.placeholder.com/150' }} 
        style={styles.cardImage} 
      />
      <View style={styles.cardContent}>
        <Text style={styles.sourceText}>{item.source?.name || "News"}</Text>
        <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>Saved recently</Text>
          <TouchableOpacity 
            style={styles.removeBtn} 
            onPress={() => removeBookmark(item.id)}
          >
            <Ionicons name="bookmark" size={20} color="#3843FF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookmarks</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3843FF" />
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons name="bookmark-outline" size={60} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
              <Text style={styles.emptyDesc}>Articles you save will appear here for quick access later.</Text>
              <TouchableOpacity 
                style={styles.exploreBtn}
                onPress={() => router.push("/explore/view-all" as any)}
              >
                <Text style={styles.exploreBtnText}>Explore Articles</Text>
              </TouchableOpacity>
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
  
  // Header
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#FFF'
  },
  backBtn: { 
    width: 44, height: 44, borderRadius: 12, 
    backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" 
  },
  headerTitle: { fontFamily: "InterBold", fontSize: 20, color: "#1E293B" },

  // List & Card
  listPadding: { padding: 20, paddingBottom: 50 },
  card: { 
    backgroundColor: "#FFF", 
    borderRadius: 24, 
    marginBottom: 20, 
    flexDirection: 'row', 
    padding: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  cardImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 18, 
    backgroundColor: '#F1F5F9' 
  },
  cardContent: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  sourceText: { 
    fontFamily: 'InterBold', 
    fontSize: 11, 
    color: '#3843FF', 
    textTransform: 'uppercase', 
    marginBottom: 4 
  },
  titleText: { 
    fontFamily: 'InterSemiBold', 
    fontSize: 15, 
    color: '#1E293B', 
    lineHeight: 20 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10 
  },
  dateText: { fontSize: 12, color: '#94A3B8', fontFamily: 'InterMedium' },
  removeBtn: { padding: 5 },

  // Empty State
  emptyContainer: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyIconCircle: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 25,
    elevation: 2 
  },
  emptyTitle: { fontFamily: "InterBold", color: "#475569", fontSize: 20 },
  emptyDesc: { 
    fontFamily: "InterMedium", 
    color: "#94A3B8", 
    textAlign: 'center', 
    marginTop: 10, 
    lineHeight: 22 
  },
  exploreBtn: { 
    marginTop: 25, 
    backgroundColor: '#3843FF', 
    paddingHorizontal: 25, 
    paddingVertical: 12, 
    borderRadius: 15 
  },
  exploreBtnText: { color: '#FFF', fontFamily: 'InterBold', fontSize: 14 }
});