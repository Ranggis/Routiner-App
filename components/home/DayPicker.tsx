import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";

interface DayPickerProps {
  days: {
    dayName: string;
    dayNumber: string;
    fullDate: string;
  }[];
  selected: number;
  onSelect: (index: number) => void;
}

export default function DayPicker({ days, selected, onSelect }: DayPickerProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((d, index) => {
          const active = index === selected;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={[styles.item, active && styles.active]}
              onPress={() => onSelect(index)}
            >
              <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>
                {d.dayNumber}
              </Text>
              <Text style={[styles.dayName, active && styles.dayNameActive]}>
                {d.dayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingRight: 20, // Agar item terakhir tidak nempel ke pinggir
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginRight: 12,
    alignItems: "center",
    width: 65,
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  active: {
    backgroundColor: "#3843FF",
    borderColor: "#3843FF",
    // Glow effect
    shadowColor: "#3843FF",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  dayNumber: {
    fontFamily: "InterBold",
    fontSize: 18,
    color: "#1E293B",
  },
  dayName: {
    fontFamily: "InterMedium",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  dayNumberActive: { 
    color: "#FFF" 
  },
  dayNameActive: { 
    color: "rgba(255,255,255,0.8)" 
  },
});