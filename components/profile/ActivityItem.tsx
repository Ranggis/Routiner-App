import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// 1. Tambahkan Interface agar TypeScript tidak 'any'
interface ActivityItemProps {
  text: string;
  time: string;
  type: 'up' | 'down' | 'medal';
}

export default function ActivityItem({ text, time, type }: ActivityItemProps) {
  
  // 2. Logika Konfigurasi Ikon dan Warna agar lebih rapi
  const getIconConfig = () => {
    switch (type) {
      case "up":
        return {
          component: <Ionicons name="arrow-up" size={18} color="#10B981" />,
          bgColor: "#DCFCE7", // Hijau muda transparan
        };
      case "down":
        return {
          component: <Ionicons name="arrow-down" size={18} color="#EF4444" />,
          bgColor: "#FEE2E2", // Merah muda transparan
        };
      case "medal":
        return {
          component: <MaterialCommunityIcons name="medal" size={20} color="#F59E0B" />,
          bgColor: "#FEF3C7", // Kuning muda transparan
        };
      default:
        return {
          component: <Ionicons name="notifications" size={18} color="#3843FF" />,
          bgColor: "#EEF2FF",
        };
    }
  };

  const config = getIconConfig();

  return (
    <View style={styles.card}>
      <View style={styles.leftContent}>
        <Text style={styles.text} numberOfLines={2}>{text}</Text>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={12} color="#94A3B8" />
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      <View style={[styles.rightIcon, { backgroundColor: config.bgColor }]}>
        {config.component}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20, // Lebih membulat agar modern
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    
    // Shadow halus
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  leftContent: {
    flex: 1, // Agar teks mengambil sisa ruang dan tidak menabrak ikon
    marginRight: 15,
  },
  text: {
    fontFamily: "InterBold", // Diganti ke Bold agar lebih terbaca
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4
  },
  time: {
    fontFamily: "InterMedium",
    fontSize: 11,
    color: "#94A3B8",
  },
  rightIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});