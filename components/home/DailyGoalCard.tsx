import { View, Text, StyleSheet } from "react-native";

interface Props {
  percent: number;
  completed: number;
  total: number;
}

export default function DailyGoalCard({ percent, completed, total }: Props) {
  return (
    <View style={styles.card}>
      {/* LEFT CIRCLE */}
      <View style={styles.leftCircle}>
        <Text style={styles.percent}>{percent}%</Text>
      </View>

      {/* TEXT AREA */}
      <View style={styles.textBox}>
        <Text style={styles.title} numberOfLines={2}>
          Your daily goals almost done! 🔥
        </Text>

        <Text style={styles.subtitle}>
          {completed} of {total} completed
        </Text>
      </View>
    </View>
  );
}

/* ------------------------- STYLES ------------------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#304FFE",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",

    minHeight: 90, // bikin lega seperti Figma
  },

  leftCircle: {
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#243DE1",

    justifyContent: "center",
    alignItems: "center",
  },

  percent: {
    fontFamily: "InterBold",
    fontSize: 16,
    color: "#FFFFFF",
  },

  textBox: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },

  title: {
    fontFamily: "InterBold",
    fontSize: 15.5,
    color: "#FFFFFF",
    marginBottom: 4,
  },

  subtitle: {
    fontFamily: "InterRegular",
    fontSize: 12.5,
    color: "#E0E0E0",
  },
});
