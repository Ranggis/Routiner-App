import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileTabs from "../../components/profile/ProfileTabs";
import ActivityList from "../../components/profile/ActivityList";
import FriendsList from "../../components/profile/FriendsList";
import AchievementsList from "../../components/profile/AchievementsList";

export default function ProfileScreen() {
  const [tab, setTab] = useState<"activity" | "friends" | "achievements">("activity");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        
        <ProfileHeader />

        <ProfileTabs active={tab} onChange={setTab} />

        {tab === "activity" && <ActivityList />}
        {tab === "friends" && <FriendsList />}
        {tab === "achievements" && <AchievementsList />}

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
