import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Tambahkan Interface Props untuk menerima searchQuery
interface SuggestedRowProps {
  searchQuery?: string;
}

export default function SuggestedRow({ searchQuery = "" }: SuggestedRowProps) {
  const router = useRouter();

  // Data saran habit
  const suggestions = [
    { 
      title: "Walk", 
      target: "10", 
      unit: "km", 
      color: "#FFE3DD", 
      icon: "walk", 
      iconColor: "#FF5A3F" 
    },
    { 
      title: "Swim", 
      target: "30", 
      unit: "min", 
      color: "#DDE5FF", 
      icon: "swim", 
      iconColor: "#3843FF" 
    },
    { 
      title: "Read", 
      target: "20", 
      unit: "pages", 
      color: "#DFF5E8", 
      icon: "book-open-variant", 
      iconColor: "#2D9D53" 
    },
    { 
      title: "Meditation", 
      target: "10", 
      unit: "min", 
      color: "#FDF0FF", 
      icon: "leaf", 
      iconColor: "#A855F7" 
    },
    { 
      title: "Water", 
      target: "2000", 
      unit: "ml", 
      color: "#E0F7FF", 
      icon: "water", 
      iconColor: "#00B8D4" 
    },
  ];

  // Logika Filter berdasarkan teks pencarian
  const filteredSuggestions = suggestions.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePress = (item: any) => {
    router.push({
      pathname: "/AddHabbit", // Sesuaikan dengan nama file kamu (AddHabbit atau AddHabit)
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

  // Sembunyikan baris jika sedang mencari dan tidak ada hasil
  if (searchQuery !== "" && filteredSuggestions.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.rowHeader}>
        <Text style={styles.title}>Suggested for You</Text>
        <TouchableOpacity onPress={() => router.push("/suggested-library" as any)}>
          <Text style={styles.viewAll}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredSuggestions.map((item, i) => (
          <TouchableOpacity 
            key={i} 
            activeOpacity={0.8}
            onPress={() => handlePress(item)}
            style={[styles.card, { backgroundColor: item.color }]}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={item.icon as any} size={26} color={item.iconColor} />
            </View>
            <View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.target} {item.unit}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 22,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: { fontFamily: "InterBold", fontSize: 18, color: "#111" },
  viewAll: { fontFamily: "InterBold", fontSize: 13, color: "#3843FF" },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  card: {
    width: 135,
    height: 145,
    borderRadius: 24,
    padding: 16,
    marginRight: 12,
    justifyContent: "space-between",
    // Shadow halus agar kartu tidak terlihat "flat"
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 46,
    height: 46,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontFamily: "InterBold", fontSize: 16, color: "#111" },
  cardSub: { fontFamily: "InterMedium", color: "rgba(0,0,0,0.6)", fontSize: 12, marginTop: 2 },
});