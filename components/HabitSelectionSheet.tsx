import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Pressable, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  mode: 'build' | 'quit';
}

export default function HabitSelectionSheet({ visible, onClose, mode }: Props) {
  const router = useRouter();
  const isBuild = mode === 'build';

  // --- INTEGRASI: Tambahkan properti 'unit' agar AddHabit tahu satuannya ---
  const popularHabits = isBuild ? [
    { name: "Walk", target: "10", unit: "km", icon: "walk", color: "#FFF4F1", iconColor: "#FF5A3F" },
    { name: "Swim", target: "30", unit: "min", icon: "swim", color: "#F0F2FF", iconColor: "#3843FF" },
    { name: "Read", target: "20", unit: "min", icon: "book-open-variant", color: "#E8F9EE", iconColor: "#2D9D53" },
    { name: "Yoga", target: "15", unit: "min", icon: "yoga", color: "#FDF0FF", iconColor: "#A855F7" },
  ] : [
    { name: "Smoking", target: "0", unit: "times", icon: "smoking-off", color: "#FFF1F2", iconColor: "#E11D48" },
    { name: "Alcohol", target: "0", unit: "ml", icon: "glass-wine", color: "#F5F3FF", iconColor: "#7C3AED" },
    { name: "Sweets", target: "0", unit: "pages", icon: "cookie", color: "#FFF7ED", iconColor: "#EA580C" },
    { name: "Social", target: "30", unit: "min", icon: "cellphone-off", color: "#F0F9FF", iconColor: "#0EA5E9" },
  ];

  const handleCreateCustom = () => {
    onClose();
    router.push("/AddHabbit"); // Pastikan nama file kamu AddHabbit (dua 'b') atau AddHabit
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Pressable style={styles.flex} onPress={onClose} />
        
        <View style={styles.sheet}>
          <View style={styles.indicator} />

          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionLabel}>
                {isBuild ? "NEW GOOD HABIT" : "QUIT BAD HABIT"}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.customCard} 
              onPress={handleCreateCustom}
              activeOpacity={0.8}
            >
              <View style={styles.customTextContent}>
                <Text style={styles.customTitle}>Create Custom Habit</Text>
                <Text style={styles.customSub}>Design your own unique goal</Text>
              </View>
              <View style={styles.plusCircle}>
                <Ionicons name="add" size={20} color="#3843FF" />
              </View>
            </TouchableOpacity>

            <View style={styles.labelRow}>
               <Text style={styles.sectionLabel}>POPULAR HABITS</Text>
               <TouchableOpacity>
                 <Text style={styles.viewMoreText}>See all</Text>
               </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.scrollContent}
              decelerationRate="fast"
            >
              {popularHabits.map((habit, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.popularCard, { backgroundColor: habit.color }]}
                  activeOpacity={0.9}
                  onPress={() => {
                    onClose();
                    router.push({
                      pathname: "/AddHabbit", // Sesuaikan dengan nama file kamu
                      params: {
                        name: habit.name,
                        target: habit.target,
                        unit: habit.unit, // Kirim unit ke AddHabit
                        icon: habit.icon,
                        color: habit.color,
                        iconColor: habit.iconColor,
                      },
                    });
                  }}
                >
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons
                      name={habit.icon as any}
                      size={22}
                      color={habit.iconColor}
                    />
                  </View>

                  <View>
                    <Text style={styles.habitName} numberOfLines={1}>
                      {habit.name}
                    </Text>
                    <Text style={styles.habitTarget}>{habit.target} {habit.unit}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  flex: { flex: 1 },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 30, minHeight: height * 0.4 },
  indicator: { width: 36, height: 4, backgroundColor: '#E5E7EB', borderRadius: 10, alignSelf: 'center', marginTop: 12 },
  content: { paddingTop: 20 },
  headerRow: { paddingHorizontal: 20, marginBottom: 12 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  sectionLabel: { fontFamily: 'InterBold', fontSize: 11, color: '#9CA3AF', letterSpacing: 1 },
  viewMoreText: { fontFamily: 'InterSemiBold', fontSize: 11, color: '#3843FF' },
  customCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, marginHorizontal: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9' },
  customTextContent: { flex: 1 },
  customTitle: { fontFamily: 'InterBold', fontSize: 15, color: '#1E293B' },
  customSub: { fontFamily: 'InterRegular', fontSize: 12, color: '#64748B', marginTop: 2 },
  plusCircle: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F0F2FF', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingLeft: 20, paddingRight: 10 },
  popularCard: { width: 110, height: 140, borderRadius: 24, padding: 14, marginRight: 10, justifyContent: 'space-between' },
  iconCircle: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  habitName: { fontFamily: 'InterBold', fontSize: 14, color: '#1E293B' },
  habitTarget: { fontFamily: 'InterMedium', fontSize: 11, color: '#64748B', marginTop: 2 },
});