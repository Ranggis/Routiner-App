import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// FIREBASE
import { db, auth } from "../../firebase/config";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

// CHART
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryArea,
  VictoryBar,
  VictoryGroup,
} from "victory-native";

const { width } = Dimensions.get("window");

export default function ActivityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Daily");
  const [habits, setHabits] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  // 1. HELPER: FORMAT TANGGAL LOKAL (Sangat Penting agar sinkron dengan HabitCard)
  const getLocalTodayStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 2. FETCH DATA FIREBASE
  useEffect(() => {
    if (!user) return;

    // Ambil Habits
    const qHabits = query(collection(db, "users", user.uid, "habits"));
    const unsubHabits = onSnapshot(qHabits, (snap) => {
      setHabits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.log("Error Fetch Habits:", err));

    // Ambil History
    const qHistory = query(collection(db, "users", user.uid, "history"), orderBy("date", "desc"));
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      const historyList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(historyList);
      setLoading(false);
    }, (err) => {
      console.log("Error Fetch History:", err);
      setLoading(false);
    });

    return () => {
      unsubHabits();
      unsubHistory();
    };
  }, [user]);

  // 3. LOGIKA STATISTIK
  const stats = useMemo(() => {
    const todayStr = getLocalTodayStr(new Date());
    let filteredHistory = [];
    let rangeDays = 1;

    if (activeTab === "Daily") {
      filteredHistory = history.filter(h => h.date === todayStr);
      rangeDays = 1;
    } else if (activeTab === "Weekly") {
      rangeDays = 7;
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return getLocalTodayStr(d);
      });
      filteredHistory = history.filter(h => last7Days.includes(h.date));
    } else {
      rangeDays = 30;
      const last30Days = Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return getLocalTodayStr(d);
      });
      filteredHistory = history.filter(h => last30Days.includes(h.date));
    }

    const completed = filteredHistory.length;
    const totalPoints = filteredHistory.reduce((sum, item) => sum + (Number(item.pointsEarned) || 0), 0);
    const successRate = Math.min(Math.round((completed / ((habits.length || 1) * rangeDays)) * 100), 100);

    let mood = "😐";
    if (successRate > 75) mood = "🤩";
    else if (successRate > 40) mood = "😊";
    else mood = "😫";

    return { successRate, completed, points: totalPoints, mood };
  }, [habits, history, activeTab]);

  // 4. LOGIKA GRAFIK
  const chartData = useMemo(() => {
    if (activeTab === "Daily") {
      if (habits.length === 0) return [{ x: " ", y: 0 }];
      return habits.map(h => ({
        x: h.label || h.name || "Habit",
        y: Math.min(((h.currentProgress || 0) / (h.target || 1)) * 100, 100)
      })).slice(0, 5);
    }

    const result = [];
    const daysToIterate = activeTab === "Weekly" ? 7 : 30;
    
    for (let i = daysToIterate - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getLocalTodayStr(d);
      const count = history.filter(h => h.date === dStr).length;
      
      const label = activeTab === "Weekly" 
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : (i % 5 === 0 ? d.getDate().toString() : ""); // Monthly show every 5 days for clarity

      result.push({ x: label, y: count, fullDate: dStr });
    }
    return result;
  }, [habits, history, activeTab]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3843FF" /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Your Progress</Text>
            <Text style={styles.title}>Activity Analytics</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/leaderboard" as any)}>
            <MaterialCommunityIcons name="trophy-variant" size={24} color="#3843FF" />
          </TouchableOpacity>
        </View>

        {/* TAB SWITCH */}
        <View style={styles.switchRow}>
          {["Daily", "Weekly", "Monthly"].map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[styles.switchBtn, activeTab === tab && styles.switchActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.switchText, activeTab === tab && styles.switchTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: '#3843FF' }]}>
                <MaterialCommunityIcons name="bullseye-arrow" size={20} color="#FFF" />
                <Text style={styles.statLabelWhite}>SUCCESS RATE</Text>
                <Text style={styles.statValueWhite}>{stats.successRate}%</Text>
            </View>
            <View style={styles.statBox}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.statLabel}>COMPLETED</Text>
                <Text style={styles.statValue}>{stats.completed}</Text>
            </View>
            <View style={styles.statBox}>
                <MaterialCommunityIcons name="star" size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>POINTS</Text>
                <Text style={styles.statValue}>{stats.points}</Text>
            </View>
            <View style={styles.statBox}>
                <MaterialCommunityIcons name="fire" size={20} color="#EF4444" />
                <Text style={styles.statLabel}>MOOD</Text>
                <Text style={styles.statValue}>{stats.mood}</Text>
            </View>
        </View>

        {/* CHART */}
        <View style={styles.chartCard}>
          <View style={styles.summaryHeader}>
             <View style={styles.titleWithIcon}>
                <MaterialCommunityIcons 
                    name={activeTab === "Daily" ? "chart-bar" : "chart-timeline-variant"} 
                    size={24} color="#3843FF" 
                />
                <View style={{marginLeft: 10}}>
                   <Text style={styles.cardTitle}>{activeTab} Overview</Text>
                   <Text style={styles.cardSubText}>
                    {activeTab === "Daily" ? "Habit current progress" : "Daily success history"}
                   </Text>
                </View>
             </View>
          </View>

          <View style={{ height: 220, marginTop: 10 }}>
            <VictoryChart padding={{ top: 20, bottom: 50, left: 45, right: 20 }} height={220} width={width - 40}>
              <VictoryAxis style={{ axis: { stroke: "#E2E8F0" }, tickLabels: { fontSize: 9, fill: "#94A3B8", fontFamily: 'InterMedium' } }} />
              <VictoryAxis dependentAxis style={{ axis: { stroke: "transparent" }, grid: { stroke: "#F1F5F9", strokeDasharray: "4, 4" }, tickLabels: { fontSize: 10, fill: "#94A3B8" } }} />
              
              {activeTab === "Daily" ? (
                <VictoryBar
                  data={chartData}
                  style={{ data: { fill: "#3843FF", width: 22 } }}
                  cornerRadius={{ top: 8 }}
                  animate={{ duration: 500 }}
                />
              ) : (
                <VictoryGroup>
                    <VictoryArea interpolation="monotoneX" data={chartData} style={{ data: { fill: "rgba(56, 67, 255, 0.1)", stroke: "transparent" } }} />
                    <VictoryLine interpolation="monotoneX" data={chartData} style={{ data: { stroke: "#3843FF", strokeWidth: 4 } }} animate={{ duration: 500 }} />
                </VictoryGroup>
              )}
            </VictoryChart>
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent History</Text>
            {history.length === 0 ? (
               <Text style={styles.emptyText}>No activity recorded yet.</Text>
            ) : (
              history.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                        <MaterialCommunityIcons name="check-bold" size={16} color="#3843FF" />
                    </View>
                    <View style={{flex: 1, marginLeft: 12}}>
                        <Text style={styles.activityName}>{item.habitName}</Text>
                        <Text style={styles.activityDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.activityPoints}>+{item.pointsEarned} pts</Text>
                </View>
              ))
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 25, marginTop: 20, marginBottom: 20 },
  welcomeText: { fontSize: 14, fontFamily: "InterMedium", color: "#94A3B8" },
  title: { fontSize: 24, fontFamily: "InterBold", color: "#1E293B" },
  iconBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", elevation: 4, shadowColor: "#000", shadowOpacity: 0.05 },
  switchRow: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: 5, borderRadius: 20, marginHorizontal: 20, marginBottom: 25 },
  switchBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: "center" },
  switchActive: { backgroundColor: "#FFF", elevation: 2, shadowOpacity: 0.1 },
  switchText: { fontFamily: "InterSemiBold", color: "#64748B", fontSize: 13 },
  switchTextActive: { color: "#3843FF" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, justifyContent: "space-between", gap: 12 },
  statBox: { width: (width - 52) / 2, backgroundColor: "#FFF", padding: 18, borderRadius: 24, elevation: 2, shadowColor: "#000", shadowOpacity: 0.02 },
  statLabel: { fontSize: 10, fontFamily: "InterBold", color: "#94A3B8", letterSpacing: 1, marginTop: 8 },
  statLabelWhite: { fontSize: 10, fontFamily: "InterBold", color: "rgba(255,255,255,0.7)", letterSpacing: 1, marginTop: 8 },
  statValue: { fontSize: 20, fontFamily: "InterBold", color: "#1E293B", marginTop: 2 },
  statValueWhite: { fontSize: 22, fontFamily: "InterBold", color: "#FFF", marginTop: 2 },
  chartCard: { backgroundColor: "#FFF", marginHorizontal: 20, marginTop: 25, padding: 20, borderRadius: 32, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05 },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  titleWithIcon: { flexDirection: "row", alignItems: "center" },
  cardTitle: { fontFamily: "InterBold", fontSize: 16, color: "#1E293B" },
  cardSubText: { fontFamily: "InterMedium", fontSize: 12, color: "#94A3B8" },
  recentSection: { marginTop: 30, paddingHorizontal: 25 },
  sectionTitle: { fontSize: 18, fontFamily: "InterBold", color: "#1E293B", marginBottom: 15 },
  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  activityIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  activityName: { fontSize: 14, fontFamily: 'InterBold', color: '#1E293B' },
  activityDate: { fontSize: 12, fontFamily: 'InterMedium', color: '#94A3B8' },
  activityPoints: { fontSize: 14, fontFamily: 'InterBold', color: '#10B981' },
  emptyText: { fontFamily: "InterMedium", color: "#94A3B8", textAlign: "center", marginTop: 10 },
  moodSubtitle: { fontSize: 14, fontFamily: "InterMedium", color: "#3843FF", marginTop: 2 }
});