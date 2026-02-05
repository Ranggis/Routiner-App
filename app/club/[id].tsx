import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView,
  Image,
  Dimensions,
  Platform 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { db, auth } from "../../firebase/config";
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  increment, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  documentId,
  limit
} from "firebase/firestore";

export default function ClubDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Mengambil padding safe area (notch & bottom bar)

  const [club, setClub] = useState<any>(null);
  const [memberPhotos, setMemberPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const isJoined = club?.members?.includes(user?.uid);
  const isOwner = club?.createdBy === user?.uid;

  // 1. Listen ke Data Club
  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, "clubs", id as string), (docSnap) => {
      if (docSnap.exists()) {
        setClub({ id: docSnap.id, ...docSnap.data() });
      } else {
        router.back();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  // 2. Ambil Foto Profil Member secara Real dari Firestore
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!club?.members || club.members.length === 0) {
        setMemberPhotos([]);
        return;
      }

      try {
        // Ambil maksimal 5 UID pertama dari array members club
        const memberUIDs = club.members.slice(0, 5);
        
        const usersRef = collection(db, "users");
        const q = query(usersRef, where(documentId(), "in", memberUIDs), limit(5));
        const querySnapshot = await getDocs(q);
        
        const photos: string[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().photoURL) photos.push(doc.data().photoURL);
        });
        
        setMemberPhotos(photos);
      } catch (error) {
        console.error("Error fetching members profiles:", error);
      }
    };

    if (club) fetchMemberData();
  }, [club?.members]);

  const handleJoinToggle = async () => {
    if (!user) return Alert.alert("Join Club", "Please login to join this community.");

    const clubRef = doc(db, "clubs", club.id);
    try {
      await updateDoc(clubRef, {
        members: isJoined ? arrayRemove(user.uid) : arrayUnion(user.uid),
        membersCount: isJoined ? increment(-1) : increment(1)
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClub = () => {
    Alert.alert("Delete Club", "Permanently delete this club?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "clubs", club.id));
          } catch (e) {
            Alert.alert("Error", "Failed to delete.");
          }
        } 
      }
    ]);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#3843FF" />
    </View>
  );

  if (!club) return null;

  return (
    <View style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* --- HERO SECTION --- */}
        <View style={[styles.heroSection, { backgroundColor: club.color || "#F0F2FF" }]}>
          {/* Header Nav menggunakan insets top untuk Safe Area */}
          <View style={[styles.headerNav, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#111" />
            </TouchableOpacity>
            
            {isOwner && (
              <TouchableOpacity style={[styles.circleBtn, styles.deleteBtn]} onPress={handleDeleteClub}>
                <Ionicons name="trash-outline" size={20} color="#FF5A5A" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.heroContent}>
            <View style={styles.mainIconWrapper}>
              <MaterialCommunityIcons 
                name={club.icon || "account-group"} 
                size={50} 
                color={club.iconColor || "#3843FF"} 
              />
            </View>
            <Text style={styles.clubTitle}>{club.title}</Text>
            
            <View style={styles.badgeRow}>
              <View style={styles.memberBadge}>
                <Ionicons name="people" size={14} color="#64748B" />
                <Text style={styles.badgeText}>{club.membersCount} Members</Text>
              </View>
              {isOwner && (
                <View style={[styles.memberBadge, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="star" size={14} color="#3843FF" />
                  <Text style={[styles.badgeText, { color: '#3843FF' }]}>Admin</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* --- BODY CONTENT --- */}
        <View style={styles.bodyCard}>
          <Text style={styles.sectionTitle}>About Community</Text>
          <Text style={styles.description}>
            {club.description || "No description provided for this community yet."}
          </Text>

          {/* ACTIVE MEMBERS DARI FIRESTORE */}
          {memberPhotos.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Active Members</Text>
              <View style={styles.memberPreviewRow}>
                <View style={styles.avatarStack}>
                  {memberPhotos.map((url, index) => (
                    <Image 
                      key={index}
                      source={{ uri: url }}
                      style={[styles.stackAvatar, { marginLeft: index === 0 ? 0 : -15 }]}
                    />
                  ))}
                  {club.membersCount > 5 && (
                    <View style={styles.moreAvatarCircle}>
                      <Text style={styles.moreAvatarText}>+{club.membersCount - 5}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberJoinText}>Recently active</Text>
              </View>
            </>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#2D9D53" />
            <Text style={styles.infoBoxText}>Verified Community</Text>
          </View>

          <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      {/* --- STICKY FOOTER --- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={[styles.primaryActionBtn, isJoined && styles.secondaryActionBtn]} 
          onPress={handleJoinToggle}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryActionText, isJoined && styles.secondaryActionText]}>
            {isJoined ? "Leave Community" : "Join Community"}
          </Text>
          {!isJoined && <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroSection: {
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: { backgroundColor: '#FFF5F5' },
  heroContent: { alignItems: 'center', paddingHorizontal: 30, marginTop: 10 },
  mainIconWrapper: {
    width: 100, height: 100, borderRadius: 35, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15,
  },
  clubTitle: { fontFamily: "InterBold", fontSize: 28, color: "#1E293B", textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6,
  },
  badgeText: { fontFamily: 'InterSemiBold', fontSize: 13, color: '#64748B' },
  bodyCard: { marginTop: -20, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  sectionTitle: { fontFamily: "InterBold", fontSize: 18, color: "#1E293B", marginBottom: 12 },
  description: { fontFamily: "InterRegular", fontSize: 15, color: "#475569", lineHeight: 24 },
  memberPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: '#FFF' },
  moreAvatarCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', marginLeft: -15, borderWidth: 3, borderColor: '#FFF',
  },
  moreAvatarText: { fontSize: 12, fontFamily: 'InterBold', color: '#64748B' },
  memberJoinText: { fontFamily: 'InterMedium', fontSize: 13, color: '#94A3B8' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4',
    padding: 16, borderRadius: 20, marginTop: 30, gap: 10,
  },
  infoBoxText: { fontFamily: 'InterSemiBold', fontSize: 14, color: '#166534' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 25, backgroundColor: 'rgba(255,255,255,0.95)',
  },
  primaryActionBtn: {
    backgroundColor: "#3843FF", height: 60, borderRadius: 22,
    flexDirection: 'row', justifyContent: "center", alignItems: "center",
    elevation: 8, shadowColor: "#3843FF", shadowOpacity: 0.3, shadowRadius: 15,
  },
  primaryActionText: { color: "#FFF", fontFamily: "InterBold", fontSize: 16 },
  secondaryActionBtn: { backgroundColor: "#F1F5F9", elevation: 0, shadowOpacity: 0 },
  secondaryActionText: { color: "#64748B" }
});