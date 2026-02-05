import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

// FIREBASE
import { db, auth } from "../../firebase/config";
import { doc, onSnapshot, updateDoc, collection, query } from "firebase/firestore";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dpfnzxood/image/upload";
const UPLOAD_PRESET = "Routine";

export default function ProfileHeader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Modals
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  
  // State Data User
  const [userData, setUserData] = useState({
    displayName: "Loading...",
    photoURL: "https://via.placeholder.com/150",
  });
  
  // State Poin (Dihitung dari History)
  const [totalPoints, setTotalPoints] = useState(0);
  
  const [tempName, setTempName] = useState("");
  const user = auth.currentUser;

  // 1. LISTEN DATA PROFIL (Nama & Foto)
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData({
          displayName: data.displayName || "User",
          photoURL: data.photoURL || "https://via.placeholder.com/150",
        });
        setTempName(data.displayName || "User");
      }
    });
    return () => unsub();
  }, [user]);

  // 2. LOGIKA DIAMBIL DARI ACTIVITY (Menghitung Poin dari Koleksi History)
  useEffect(() => {
    if (!user) return;

    // Ambil referensi ke koleksi history user
    const qHistory = query(collection(db, "users", user.uid, "history"));
    
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      // Menjumlahkan poin dari semua dokumen history (sama seperti di ActivityScreen)
      const calculatedPoints = snap.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (Number(data.pointsEarned) || 0);
      }, 0);
      
      setTotalPoints(calculatedPoints);
    }, (err) => console.log("Error Fetch Points in Profile:", err));

    return () => unsubHistory();
  }, [user]);

  const handleUpdateName = async () => {
    if (!tempName.trim()) return;
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", user!.uid), { displayName: tempName });
      setShowNameModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (imageUri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      // @ts-ignore
      formData.append("file", { uri: imageUri, type: "image/jpeg", name: "profile.jpg" });
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.json();
      if (data.secure_url) {
        await updateDoc(doc(db, "users", user!.uid), { photoURL: data.secure_url });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setShowPhotoModal(false);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = useCamera 
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });

    if (!result.canceled) {
      uploadToCloudinary(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.header}>
      {/* LOADING OVERLAY */}
      {loading && (
        <Modal transparent visible={loading}>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#3843FF" />
              <Text style={styles.loadingText}>Updating...</Text>
            </View>
          </View>
        </Modal>
      )}

      {/* HEADER TOP */}
      <View style={styles.topRow}>
        <Text style={styles.title}>Your Profile</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/profile/settings")}>
          <Ionicons name="settings-outline" size={22} color="#444" />
        </TouchableOpacity>
      </View>

      {/* PROFILE INFO */}
      <View style={styles.profileRow}>
        <TouchableOpacity onPress={() => setShowPhotoModal(true)}>
          <View>
            <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
            <View style={styles.editPhotoBadge}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ marginLeft: 16, flex: 1 }}>
          <TouchableOpacity style={styles.nameRow} onPress={() => setShowNameModal(true)}>
            <Text style={styles.name}>{userData.displayName}</Text>
            <Ionicons name="pencil" size={14} color="#999" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={styles.pointsBadge}>
            <Ionicons name="medal" size={14} color="#FFB800" />
            {/* Menggunakan state totalPoints yang sudah dihitung */}
            <Text style={styles.points}>{totalPoints.toLocaleString()} Points</Text>
          </View>
        </View>
      </View>

      {/* MODAL PILIH FOTO (ACTION SHEET) */}
      <Modal visible={showPhotoModal} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowPhotoModal(false)}>
          <View style={styles.actionSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Profile Photo</Text>
            <TouchableOpacity style={styles.sheetOption} onPress={() => pickImage(true)}>
              <Ionicons name="camera-outline" size={24} color="#333" />
              <Text style={styles.sheetOptionText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={() => pickImage(false)}>
              <Ionicons name="image-outline" size={24} color="#333" />
              <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sheetOption, { borderBottomWidth: 0 }]} onPress={() => setShowPhotoModal(false)}>
              <Text style={[styles.sheetOptionText, { color: 'red', marginLeft: 0, textAlign: 'center', flex: 1 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* MODAL EDIT NAMA */}
      <Modal visible={showNameModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowNameModal(false)}>
            <Pressable style={styles.nameEditCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Edit Name</Text>
              <TextInput 
                style={styles.modalInput}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNameModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateName}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700", color: "#111" },
  iconBtn: { 
    width: 42, height: 42, backgroundColor: "#FFF", borderRadius: 12, 
    justifyContent: "center", alignItems: "center", elevation: 3,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  profileRow: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  avatar: { width: 75, height: 75, borderRadius: 38, backgroundColor: '#EEE' },
  editPhotoBadge: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: '#3843FF', width: 26, height: 26, 
    borderRadius: 13, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF'
  },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 20, fontWeight: "700", color: "#111" },
  pointsBadge: { 
    flexDirection: "row", backgroundColor: "#FFF4F1", 
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, 
    marginTop: 6, alignItems: "center", alignSelf: 'flex-start' 
  },
  points: { marginLeft: 5, fontSize: 13, color: "#FF9800", fontWeight: "600" },

  // MODAL STYLES
  modalBackdrop: { 
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end', alignItems: 'center' 
  },
  actionSheet: { 
    width: '100%', backgroundColor: '#FFF', 
    borderTopLeftRadius: 25, borderTopRightRadius: 25, 
    padding: 20, paddingBottom: 40 
  },
  sheetHandle: { 
    width: 40, height: 5, backgroundColor: '#DDD', 
    borderRadius: 3, alignSelf: 'center', marginBottom: 15 
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  sheetOption: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#EEE' 
  },
  sheetOptionText: { marginLeft: 15, fontSize: 16, fontWeight: '500', color: '#333' },

  nameEditCard: { 
    width: '90%', backgroundColor: '#FFF', borderRadius: 20, 
    padding: 25, marginBottom: 'auto', marginTop: 'auto',
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  modalInput: { 
    backgroundColor: '#F5F6FA', padding: 15, 
    borderRadius: 12, fontSize: 16, marginBottom: 20 
  },
  modalButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#999', fontWeight: '600' },
  saveBtn: { 
    flex: 2, backgroundColor: '#3843FF', 
    padding: 15, borderRadius: 12, alignItems: 'center' 
  },
  saveBtnText: { color: '#FFF', fontWeight: '700' },

  // LOADING OVERLAY
  loadingOverlay: { 
    flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  loadingCard: { 
    padding: 30, backgroundColor: '#FFF', 
    borderRadius: 20, alignItems: 'center', elevation: 10 
  },
  loadingText: { marginTop: 10, fontWeight: '600', color: '#3843FF' }
});