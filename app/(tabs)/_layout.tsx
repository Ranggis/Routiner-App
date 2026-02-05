import { Tabs } from "expo-router";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler"; 
import AddActionModal from "../../components/AddActionModal"; 
import HabitSelectionSheet from "../../components/HabitSelectionSheet";

// FIREBASE IMPORTS
import { db, auth } from "../../firebase/config";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectionVisible, setSelectionVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'build' | 'quit'>('build');

  // --- STATE BARU UNTUK BADGE ---
  const [hasNewUpdate, setHasNewUpdate] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  // 1. REAL-TIME LISTENER UNTUK ACTIVITY BARU
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Kita pantau koleksi history, ambil 1 data terbaru saja
    const q = query(
      collection(db, "users", user.uid, "history"),
      orderBy("completedAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Jika ada data baru masuk ke history
      if (!snapshot.empty) {
        const lastChange = snapshot.docChanges()[0];
        // Jika tipenya 'added' (berarti baru saja menyelesaikan habit)
        if (lastChange?.type === "added") {
          setHasNewUpdate(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: modalVisible ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [modalVisible]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "135deg"],
  });

  const handleOpenSelection = (mode: 'build' | 'quit') => {
    setModalVisible(false);
    setSelectionMode(mode);
    setTimeout(() => {
      setSelectionVisible(true);
    }, 300);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
        
        {modalVisible && (
          <AddActionModal 
            onClose={() => setModalVisible(false)} 
            onSelectBuild={() => handleOpenSelection('build')}
            onSelectQuit={() => handleOpenSelection('quit')}
          />
        )}

        <HabitSelectionSheet 
          visible={selectionVisible}
          onClose={() => setSelectionVisible(false)}
          mode={selectionMode}
        />

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: [
              styles.tabBar,
              {
                bottom: insets.bottom > 0 ? insets.bottom : 20,
                zIndex: 100,
              },
            ],
            tabBarItemStyle: { height: 70, justifyContent: 'center', alignItems: 'center' },
            tabBarIconStyle: {
              marginTop: 15,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          <Tabs.Screen name="home" options={{
              tabBarIcon: ({ focused }) => (
                <Ionicons name="home" size={26} color={focused ? "#3843FF" : "#D1D5DB"} />
              ),
          }} />

          <Tabs.Screen name="explore" options={{
              tabBarIcon: ({ focused }) => (
                <View style={[styles.circleGrey, focused && styles.circleActive]}>
                  <Ionicons name="compass" size={22} color={focused ? "#3843FF" : "#9CA3AF"} />
                </View>
              ),
          }} />

          <Tabs.Screen
            name="add"
            options={{
              tabBarIcon: () => (
                <Animated.View style={[styles.blueFab, { transform: [{ rotate: rotation }] }]}>
                  <Ionicons name="add" size={32} color="#FFFFFF" />
                </Animated.View>
              ),
            }}
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                if (selectionVisible) {
                  setSelectionVisible(false);
                } else {
                  setModalVisible(!modalVisible);
                }
              },
            }}
          />

          <Tabs.Screen 
            name="activity" 
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons 
                    name="medal-outline" 
                    size={26} 
                    color={focused ? "#3843FF" : "#9CA3AF"} 
                  />
                  {/* Tanda merah muncul hanya jika ada update baru */}
                  {hasNewUpdate && <View style={styles.redBadge} />}
                </View>
              ),
            }} 
            // 2. RESET BADGE SAAT USER KLIK TAB ACTIVITY
            listeners={{
              tabPress: () => setHasNewUpdate(false),
            }}
          />

          <Tabs.Screen name="profile" options={{
              tabBarIcon: ({ focused }) => (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <View style={[styles.pHead, { backgroundColor: focused ? "#3843FF" : "#D1D5DB" }]} />
                  <View style={[styles.pBody, { backgroundColor: focused ? "#3843FF" : "#D1D5DB" }]} />
                </View>
              ),
          }} />
        </Tabs>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  blueFab: {
    width: 55,
    height: 55,
    backgroundColor: "#3843FF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3843FF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: -10, 
  },
  circleGrey: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F2F4F7", justifyContent: "center", alignItems: "center" },
  circleActive: { backgroundColor: "#EEF2FF" },
  redBadge: { 
    position: "absolute", 
    top: -2, 
    right: -2, 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: "#FF5A5A", 
    borderWidth: 2, 
    borderColor: "#FFFFFF" 
  },
  pHead: { width: 10, height: 10, borderRadius: 5, marginBottom: 2 },
  pBody: { width: 18, height: 8, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
});