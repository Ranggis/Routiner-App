import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ExploreHeaderProps {
  onSearch?: (text: string) => void;
}

export default function ExploreHeader({ onSearch }: ExploreHeaderProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearchToggle = () => {
    if (isSearching) {
      setSearchText("");
      onSearch?.("");
    }
    setIsSearching(!isSearching);
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    onSearch?.(text);
  };

  return (
    <View style={styles.header}>
      {isSearching ? (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            placeholder="Search habits, clubs..."
            style={styles.input}
            autoFocus
            value={searchText}
            onChangeText={handleTextChange}
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity onPress={handleSearchToggle} style={styles.closeBtn}>
            <Ionicons name="close-circle" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>Explore</Text>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearchToggle}>
            <Ionicons name="search" size={22} color="#111" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    // Kita hapus height: 60 agar tinggi mengikuti konten + padding
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#F8F9FB",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "InterBold",
    fontSize: 28, // Sedikit diperbesar agar lebih tegas
    color: "#111",
    includeFontPadding: false, // Penting di Android agar teks tidak terpotong di atas/bawah
    flex: 1, // Agar teks mengambil ruang yang tersedia tanpa menabrak tombol
  },
  searchBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#FFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
    // Shadow halus
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48, // Input dibuat lebih tinggi agar nyaman diklik
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: "InterMedium",
    fontSize: 16,
    color: "#111",
    paddingVertical: 0, // Hilangkan padding internal default
  },
  closeBtn: {
    paddingLeft: 8,
  },
});