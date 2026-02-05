import { View, ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "expo-router"; // 1. Import Router

// FIREBASE
import { db, auth } from "../../firebase/config";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

// COMPONENTS
import HomeHeader from "../../components/home/HomeHeader";
import SegmentSwitch from "../../components/home/SegmentSwitch";
import DayPicker from "../../components/home/DayPicker";
import DailyGoalCard from "../../components/home/DailyGoalCard";
import HabitCard from "../../components/home/HabitCard";
import ClubsContent from "../../components/home/ClubsContent";
import ChallengeSection from "../../components/home/ChallengeSection"; 

// UTILS
import { getNext7Days } from "../../utils/dateHelpers";

export default function HomeScreen() {
  const router = useRouter(); // 2. Inisialisasi Router
  const [segment, setSegment] = useState<"today" | "clubs">("today");
  const [days, setDays] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(0); 
  
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDays(getNext7Days());
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "habits"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredHabits = useMemo(() => {
    if (days.length === 0) return [];
    
    const selectedDateObj = new Date(days[selectedDay].fullDate);
    const year = selectedDateObj.getFullYear();
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
    const date = String(selectedDateObj.getDate()).padStart(2, '0');
    const selectedDateStr = `${year}-${month}-${date}`;

    return habits.filter(habit => {
      if (habit.hiddenDates?.includes(selectedDateStr)) return false;
      if (habit.rescheduledTo === selectedDateStr) return true;

      const start = new Date(habit.startDate);
      const end = new Date(habit.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const checkDate = new Date(selectedDateStr);
      checkDate.setHours(0, 0, 0, 0);

      return checkDate >= start && checkDate <= end;
    });
  }, [habits, selectedDay, days]);

  const stats = useMemo(() => {
    const total = filteredHabits.length;
    const completed = filteredHabits.filter(h => {
      const current = Number(h.currentProgress) || 0;
      const target = Number(h.target) || 0;
      return current >= target && target > 0;
    }).length;

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percent };
  }, [filteredHabits]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>

        <View style={{ paddingHorizontal: 20 }}>
            <HomeHeader 
            />

            <View style={{ marginTop: 15 }}>
                <SegmentSwitch active={segment} onChange={setSegment} />
            </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >

          {segment === "today" && (
            <View>
              <View style={{ paddingHorizontal: 20 }}>
                  <View style={{ marginTop: 15 }}>
                    <DayPicker 
                      days={days}
                      selected={selectedDay}
                      onSelect={setSelectedDay}
                    />
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <DailyGoalCard 
                      percent={stats.percent} 
                      completed={stats.completed} 
                      total={stats.total} 
                    />
                  </View>
              </View>

              <ChallengeSection />

              <View style={{ paddingHorizontal: 20 }}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Habits</Text>
                    
                    {/* 3. Tombol VIEW ALL Berfungsi Sekarang */}
                    <TouchableOpacity onPress={() => router.push("/habit/all-habits")}>
                        <Text style={styles.sectionMore}>VIEW ALL</Text>
                    </TouchableOpacity>
                  </View>

                  {loading ? (
                    <ActivityIndicator size="large" color="#3843FF" style={{ marginTop: 20 }} />
                  ) : filteredHabits.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No habits for this day.</Text>
                    </View>
                  ) : (
                    filteredHabits.map((habit) => (
                      <HabitCard 
                        key={habit.id}
                        id={habit.id}
                        label={habit.name}
                        progress={habit.unit}
                        target={Number(habit.target) || 0}
                        currentProgress={Number(habit.currentProgress) || 0}
                        icon={habit.icon}
                        iconColor={habit.iconColor}
                        cardColor={habit.color}
                      />
                    ))
                  )}
              </View>
            </View>
          )}

          {segment === "clubs" && (
             <View style={{ paddingHorizontal: 20 }}>
               <ClubsContent />
             </View>
          )}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FA" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 22, marginBottom: 10, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontFamily: "InterBold", color: "#111" },
  sectionMore: { fontSize: 13, fontFamily: "InterBold", color: "#3843FF", paddingVertical: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 30, backgroundColor: '#FFF', padding: 25, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  emptyText: { fontFamily: 'InterMedium', color: '#94A3B8', fontSize: 14 }
});