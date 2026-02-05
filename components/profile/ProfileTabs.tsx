import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ProfileTabs({ active, onChange }: any) {
  return (
    <View style={styles.row}>
      {["activity", "friends", "achievements"].map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onChange(t)}
          style={[styles.tab, active === t && styles.activeTab]}
        >
          <Text
            style={[styles.tabText, active === t && styles.activeText]}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: "#EDEFF5",
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: "#FFF",
  },
  tabText: {
    fontFamily: "InterMedium",
    color: "#777",
  },
  activeText: {
    color: "#3843FF",
    fontFamily: "InterBold",
  },
});
