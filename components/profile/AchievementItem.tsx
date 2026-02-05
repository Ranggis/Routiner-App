import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AchievementItemProps {
  iconName: string; // Nama icon dari database (contoh: 'run', 'trophy')
  color: string;    // Kode hex warna dari database (contoh: '#3843FF')
  title: string;
  time: string;
}

export default function AchievementItem({ iconName, color, title, time }: AchievementItemProps) {
  // Fallback jika data warna atau icon tidak ada
  const themeColor = color || "#3843FF";
  const icon = (iconName as any) || "trophy";

  return (
    <View style={styles.card}>
      {/* Icon Wrapper dengan background transparan 15% dari warna aslinya */}
      <View style={[styles.iconWrapper, { backgroundColor: themeColor + '26' }]}>
        <MaterialCommunityIcons name={icon} size={26} color={themeColor} />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.timeRow}>
          <MaterialCommunityIcons name="clock-outline" size={12} color="#94A3B8" />
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      {/* Badge kecil di pojok kanan untuk kesan "Award" */}
      <View style={styles.checkBadge}>
        <MaterialCommunityIcons name="check-decagram" size={18} color={themeColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 22,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",

    // Shadow halus agar terlihat modern
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    marginLeft: 15,
    justifyContent: "center",
    flex: 1,
  },

  title: {
    fontFamily: "InterBold", // Menggunakan Bold agar lebih kontras
    fontSize: 15,
    color: "#1E293B",
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4
  },

  time: {
    fontFamily: "InterMedium",
    fontSize: 12,
    color: "#94A3B8",
  },

  checkBadge: {
    paddingLeft: 10,
  }
});