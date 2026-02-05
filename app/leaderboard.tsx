import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// FIREBASE
import { db, auth } from "../firebase/config";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function LeaderboardScreen() {
  const router = useRouter();
  const [rawUsers, setRawUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Weekly");

  const currentUser = auth.currentUser;

  // 1. FETCH DATA USER (Ambil 50 user teratas untuk diolah di lokal)
  useEffect(() => {
    setLoading(true);
    
    // Kita ambil berdasarkan totalPoints sebagai basis utama
    const q = query(
      collection(db, "users"),
      orderBy("totalPoints", "desc"), 
      limit(50) 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRawUsers(data);
      setLoading(false);
    }, (error) => {
      console.error("Leaderboard Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. PERHITUNGAN & SORTING LOKAL (Ini bagian "Perhitungan Sendiri")
  const sortedUsers = useMemo(() => {
    let field = "totalPoints";
    if (activeTab === "Daily") field = "dailyPoints";
    if (activeTab === "Weekly") field = "weeklyPoints";

    return [...rawUsers].sort((a, b) => {
      const pointsA = a[field] || 0;
      const pointsB = b[field] || 0;
      return pointsB - pointsA; // Urutkan dari yang terbesar
    });
  }, [rawUsers, activeTab]);

  // 3. PEMBAGIAN PERINGKAT
  const { first, second, third, otherUsers, myRank } = useMemo(() => {
    const rankIndex = sortedUsers.findIndex(u => u.id === currentUser?.uid);
    return {
      first: sortedUsers[0] || null,
      second: sortedUsers[1] || null,
      third: sortedUsers[2] || null,
      otherUsers: sortedUsers.slice(3, 20), // Tampilkan sampai rank 20
      myRank: rankIndex !== -1 ? { rank: rankIndex + 1, ...sortedUsers[rankIndex] } : null
    };
  }, [sortedUsers, currentUser]);

  // 4. HELPER TAMPILAN POIN
  const renderPoints = (user: any) => {
    if (!user) return "0";
    const val = activeTab === "Daily" ? user.dailyPoints : 
                activeTab === "Weekly" ? user.weeklyPoints : 
                user.totalPoints;
    return (val || 0).toLocaleString();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.titleText}>Leaderboard</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* TAB SWITCH */}
      <View style={styles.switchRow}>
        {["Daily", "Weekly", "Monthly"].map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.switchActive : styles.switchInactive}
          >
            <Text style={activeTab === tab ? styles.switchActiveText : styles.switchInactiveText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#3843FF" />
          </View>
        ) : (
          <>
            {/* PODIUM AREA */}
            <LinearGradient colors={["#3843FF", "#5B64FF"]} style={styles.topArea}>
              <View style={styles.top3Container}>
                {/* RANK 2 */}
                <View style={[styles.topItem, { marginTop: 40 }]}>
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: second?.photoURL || "https://via.placeholder.com/150" }} style={styles.avatarSmall} />
                    <View style={[styles.badge, { backgroundColor: "#C0C0C0" }]}><Text style={styles.badgeText}>2</Text></View>
                  </View>
                  <Text style={styles.nameSmall} numberOfLines={1}>{second?.displayName || "---"}</Text>
                  <View style={[styles.pillar, styles.pillarSilver]}>
                    <Text style={styles.pointsPodium}>{renderPoints(second)}</Text>
                    <Text style={styles.labelPodium}>pts</Text>
                  </View>
                </View>

                {/* RANK 1 */}
                <View style={styles.topItem}>
                  <MaterialCommunityIcons name="crown" size={32} color="#FFD700" style={{ marginBottom: 2 }} />
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: first?.photoURL || "https://via.placeholder.com/150" }} style={styles.avatarLarge} />
                    <View style={[styles.badgeLarge, { backgroundColor: "#FFD700" }]}><Text style={styles.badgeText}>1</Text></View>
                  </View>
                  <Text style={styles.nameLarge} numberOfLines={1}>{first?.displayName || "---"}</Text>
                  <View style={[styles.pillar, styles.pillarGold]}>
                    <Text style={styles.pointsPodiumLarge}>{renderPoints(first)}</Text>
                    <Text style={styles.labelPodiumLarge}>pts</Text>
                  </View>
                </View>

                {/* RANK 3 */}
                <View style={[styles.topItem, { marginTop: 60 }]}>
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: third?.photoURL || "https://via.placeholder.com/150" }} style={styles.avatarSmall} />
                    <View style={[styles.badge, { backgroundColor: "#CD7F32" }]}><Text style={styles.badgeText}>3</Text></View>
                  </View>
                  <Text style={styles.nameSmall} numberOfLines={1}>{third?.displayName || "---"}</Text>
                  <View style={[styles.pillar, styles.pillarBronze]}>
                    <Text style={styles.pointsPodium}>{renderPoints(third)}</Text>
                    <Text style={styles.labelPodium}>pts</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* LIST AREA */}
            <View style={styles.listContainer}>
              {otherUsers.map((item, i) => (
                <View key={item.id} style={styles.listCard}>
                  <Text style={styles.listRank}>{i + 4}</Text>
                  <Image source={{ uri: item.photoURL || "https://via.placeholder.com/150" }} style={styles.listAvatar} />
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>{item.displayName}</Text>
                    <Text style={styles.listStatus}>🔥 Keep going!</Text>
                  </View>
                  <View style={styles.pointBadge}>
                    <Text style={styles.pointText}>{renderPoints(item)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* STICKY "MY RANK" AT BOTTOM */}
      {!loading && myRank && myRank.rank > 3 && (
        <View style={styles.myRankSticky}>
           <Text style={styles.myRankNumber}>{myRank.rank}</Text>
           <Image source={{ uri: myRank.photoURL }} style={styles.myRankAvatar} />
           <Text style={styles.myRankName}>Your Rank</Text>
           <View style={styles.myRankPointsContainer}>
              <Text style={styles.myRankPoints}>{renderPoints(myRank)}</Text>
              <Text style={styles.myRankLabel}>pts</Text>
           </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", elevation: 2 },
  titleText: { fontSize: 20, fontFamily: "InterBold", color: "#111" },
  centerLoading: { marginTop: 100, alignItems: 'center' },
  switchRow: { flexDirection: "row", marginTop: 20, backgroundColor: "#F1F5F9", padding: 4, borderRadius: 25, alignSelf: "center" },
  switchInactive: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 20 },
  switchInactiveText: { fontFamily: "InterMedium", color: "#64748B", fontSize: 13 },
  switchActive: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 20, backgroundColor: "#FFF", elevation: 3 },
  switchActiveText: { fontFamily: "InterBold", color: "#3843FF", fontSize: 13 },
  topArea: { marginTop: 30, borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  top3Container: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 10, paddingTop: 20 },
  topItem: { alignItems: "center", width: "32%" },
  avatarWrapper: { position: 'relative' },
  avatarSmall: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" },
  avatarLarge: { width: 85, height: 85, borderRadius: 42.5, borderWidth: 4, borderColor: "#FFF" },
  badge: { position: 'absolute', bottom: -5, alignSelf: 'center', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  badgeLarge: { position: 'absolute', bottom: -5, alignSelf: 'center', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  badgeText: { color: '#FFF', fontSize: 10, fontFamily: 'InterBold' },
  nameSmall: { color: "#FFF", marginTop: 10, fontFamily: "InterBold", fontSize: 12, marginBottom: 5 },
  nameLarge: { color: "#FFF", marginTop: 10, fontSize: 14, fontFamily: "InterBold", marginBottom: 5 },
  pillar: { width: '100%', borderTopLeftRadius: 15, borderTopRightRadius: 15, alignItems: "center", justifyContent: 'center' },
  pillarSilver: { height: 90, backgroundColor: "rgba(255,255,255,0.2)" },
  pillarGold: { height: 130, backgroundColor: "rgba(255,255,255,0.3)" },
  pillarBronze: { height: 70, backgroundColor: "rgba(255,255,255,0.15)" },
  pointsPodium: { fontFamily: "InterBold", color: "#FFF", fontSize: 15 },
  labelPodium: { color: "rgba(255,255,255,0.7)", fontSize: 10 },
  pointsPodiumLarge: { fontFamily: "InterBold", color: "#FFF", fontSize: 20 },
  labelPodiumLarge: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  listContainer: { backgroundColor: "#F8FAFC", minHeight: 400, paddingTop: 10 },
  listCard: { flexDirection: "row", backgroundColor: "#FFF", marginHorizontal: 20, padding: 15, borderRadius: 22, alignItems: "center", marginTop: 12, elevation: 1 },
  listRank: { fontFamily: "InterBold", fontSize: 16, color: "#94A3B8", width: 25 },
  listAvatar: { width: 50, height: 50, borderRadius: 25, marginLeft: 5 },
  listInfo: { flex: 1, marginLeft: 15 },
  listName: { fontFamily: "InterBold", fontSize: 15, color: "#1E293B" },
  listStatus: { fontFamily: "InterMedium", fontSize: 11, color: "#94A3B8", marginTop: 2 },
  pointBadge: { backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  pointText: { fontFamily: "InterBold", fontSize: 14, color: "#3843FF" },
  
  // MY RANK STICKY
  myRankSticky: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#3843FF', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 25, paddingVertical: 15, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    elevation: 10
  },
  myRankNumber: { color: '#FFF', fontFamily: 'InterBold', fontSize: 16, width: 30 },
  myRankAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
  myRankName: { color: '#FFF', fontFamily: 'InterBold', fontSize: 16, marginLeft: 15, flex: 1 },
  myRankPointsContainer: { alignItems: 'flex-end' },
  myRankPoints: { color: '#FFF', fontFamily: 'InterBold', fontSize: 18 },
  myRankLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 }
});