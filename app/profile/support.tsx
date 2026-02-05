import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  Modal,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SupportCenter() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk Custom Modal FAQ
  const [selectedFaq, setSelectedFaq] = useState<{ question: string; answer: string; icon: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const faqs = [
    { 
      question: "How to create a custom habit?", 
      icon: "add-circle-outline", 
      answer: "Go to Home, tap the '+' button, select 'New Good Habit', and choose 'Create Custom Habit'. You can set your own targets and reminders there." 
    },
    { 
      question: "Can I sync data across devices?", 
      icon: "sync-outline", 
      answer: "Yes! Simply log in with the same account on your other devices. Your data is securely stored and synced in real-time via Cloud." 
    },
    { 
      question: "How does the point system work?", 
      icon: "medal-outline", 
      answer: "You earn points for every habit you complete. Consistent streaks give you bonus points to climb the leaderboard!" 
    },
    { 
      question: "How to reset my password?", 
      icon: "key-outline", 
      answer: "On the login screen, tap 'Forgot Password'. We will send a secure link to your registered email to set a new one." 
    },
    { 
      question: "Managing notifications", 
      icon: "notifications-outline", 
      answer: "Go to Settings > Notifications. You can customize which habits send you reminders and at what time." 
    },
  ];

  // Logic Search: Menyaring list FAQ
  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContact = async (type: "whatsapp" | "email" | "instagram") => {
    let url = "";
    
    if (type === "whatsapp") {
      const message = "Hello Support! I need help with my Routiner app.";
      url = `https://wa.me/6289520736931?text=${encodeURIComponent(message)}`;
      
    } else if (type === "email") {
      const subject = "Support Request - Routiner App";
      const body = "Hello Team,\n\nI'm having an issue with...";
      url = `mailto:mochammad.ranggis_ti23@nusaputra.ac.id?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
    } else if (type === "instagram") {
      url = "https://instagram.com/ranggiss";
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported || type === "whatsapp" || type === "instagram") {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Could not open the app. Make sure it's installed on your device.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const openFaq = (item: typeof faqs[0]) => {
    setSelectedFaq(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Center</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <View style={styles.searchWrapper}>
            <Feather name="search" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Search help topics..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* CONTACT CARDS */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('whatsapp')}>
            <View style={[styles.contactIconBg, { backgroundColor: '#E8F9EE' }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#2D9D53" />
            </View>
            <Text style={styles.contactLabel}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('email')}>
            <View style={[styles.contactIconBg, { backgroundColor: '#EEF2FF' }]}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#3843FF" />
            </View>
            <Text style={styles.contactLabel}>Email Us</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('instagram')}>
            <View style={[styles.contactIconBg, { backgroundColor: '#FFF0F5' }]}>
              <Ionicons name="logo-instagram" size={22} color="#E1306C" />
            </View>
            <Text style={styles.contactLabel}>Instagram</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked</Text>
          <View style={styles.faqList}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.faqItem, index === filteredFaqs.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => openFaq(item)}
                >
                  <View style={styles.faqInfo}>
                    <View style={styles.faqIconSmall}>
                      <Ionicons name={item.icon as any} size={18} color="#3843FF" />
                    </View>
                    <Text style={styles.faqText} numberOfLines={1}>{item.question}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noResult}>No topics found.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* --- CUSTOM FAQ MODAL --- */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.dismissArea} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
                <View style={styles.modalIconCircle}>
                    <Ionicons name={selectedFaq?.icon as any} size={30} color="#3843FF" />
                </View>
                <Text style={styles.modalQuestion}>{selectedFaq?.question}</Text>
            </View>
            <View style={styles.answerBox}>
                <Text style={styles.modalAnswer}>{selectedFaq?.answer}</Text>
            </View>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModalBtnText}>Got it, thanks!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center",
    ...Platform.select({ ios: { shadowColor: "#1E293B", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } }),
  },
  headerTitle: { fontSize: 20, fontFamily: "InterBold", color: "#1E293B" },
  heroSection: { paddingHorizontal: 25, paddingVertical: 20 },
  heroTitle: { fontSize: 24, fontFamily: "InterBold", color: "#1E293B", marginBottom: 20 },
  searchWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 15, height: 54, borderRadius: 18, borderWidth: 1, borderColor: "#F1F5F9" },
  searchInput: { flex: 1, marginLeft: 12, fontFamily: "InterMedium", fontSize: 15, color: "#1E293B" },
  contactRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 25 },
  contactCard: { backgroundColor: "#FFF", width: "31%", paddingVertical: 18, borderRadius: 24, alignItems: "center", borderWidth: 1, borderColor: "#F1F5F9", elevation: 2 },
  contactIconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  contactLabel: { fontSize: 11, fontFamily: "InterBold", color: "#64748B" },
  sectionContainer: { marginTop: 30, paddingHorizontal: 25 },
  sectionTitle: { fontSize: 18, fontFamily: "InterBold", color: "#1E293B", marginBottom: 15 },
  faqList: { backgroundColor: "#FFF", borderRadius: 24, paddingHorizontal: 15, borderWidth: 1, borderColor: "#F1F5F9" },
  faqItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  faqInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  faqIconSmall: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#F0F2FF", justifyContent: 'center', alignItems: 'center' },
  faqText: { fontSize: 14, fontFamily: "InterMedium", color: "#475569", marginLeft: 12, paddingRight: 10 },
  noResult: { textAlign: 'center', padding: 20, color: '#94A3B8', fontFamily: 'InterMedium' },

  /* MODAL STYLES */
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "flex-end" },
  dismissArea: { flex: 1 },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, paddingBottom: 40, minHeight: SCREEN_HEIGHT * 0.38 },
  modalIndicator: { width: 40, height: 5, backgroundColor: "#E2E8F0", borderRadius: 10, alignSelf: "center", marginBottom: 20 },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalIconCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#F0F2FF", justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalQuestion: { fontSize: 19, fontFamily: "InterBold", color: "#1E293B", textAlign: 'center', paddingHorizontal: 10 },
  answerBox: { backgroundColor: "#F8FAFC", padding: 20, borderRadius: 20, marginBottom: 25 },
  modalAnswer: { fontSize: 15, fontFamily: "InterRegular", color: "#64748B", lineHeight: 22, textAlign: 'center' },
  closeModalBtn: { backgroundColor: "#3843FF", paddingVertical: 16, borderRadius: 16, alignItems: "center", shadowColor: "#3843FF", shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  closeModalBtnText: { color: "#FFF", fontFamily: "InterBold", fontSize: 16 },
});