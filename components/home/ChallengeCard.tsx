import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase/config";
import { collection, query, where, getDocs, documentId, limit } from "firebase/firestore";

interface Props {
  id: string; // ID Challenge dari Firestore
  title: string;
  endDate: any; // Bisa berupa string ISO atau Firestore Timestamp
  progressPercent: number;
  participantIds: string[]; // Kita terima array UID user
  onPress: () => void;
}

export default function ChallengeCard({ 
  id,
  title, 
  endDate, 
  progressPercent, 
  participantIds = [], 
  onPress 
}: Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // --- 1. LOGIKA AMBIL FOTO USER DARI FIREBASE ---
  useEffect(() => {
    const fetchParticipantPhotos = async () => {
      if (!participantIds || participantIds.length === 0) return;
      
      setLoadingPhotos(true);
      try {
        // Kita hanya ambil maksimal 3 foto untuk ditampilkan di stack
        const firstThreeIds = participantIds.slice(0, 3);
        const usersRef = collection(db, "users");
        
        // Query untuk mengambil data user yang UID-nya ada di list peserta
        const q = query(usersRef, where(documentId(), "in", firstThreeIds));
        const querySnapshot = await getDocs(q);
        
        const fetchedPhotos: string[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().photoURL) {
            fetchedPhotos.push(doc.data().photoURL);
          }
        });
        setPhotos(fetchedPhotos);
      } catch (error) {
        console.error("Error fetching participant photos:", error);
      } finally {
        setLoadingPhotos(false);
      }
    };

    fetchParticipantPhotos();
  }, [participantIds]);

  // --- 2. LOGIKA HITUNG SISA WAKTU ---
  const calculateTimeLeft = () => {
    try {
      if (!endDate) return "No deadline";
      
      // Jika endDate adalah Firestore Timestamp, ubah ke JS Date
      const end = endDate.seconds ? new Date(endDate.seconds * 1000) : new Date(endDate);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      
      if (diffTime <= 0) return "Ended";

      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (diffDays > 0) return `${diffDays}d ${diffHours}h left`;
      return `${diffHours}h left`;
    } catch (e) {
      return "Active";
    }
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{title || "Untitled Challenge"}</Text>
          <Text style={styles.time}>{calculateTimeLeft()}</Text>
        </View>

        {/* User icons dinamis dari Firestore */}
        <View style={styles.avatars}>
          {loadingPhotos ? (
            <ActivityIndicator size="small" color="#3843FF" />
          ) : (
            <>
              {photos.map((url, index) => (
                <Image 
                  key={index} 
                  source={{ uri: url }} 
                  style={[styles.avatar, { marginLeft: index === 0 ? 0 : -12 }]} 
                />
              ))}
              {participantIds.length > photos.length && (
                <View style={styles.moreBadge}>
                  <Text style={styles.moreText}>
                    +{participantIds.length - photos.length}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressWrapper}>
        <View style={[styles.progress, { width: `${Math.min(progressPercent || 0, 100)}%` }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: "#FFFFFF", 
    padding: 18, 
    borderRadius: 24, 
    marginBottom: 14, 
    marginRight: 15, 
    width: 280, 
    elevation: 4, 
    shadowColor: "#000", 
    shadowOpacity: 0.08, 
    shadowRadius: 12, 
    shadowOffset: { width: 0, height: 4 } 
  },
  row: { flexDirection: "row", alignItems: "center" },
  title: { fontFamily: "InterBold", fontSize: 16, color: "#1E293B" },
  time: { fontFamily: "InterMedium", fontSize: 12, color: "#64748B", marginTop: 4 },
  avatars: { flexDirection: "row", alignItems: "center" },
  avatar: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    borderWidth: 2, 
    borderColor: '#FFF', 
    backgroundColor: '#F1F5F9' 
  },
  moreBadge: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    backgroundColor: '#F8F9FB', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: -12, 
    borderWidth: 2, 
    borderColor: '#FFF' 
  },
  moreText: { fontSize: 10, fontFamily: 'InterBold', color: '#3843FF' },
  progressWrapper: { 
    backgroundColor: "#F1F5F9", 
    height: 8, 
    borderRadius: 4, 
    marginTop: 18, 
    overflow: "hidden" 
  },
  progress: { 
    height: "100%", 
    backgroundColor: "#3843FF", 
    borderRadius: 4 
  },
});