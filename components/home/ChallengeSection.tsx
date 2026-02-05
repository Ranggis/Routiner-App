import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "../../firebase/config";
import { collection, query, onSnapshot, where, limit } from "firebase/firestore";
import ChallengeCard from "./ChallengeCard";

export default function ChallengeSection() {
  const router = useRouter();
  const [myChallenges, setMyChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "challenges"),
      where("participants", "array-contains", user.uid),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setMyChallenges(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Your Challenges</Text>
        <TouchableOpacity onPress={() => router.push("/challenge-library" as any)}>
          <Text style={styles.viewAll}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          style={styles.createCard} 
          onPress={() => router.push("/add-challenge" as any)}
        >
          <View style={styles.plusIcon}>
            <Ionicons name="add" size={24} color="#3843FF" />
          </View>
          <Text style={styles.createText}>Create{"\n"}Challenge</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator color="#3843FF" />
          </View>
        ) : (
          myChallenges.map((item) => {
            const userId = auth.currentUser?.uid || "";
            const userScore = item.userScores?.[userId] || 0;
            const progress = Math.min(Math.round((userScore / (item.goal || 1)) * 100), 100);

            return (
              <ChallengeCard 
                key={item.id}
                id={item.id}                   
                title={item.title}             
                endDate={item.endDate}         
                progressPercent={progress}     
                participantIds={item.participants || []} 
                onPress={() => router.push({
                  pathname: "/challenge/[id]",
                  params: { id: item.id }
                })}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 20 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", // Sudah diperbaiki dari alignDirection ke alignItems
    paddingHorizontal: 20, 
    marginBottom: 15 
  },
  sectionTitle: { fontSize: 18, fontFamily: "InterBold", color: "#111" },
  viewAll: { fontSize: 13, fontFamily: "InterBold", color: "#3843FF" },
  scrollContent: { paddingLeft: 20, paddingRight: 20, paddingBottom: 10 },
  loadingWrapper: { justifyContent: 'center', alignItems: 'center', minWidth: 100 },
  createCard: {
    width: 120,
    height: 140, 
    backgroundColor: "#F0F2FF",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#E0E7FF",
    borderStyle: 'dashed',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  plusIcon: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: "#FFF", 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 10 
  },
  createText: { textAlign: "center", fontFamily: "InterBold", fontSize: 13, color: "#3843FF" }
});