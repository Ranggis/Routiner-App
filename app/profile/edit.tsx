import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Dimensions
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

// FIREBASE
import { db, auth } from "../../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dpfnzxood/image/upload";
const UPLOAD_PRESET = "Routine";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  // States
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("https://via.placeholder.com/150");
  const [email, setEmail] = useState("");

  // --- CUSTOM ALERT STATE ---
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'success' as 'success' | 'error' | 'info',
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      onConfirm: onConfirm || (() => setAlertConfig(prev => ({ ...prev, visible: false }))),
    });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  // 1. AMBIL DATA AWAL USER
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || "");
          setPhotoURL(data.photoURL || "https://via.placeholder.com/150");
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserData();
  }, [user]);

  // 2. FUNGSI UPLOAD KE CLOUDINARY
  const uploadToCloudinary = async (imageUri: string) => {
    try {
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
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Error:", error);
      return null;
    }
  };

  // 3. FUNGSI PILIH GAMBAR
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('error', 'Permission Denied', 'We need access to your gallery to change your photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  // 4. FUNGSI SIMPAN PERUBAHAN
  const handleSaveChanges = async () => {
    if (!displayName.trim()) {
      showAlert('error', 'Empty Name', 'Please enter your name before saving.');
      return;
    }

    try {
      setLoading(true);
      let finalPhotoUrl = photoURL;

      if (photoURL.startsWith("file://") || photoURL.startsWith("content://")) {
        const uploadedUrl = await uploadToCloudinary(photoURL);
        if (uploadedUrl) finalPhotoUrl = uploadedUrl;
      }

      await updateDoc(doc(db, "users", user!.uid), {
        displayName: displayName,
        photoURL: finalPhotoUrl
      });

      setLoading(false);
      showAlert('success', 'Profile Updated! 🎉', 'Your profile changes have been saved successfully.', () => {
        closeAlert();
        router.back();
      });
    } catch (error) {
      setLoading(false);
      showAlert('error', 'Update Failed', 'Something went wrong while saving your profile.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* AVATAR SECTION */}
          <View style={styles.avatarContainer}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: photoURL }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Tap to change profile picture</Text>
          </View>

          {/* FORM SECTION */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your Name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { opacity: 0.6 }]}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={email}
                  editable={false} 
                />
                <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" />
              </View>
              <Text style={styles.helperText}>Email cannot be changed here.</Text>
            </View>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSaveChanges}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Save Changes</Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- PREMIUM GLOBAL MODAL (ALERT REPLACEMENT) --- */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* ICON DINAMIS */}
            <View style={[
                styles.modalIconCircle, 
                alertConfig.type === 'success' && { backgroundColor: '#E1F9F0' },
                alertConfig.type === 'error' && { backgroundColor: '#FFF0F0' },
                alertConfig.type === 'info' && { backgroundColor: '#EEF2FF' }
            ]}>
              <MaterialCommunityIcons 
                name={
                    alertConfig.type === 'success' ? "check-decagram" : 
                    alertConfig.type === 'error' ? "alert-octagon-outline" : "information-variant"
                } 
                size={45} 
                color={
                    alertConfig.type === 'success' ? "#10B981" : 
                    alertConfig.type === 'error' ? "#FF4B4B" : "#3843FF"
                } 
              />
            </View>
            
            <Text style={styles.modalTitle}>{alertConfig.title}</Text>
            <Text style={styles.modalDesc}>{alertConfig.message}</Text>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[
                    styles.confirmModalBtn, 
                    alertConfig.type === 'success' && { backgroundColor: '#10B981' },
                    alertConfig.type === 'error' && { backgroundColor: '#FF4B4B' }
                ]} 
                onPress={alertConfig.onConfirm}
              >
                <Text style={styles.confirmModalText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { 
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", 
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: "InterBold", fontSize: 20, color: "#1E293B" },
  
  scrollContent: { paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginTop: 30 },
  imageWrapper: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E2E8F0', borderWidth: 4, borderColor: '#FFF' },
  cameraIcon: { 
    position: 'absolute', bottom: 5, right: 5, 
    backgroundColor: '#3843FF', width: 36, height: 36, 
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFF'
  },
  changePhotoText: { marginTop: 12, fontFamily: 'InterMedium', color: '#64748B', fontSize: 14 },

  form: { paddingHorizontal: 25, marginTop: 40 },
  inputGroup: { marginBottom: 25 },
  label: { fontFamily: 'InterBold', fontSize: 14, color: '#475569', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#FFF', borderRadius: 16, 
    paddingHorizontal: 15, height: 60,
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontFamily: 'InterSemiBold', fontSize: 16, color: '#1E293B' },
  helperText: { fontSize: 12, color: '#94A3B8', marginTop: 6, marginLeft: 4 },

  saveBtn: { 
    backgroundColor: '#3843FF', marginHorizontal: 25, 
    height: 60, borderRadius: 20, marginTop: 20,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#3843FF', shadowOpacity: 0.2, shadowRadius: 10
  },
  saveBtnText: { color: '#FFF', fontFamily: 'InterBold', fontSize: 16 },

  // --- MODAL PREMIUM STYLES ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
    width: width * 0.85, backgroundColor: '#FFF', borderRadius: 35, 
    padding: 30, alignItems: 'center',
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20
  },
  modalIconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#EEF2FF' },
  modalTitle: { fontFamily: 'InterBold', fontSize: 22, color: '#1E293B', textAlign: 'center' },
  modalDesc: { fontFamily: 'InterMedium', fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  modalFooter: { width: '100%', marginTop: 30 },
  confirmModalBtn: { 
    width: '100%', paddingVertical: 16, borderRadius: 18, backgroundColor: '#3843FF', alignItems: 'center',
    shadowColor: '#3843FF', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }
  },
  confirmModalText: { fontFamily: 'InterBold', color: '#FFF', fontSize: 16 },
});