import React, { useState, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// FIREBASE
import { db, auth } from "../firebase/config";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function CalendarScreen() {
  const router = useRouter();
  
  // State Management
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  const user = auth.currentUser;

  // --- 1. AMBIL DATA HISTORY DARI FIREBASE ---
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "history"),
      orderBy("completedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setHistoryData(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching history:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // --- 2. LOGIKA MENANDAI TANGGAL DI KALENDER ---
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    historyData.forEach(item => {
      if (item.date) {
        marks[item.date] = { 
          marked: true, 
          dotColor: "#3843FF",
        };
      }
    });

    if (marks[selectedDate]) {
      marks[selectedDate] = { 
        ...marks[selectedDate], 
        selected: true, 
        selectedColor: "#3843FF",
        selectedTextColor: "#FFFFFF"
      };
    } else {
      marks[selectedDate] = { 
        selected: true, 
        selectedColor: "#E0E7FF",
        selectedTextColor: "#3843FF" 
      };
    }

    return marks;
  }, [historyData, selectedDate]);

  // --- 3. FILTER AKTIVITAS BERDASARKAN TANGGAL ---
  const dailyDetails = useMemo(() => {
    return historyData.filter(item => item.date === selectedDate);
  }, [historyData, selectedDate]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>History Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        {/* KALENDER */}
        <View style={styles.calendarCard}>
          {loading ? (
            <ActivityIndicator size="large" color="#3843FF" style={{ margin: 30 }} />
          ) : (
            <Calendar
              current={selectedDate}
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              theme={{
                todayTextColor: '#3843FF',
                arrowColor: '#3843FF',
                monthTextColor: '#1E293B',
                indicatorColor: '#3843FF',
                textDayFontFamily: 'InterMedium',
                textMonthFontFamily: 'InterBold',
                textDayHeaderFontFamily: 'InterSemiBold',
              }}
              markedDates={markedDates}
            />
          )}
        </View>

        {/* SECTION HEADER LIST */}
        <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>Activity on {selectedDate}</Text>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{dailyDetails.length} Completed</Text>
            </View>
        </View>

        {/* LIST AKTIVITAS */}
        {dailyDetails.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No activity recorded on this day.</Text>
          </View>
        ) : (
          dailyDetails.map((item) => {
            const isChallenge = item.type === "challenge";

            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.detailCard}
                activeOpacity={0.7}
                onPress={() => {
                  if (isChallenge) {
                    router.push(`/challenge/${item.habitId}` as any);
                  } else {
                    router.push(`/habit/${item.habitId}` as any);
                  }
                }}
              >
                <View style={[
                    styles.iconCircle, 
                    { backgroundColor: isChallenge ? "#FFF7ED" : "#F0F2FF" }
                ]}>
                  <MaterialCommunityIcons 
                    name={isChallenge ? "trophy" : "check-decagram"} 
                    size={22} 
                    color={isChallenge ? "#F97316" : "#3843FF"} 
                  />
                </View>
                
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.habitName} numberOfLines={1}>
                        {item.habitName || "Unnamed Activity"}
                    </Text>
                    {isChallenge && (
                        <View style={styles.challengeBadge}>
                            <Text style={styles.challengeBadgeText}>CHALLENGE</Text>
                        </View>
                    )}
                  </View>
                  <Text style={styles.pointsText}>
                    {isChallenge ? "Exclusive Points Earned" : `Earned +${item.pointsEarned || 0} Points`}
                  </Text>
                </View>

                <View style={styles.chevronWrap}>
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* FOOTER: CONSISTENCY IS KEY */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBg}>
             <Ionicons name="bulb" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.infoTitle}>Consistency is Key! 🚀</Text>
            <Text style={styles.infoText}>
              Click on any date to see your past achievements. Don't let the blue dots disappear!
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 44, height: 44, backgroundColor: "#FFF", borderRadius: 14, justifyContent: "center", alignItems: "center", elevation: 2 },
  title: { fontFamily: "InterBold", fontSize: 18, color: "#1E293B" },
  
  calendarCard: { backgroundColor: "#FFF", borderRadius: 28, padding: 10, elevation: 4, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 15 },
  
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 15 },
  detailTitle: { fontFamily: "InterBold", fontSize: 16, color: "#1E293B" },
  badge: { backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  badgeText: { color: "#3843FF", fontFamily: "InterBold", fontSize: 11 },

  detailCard: { 
    backgroundColor: "#FFF", padding: 16, borderRadius: 22, flexDirection: 'row', 
    alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9',
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.02
  },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  habitName: { fontFamily: "InterBold", fontSize: 15, color: "#1E293B", maxWidth: '65%' },
  pointsText: { fontFamily: "InterMedium", fontSize: 12, color: "#64748B", marginTop: 2 },
  chevronWrap: { width: 30, alignItems: 'flex-end' },
  
  challengeBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8
  },
  challengeBadgeText: {
    fontSize: 8,
    fontFamily: 'InterBold',
    color: '#C2410C'
  },

  emptyBox: { 
    alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#FFF', 
    borderRadius: 28, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0' 
  },
  emptyText: { fontFamily: "InterMedium", color: "#94A3B8", marginTop: 12, textAlign: 'center' },

  // STYLE UNTUK CONSISTENCY IS KEY
  infoCard: { 
    backgroundColor: "#3843FF", 
    borderRadius: 24, 
    padding: 20, 
    marginTop: 20, 
    flexDirection: 'row', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#3843FF",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  infoIconBg: { 
    width: 48, 
    height: 48, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  infoTitle: { color: "#FFFFFF", fontFamily: "InterBold", fontSize: 16 },
  infoText: { 
    color: "rgba(255, 255, 255, 0.8)", 
    fontFamily: "InterRegular", 
    fontSize: 13, 
    marginTop: 4, 
    lineHeight: 18 
  }
});