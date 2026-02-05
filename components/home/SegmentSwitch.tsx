import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  active: "today" | "clubs";
  onChange: (v: "today" | "clubs") => void;
}

export default function SegmentSwitch({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, active === "today" && styles.active]}
        onPress={() => onChange("today")}
      >
        <Text style={[styles.text, active === "today" && styles.activeText]}>
          Today
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, active === "clubs" && styles.active]}
        onPress={() => onChange("clubs")}
      >
        <Text style={[styles.text, active === "clubs" && styles.activeText]}>
          Clubs
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EFEFF2",
    borderRadius: 25,
    flexDirection: "row",
    padding: 4,
    height: 44,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  active: {
    backgroundColor: "#FFF",
  },
  text: {
    fontSize: 14,
    color: "#777",
    fontFamily: "InterBold",
  },
  activeText: {
    color: "#111",
  },
});
