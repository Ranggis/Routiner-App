import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SuggestedLibrary() {
  const router = useRouter();

  const habitCategories = [
    {
      category: "Health & Fitness",
      items: [
        { title: "Walk", target: "10", unit: "km", color: "#FFE3DD", icon: "walk", iconColor: "#FF5A3F" },
        { title: "Swim", target: "30", unit: "min", color: "#F0F2FF", icon: "swim", iconColor: "#3843FF" },
        { title: "Push Ups", target: "20", unit: "times", color: "#F0FDF4", icon: "arm-flex", iconColor: "#22C55E" },
        { title: "Drink Water", target: "2000", unit: "ml", color: "#E0F2FE", icon: "water", iconColor: "#0EA5E9" },
      ]
    },
    {
      category: "Mental Wellness",
      items: [
        { title: "Meditation", target: "10", unit: "min", color: "#FDF0FF", icon: "leaf", iconColor: "#A855F7" },
        { title: "Journaling", target: "1", unit: "pages", color: "#FEF9C3", icon: "notebook", iconColor: "#CA8A04" },
        { title: "Yoga", target: "15", unit: "min", color: "#FEE2E2", icon: "yoga", iconColor: "#EF4444" },
      ]
    },
    {
      category: "Productivity",
      items: [
        { title: "Read", target: "20", unit: "pages", color: "#E8F9EE", icon: "book-open-variant", iconColor: "#2D9D53" },
        { title: "No Social Media", target: "60", unit: "min", color: "#F1F5F9", icon: "cellphone-off", iconColor: "#64748B" },
        { title: "Learn Coding", target: "30", unit: "min", color: "#E0E7FF", icon: "code-tags", iconColor: "#4338CA" },
      ]
    }
  ];

  const handleSelect = (item: any) => {
    router.push({
      pathname: "/AddHabbit",
      params: {
        name: item.title,
        target: item.target,
        unit: item.unit,
        icon: item.icon,
        color: item.color,
        iconColor: item.iconColor,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Habit Library</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.mainDesc}>
          Pilih dari koleksi habit populer kami untuk memulai journey baru kamu.
        </Text>

        {habitCategories.map((cat, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{cat.category}</Text>
            <View style={styles.grid}>
              {cat.items.map((item, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.libCard} 
                  onPress={() => handleSelect(item)}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                    <MaterialCommunityIcons 
                      name={item.icon as any} 
                      size={28} 
                      color={item.iconColor} 
                    />
                  </View>
                  <Text style={styles.cardLabel} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardGoal}>{item.target} {item.unit}</Text>
                  
                  <View style={styles.addSmallCircle}>
                    <Ionicons name="add" size={16} color="#FFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 10,
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: "#F8F9FB", 
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  headerTitle: { fontFamily: "InterBold", fontSize: 20, color: "#111" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  mainDesc: {
    fontFamily: 'InterRegular',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 25
  },
  section: { marginBottom: 30 },
  sectionTitle: { 
    fontFamily: "InterBold", 
    fontSize: 13, 
    color: "#94A3B8", 
    letterSpacing: 1.2, 
    marginBottom: 15, 
    textTransform: 'uppercase' 
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  libCard: { 
    width: '48%', 
    backgroundColor: '#FFF', 
    borderRadius: 28, 
    padding: 20, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
      },
      android: { elevation: 2 }
    })
  },
  iconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  cardLabel: { fontFamily: "InterBold", fontSize: 16, color: "#111", textAlign: 'center' },
  cardGoal: { fontFamily: "InterMedium", fontSize: 12, color: "#64748B", marginTop: 4 },
  addSmallCircle: {
    position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: '#3843FF', justifyContent: 'center', alignItems: 'center'
  }
});