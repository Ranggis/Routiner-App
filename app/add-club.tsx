import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { db, auth } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function AddClub() {
  const router = useRouter();
  
  // STATE
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("account-group");
  const [selectedColor, setSelectedColor] = useState("#3843FF");
  const [selectedBg, setSelectedBg] = useState("#F0F2FF");
  const [loading, setLoading] = useState(false);

  // CONFIG PILIHAN ICON
  const icons = [
    "account-group", "run", "swim", "book-open-variant", 
    "leaf", "meditation", "dumbbell", "cup-water", 
    "heart", "bike", "basketball", "pencil"
  ];

  // CONFIG PILIHAN WARNA (Theme: IconColor & BackgroundColor)
  const colors = [
    { id: 1, main: "#3843FF", bg: "#F0F2FF" }, // Blue
    { id: 2, main: "#FF5A3F", bg: "#FFF4F1" }, // Orange/Red
    { id: 3, main: "#2D9D53", bg: "#E8F9EE" }, // Green
    { id: 4, main: "#A855F7", bg: "#FDF0FF" }, // Purple
    { id: 5, main: "#CA8A04", bg: "#FEF9C3" }, // Yellow
    { id: 6, main: "#0EA5E9", bg: "#F0F9FF" }, // Sky Blue
  ];

  const handleCreate = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Error", "Login required");
    if (!title.trim() || !desc.trim()) return Alert.alert("Wait", "Please fill all fields");

    setLoading(true);
    try {
      await addDoc(collection(db, "clubs"), {
        title: title.trim(),
        description: desc.trim(),
        members: [user.uid], 
        membersCount: 1,
        icon: selectedIcon,
        color: selectedBg, // Background card
        iconColor: selectedColor, // Warna icon
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      
      Alert.alert("Success", "Your club has been created! 🎉");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Design Your Club</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* LIVE PREVIEW CARD */}
          <Text style={styles.label}>PREVIEW</Text>
          <View style={[styles.previewCard, { backgroundColor: selectedBg }]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name={selectedIcon as any} size={32} color={selectedColor} />
            </View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {title || "Club Name..."}
              </Text>
              <Text style={styles.previewSub}>1 Member • Active Now</Text>
            </View>
          </View>

          {/* INPUTS */}
          <Text style={styles.label}>CLUB NAME</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Early Birds Runner"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#94A3B8"
          />

          <Text style={[styles.label, { marginTop: 20 }]}>DESCRIPTION</Text>
          <TextInput 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
            placeholder="What is this club about?"
            multiline
            value={desc}
            onChangeText={setDesc}
            placeholderTextColor="#94A3B8"
          />

          {/* ICON PICKER */}
          <Text style={[styles.label, { marginTop: 25 }]}>CHOOSE ICON</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
            {icons.map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[
                  styles.iconOption, 
                  selectedIcon === item && { borderColor: selectedColor, backgroundColor: selectedBg }
                ]}
                onPress={() => setSelectedIcon(item)}
              >
                <MaterialCommunityIcons 
                  name={item as any} 
                  size={24} 
                  color={selectedIcon === item ? selectedColor : "#94A3B8"} 
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* COLOR PICKER */}
          <Text style={[styles.label, { marginTop: 25 }]}>THEME COLOR</Text>
          <View style={styles.colorRow}>
            {colors.map((color) => (
              <TouchableOpacity 
                key={color.id} 
                style={[
                  styles.colorOption, 
                  { backgroundColor: color.main },
                  selectedColor === color.main && styles.colorActive
                ]}
                onPress={() => {
                  setSelectedColor(color.main);
                  setSelectedBg(color.bg);
                }}
              />
            ))}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: selectedColor }]} 
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.submitText}>Create Club</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 10 
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: '#F8F9FB', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  headerTitle: { fontFamily: 'InterBold', fontSize: 18, color: '#111' },
  scrollContent: { padding: 25 },
  label: { 
    fontSize: 11, 
    fontFamily: 'InterBold', 
    color: '#94A3B8', 
    marginBottom: 10, 
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  // PREVIEW CARD
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)'
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  previewTitle: { fontFamily: 'InterBold', fontSize: 18, color: '#1E293B' },
  previewSub: { fontFamily: 'InterMedium', fontSize: 13, color: '#64748B', marginTop: 2 },
  
  // INPUTS
  input: { 
    backgroundColor: '#F8F9FB', 
    borderRadius: 18, 
    padding: 16, 
    fontSize: 16, 
    fontFamily: 'InterMedium', 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    color: '#111'
  },
  
  // PICKERS
  pickerRow: { flexDirection: 'row', marginBottom: 5 },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  colorRow: { flexDirection: 'row', gap: 15, marginBottom: 10 },
  colorOption: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  colorActive: {
    borderColor: '#F1F5F9',
    transform: [{ scale: 1.2 }]
  },

  // SUBMIT
  submitBtn: { 
    flexDirection: 'row',
    padding: 20, 
    borderRadius: 22, 
    marginTop: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  submitText: { color: '#FFF', fontFamily: 'InterBold', fontSize: 16 }
});