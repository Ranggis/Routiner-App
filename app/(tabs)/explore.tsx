import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react"; // Tambahkan ini

// COMPONENTS
import ExploreHeader from "../../components/explore/ExploreHeader";
import SuggestedRow from "../../components/explore/SuggestedRow";
import ClubsRow from "../../components/explore/ClubsRow";
import ChallengeRow from "../../components/explore/ChallengeRow";
import LearningRow from "../../components/explore/LearningRow";

export default function ExploreScreen() {
  // State untuk menyimpan teks pencarian
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      {/* 
         Header diletakkan di luar ScrollView jika ingin "Fixed" di atas, 
         atau di dalam ScrollView jika ingin ikut ter-scroll. 
      */}
      <ExploreHeader onSearch={(text) => setSearchQuery(text)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        
        {/* 
           Kirim searchQuery ke setiap komponen agar mereka bisa 
           memfilter datanya masing-masing secara real-time.
        */}
        <SuggestedRow searchQuery={searchQuery} />

        <ClubsRow searchQuery={searchQuery} />

        <ChallengeRow searchQuery={searchQuery} />

        <LearningRow searchQuery={searchQuery} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
});