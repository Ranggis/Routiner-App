import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  TextInput,
  Dimensions,
  Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// FIREBASE IMPORTS
import { db, auth } from "../../firebase/config";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  getDocs, 
  where, 
  documentId,
  setDoc,
  serverTimestamp 
} from "firebase/firestore";

const { width } = Dimensions.get("window");

// 1. DEFINISIKAN INTERFACE DATA USER
interface Friend {
  id: string;
  displayName?: string;
  photoURL?: string;
  totalPoints?: number;
}

export default function FriendsList() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]); // Menggunakan interface Friend
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // State untuk Modal Tambah Teman
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);

  const user = auth.currentUser;

  // 2. LISTEN KE DAFTAR TEMAN (REAL-TIME)
  useEffect(() => {
    if (!user) return;

    const friendsRef = collection(db, "users", user.uid, "friends");
    const unsubscribe = onSnapshot(friendsRef, async (snapshot) => {
      const friendIds = snapshot.docs.map(doc => doc.id);

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      try {
        const usersRef = collection(db, "users");
        // Firestore 'in' query maksimal 30 ID sekaligus
        const q = query(usersRef, where(documentId(), "in", friendIds.slice(0, 30)));
        const userSnaps = await getDocs(q);
        
        const friendData = userSnaps.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Friend[]; // CASTING KE INTERFACE FRIEND

        // Sorting berdasarkan poin tertinggi (FIX: totalPoints sekarang dikenali)
        setFriends(friendData.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)));
      } catch (error) {
        console.error("Error fetching friend profiles:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 3. FUNGSI CARI USER LAIN (Exact Match)
  const handleSearchUser = async () => {
    if (searchName.trim().length < 3) {
      return Alert.alert("Wait", "Ketik minimal 3 huruf untuk mencari.");
    }

    setSearchLoading(true);
    try {
      const q = query(
        collection(db, "users"), 
        where("displayName", "==", searchName.trim()) 
      );
      
      const querySnapshot = await getDocs(q);
      const results: Friend[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user?.uid) {
          results.push({ id: doc.id, ...doc.data() } as Friend);
        }
      });
      
      setSearchResults(results);
      if (results.length === 0) Alert.alert("Not Found", "User tidak ditemukan. Pastikan huruf besar-kecilnya tepat.");
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  // 4. FUNGSI TAMBAH TEMAN
  const handleAddFriend = async (targetUser: Friend) => {
    try {
      await setDoc(doc(db, "users", user!.uid, "friends", targetUser.id), {
        addedAt: serverTimestamp()
      });
      
      Alert.alert("Success!", `${targetUser.displayName} sekarang jadi temanmu.`);
      setIsAddModalVisible(false);
      setSearchName("");
      setSearchResults([]);
    } catch (e) {
      console.error(e);
    }
  };

  // 5. FUNGSI HAPUS TEMAN
  const handleDeleteFriend = (friendId: string, friendName: string) => {
    Alert.alert("Remove Friend", `Hapus ${friendName} dari daftar teman?`, [
      { text: "Cancel" },
      { 
        text: "Remove", 
        style: "destructive", 
        onPress: async () => {
          await deleteDoc(doc(db, "users", user!.uid, "friends", friendId));
        } 
      }
    ]);
  };

  if (loading) return <ActivityIndicator color="#3843FF" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.topRow}>
        <Text style={styles.title}>{friends.length} Friends</Text>
        <View style={styles.rightButtons}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={22} color="#3843FF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, isEditMode && { backgroundColor: "#3843FF" }]} 
            onPress={() => setIsEditMode(!isEditMode)}
          >
            <Ionicons name="pencil" size={18} color={isEditMode ? "#FFF" : "#111"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST TEMAN */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {friends.length > 0 ? (
          friends.map((f) => (
            <View key={f.id} style={styles.card}>
              <Image 
                source={{ uri: f.photoURL || "https://via.placeholder.com/150" }} 
                style={styles.avatar} 
              />
              <View style={styles.info}>
                <Text style={styles.name}>{f.displayName || "User"}</Text>
                <Text style={styles.points}>{f.totalPoints || 0} Points</Text>
              </View>

              {isEditMode && (
                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleDeleteFriend(f.id, f.displayName || "User")}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF5A5A" />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={50} color="#CBD5E1" />
            <Text style={styles.emptyText}>Belum ada teman.</Text>
          </View>
        )}
      </ScrollView>

      {/* MODAL CARI TEMAN */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Find Friends</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <TextInput 
                placeholder="Type exact display name..."
                style={styles.input}
                value={searchName}
                onChangeText={setSearchName}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.searchIconBtn} onPress={handleSearchUser}>
                {searchLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="search" size={20} color="#FFF" />}
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {searchResults.map((res) => (
                <View key={res.id} style={styles.resultItem}>
                  <Image 
                    source={{ uri: res.photoURL || "https://via.placeholder.com/150" }} 
                    style={styles.resAvatar} 
                  />
                  <Text style={styles.resName}>{res.displayName}</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => handleAddFriend(res)}>
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginTop: 10, flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontFamily: "InterBold", fontSize: 16, color: "#1E293B" },
  rightButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionBtn: { width: 40, height: 40, backgroundColor: "#FFF", borderRadius: 12, justifyContent: "center", alignItems: "center", elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", padding: 14, borderRadius: 24, marginBottom: 12, elevation: 1, borderWidth: 1, borderColor: '#F1F5F9' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F1F5F9' },
  info: { marginLeft: 14, flex: 1 },
  name: { fontFamily: "InterBold", fontSize: 15, color: "#1E293B" },
  points: { fontFamily: "InterMedium", fontSize: 12, color: "#94A3B8" },
  deleteBtn: { backgroundColor: "#FEE2E2", width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontFamily: 'InterMedium', color: '#94A3B8', marginTop: 10 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: 'InterBold' },
  searchBar: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 15, height: 50, fontFamily: 'InterMedium' },
  searchIconBtn: { backgroundColor: '#3843FF', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  resultItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 15 },
  resAvatar: { width: 40, height: 40, borderRadius: 20 },
  resName: { flex: 1, marginLeft: 12, fontFamily: 'InterSemiBold' },
  addBtn: { backgroundColor: '#3843FF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#FFF', fontFamily: 'InterBold', fontSize: 12 }
});