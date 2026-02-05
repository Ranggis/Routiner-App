import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator, 
  Pressable 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function RatingModal({ visible, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (visible && auth.currentUser) {
      fetchUserRating();
      setIsSubmitted(false);
    }
  }, [visible]);

  const fetchUserRating = async () => {
    try {
      const docRef = doc(db, "ratings", auth.currentUser!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRating(docSnap.data().score);
        setIsUpdating(true);
      }
    } catch (error) {
      console.log("Error fetching rating:", error);
    }
  };

  const submitRating = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      await setDoc(doc(db, "ratings", user.uid), {
        userId: user.uid,
        userName: user.displayName || "Routiner User",
        score: rating,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setIsSubmitted(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {!isSubmitted ? (
            <>
              {/* Icon Header Lebih Kecil */}
              <View style={styles.headerIcon}>
                <Ionicons name="star" size={32} color="#FFD700" />
              </View>

              <Text style={styles.title}>
                {isUpdating ? "Update Rating" : "Rate Routiner"}
              </Text>
              <Text style={styles.subtitle}>
                How is your experience with our app so far?
              </Text>

              {/* Star Picker Compact */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity 
                    key={num} 
                    onPress={() => setRating(num)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={rating >= num ? "star" : "star-outline"} 
                      size={34} 
                      color={rating >= num ? "#FFD700" : "#E2E8F0"} 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Buttons */}
              <TouchableOpacity 
                style={[styles.btn, rating === 0 && styles.btnDisabled]} 
                onPress={submitRating}
                disabled={loading || rating === 0}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.btnText}>
                    {isUpdating ? "Update" : "Submit"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>Maybe Later</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* --- TAMPILAN SUKSES COMPACT --- */
            <View style={styles.successContainer}>
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={60} color="#4CD964" />
              </View>
              <Text style={styles.title}>Thank You!</Text>
              <Text style={styles.subtitle}>
                Your feedback helps us build a better Routiner!
              </Text>
              <TouchableOpacity style={styles.btn} onPress={onClose}>
                <Text style={styles.btnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: "rgba(15, 23, 42, 0.6)", 
    justifyContent: "center", 
    alignItems: "center", 
  },
  modalCard: { 
    backgroundColor: "#FFF", 
    width: "80%", // Dipersempit (sebelumnya 100% atau lebar penuh)
    maxWidth: 320,
    borderRadius: 28, 
    padding: 24, // Padding dikurangi
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8
  },
  headerIcon: {
    width: 64, // Lebih kecil (sebelumnya 90)
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF9E6",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: { 
    fontSize: 20, // Lebih kecil (sebelumnya 24)
    fontFamily: "InterBold", 
    color: "#1E293B",
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 13, // Lebih kecil (sebelumnya 15)
    color: "#64748B", 
    marginTop: 6, 
    marginBottom: 20, 
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "InterRegular"
  },
  starRow: { 
    flexDirection: "row", 
    gap: 8, // Gap dikurangi
    marginBottom: 24 
  },
  btn: { 
    backgroundColor: "#3843FF", 
    width: "100%", 
    paddingVertical: 14, // Lebih slim (sebelumnya 18)
    borderRadius: 14, 
    alignItems: "center",
    shadowColor: "#3843FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  btnDisabled: {
    backgroundColor: "#E2E8F0",
    shadowOpacity: 0,
    elevation: 0
  },
  btnText: { 
    color: "#FFF", 
    fontFamily: "InterBold", 
    fontSize: 15 
  },
  closeBtn: { 
    marginTop: 16 
  },
  closeText: { 
    color: "#94A3B8", 
    fontFamily: "InterSemiBold",
    fontSize: 13
  },
  successContainer: {
    alignItems: 'center',
    width: '100%'
  },
  successBadge: {
    marginBottom: 12
  }
});