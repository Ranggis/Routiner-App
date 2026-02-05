import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Animated } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Tambahkan Interface Props agar terhubung dengan Layout
interface Props {
  onClose: () => void;
  onSelectBuild: () => void;
  onSelectQuit: () => void;
}

export default function AddActionModal({ onClose, onSelectBuild, onSelectQuit }: Props) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedMood, setSelectedMood] = React.useState(4);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.fullScreen, { opacity: fadeAnim }]}>
      {/* Klik area gelap untuk menutup menu & rotasi ikon kembali */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Container Menu - Posisi bottom + 100 agar pas di atas Tab Bar */}
      <View style={[styles.menuWrapper, { bottom: insets.bottom + 100 }]}>
        
        <View style={styles.row}>
          {/* QUIT BAD HABIT - Memicu Sheet Tahap 2 */}
          <TouchableOpacity 
            style={styles.cardSmall} 
            onPress={onSelectQuit}
          >
            <View style={styles.textWrap}>
              <Text style={styles.cardTitle}>Quit Bad Habit</Text>
              <Text style={styles.cardSub}>Never too late...</Text>
            </View>
            <View style={[styles.iconBox, { backgroundColor: '#FFF0F0' }]}>
              <MaterialCommunityIcons name="shield-off" size={20} color="#FF5A5A" />
            </View>
          </TouchableOpacity>

          {/* NEW GOOD HABIT - Memicu Sheet Tahap 2 */}
          <TouchableOpacity 
            style={styles.cardSmall} 
            onPress={onSelectBuild}
          >
            <View style={styles.textWrap}>
              <Text style={styles.cardTitle}>New Good Habit</Text>
              <Text style={styles.cardSub}>For a better life</Text>
            </View>
            <View style={[styles.iconBox, { backgroundColor: '#F0FFF0' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ADD MOOD */}
        <View style={styles.moodCard}>
          <View style={styles.moodTextContainer}>
            <Text style={styles.cardTitle}>Add Mood</Text>
            <Text style={styles.cardSub} numberOfLines={1}>How're you feeling?</Text>
          </View>
          
          <View style={styles.emojiRow}>
            {['😡', '😕', '😐', '😊', '😍'].map((emoji, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setSelectedMood(index)}
                style={[
                  styles.emojiBtn, 
                  selectedMood === index && styles.emojiActive
                ]}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90, // Di bawah Tab Bar (100)
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  menuWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  row: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 12,
    width: '100%' 
  },
  cardSmall: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrap: { flex: 1, marginRight: 5 },
  cardTitle: { fontFamily: 'InterBold', fontSize: 13, color: '#111' },
  cardSub: { fontFamily: 'InterRegular', fontSize: 10, color: '#999', marginTop: 2 },
  iconBox: { 
    width: 34, 
    height: 34, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  moodCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  emojiRow: { 
    flexDirection: 'row', 
    gap: 5,
    alignItems: 'center',
  },
  emojiBtn: { 
    width: 35, 
    height: 35, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emojiText: {
    fontSize: 16,
  },
  emojiActive: { 
    borderColor: '#3843FF', 
    backgroundColor: '#F0F2FF' 
  },
});