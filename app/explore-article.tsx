import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  Share, 
  Linking,
  Alert,
  ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// FIREBASE IMPORTS
import { db, auth } from "../firebase/config"; // Sesuaikan path config kamu
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  serverTimestamp 
} from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function ArticleDetail() {
  const { data } = useLocalSearchParams();
  const router = useRouter();
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(true);

  // Parsing data artikel
  const article = data ? JSON.parse(data as string) : null;
  const user = auth.currentUser;

  // Membuat ID Unik untuk dokumen (News API biasanya tidak kasih ID, jadi kita pakai URL sebagai ID unik)
  // Kita hilangkan karakter spesial agar bisa jadi ID dokumen Firestore
  const articleId = article?.url ? article.url.replace(/[^a-zA-Z0-9]/g, "_") : null;

  // --- 1. CEK STATUS BOOKMARK SAAT MOUNT ---
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user || !articleId) {
        setLoadingBookmark(false);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid, "bookmarks", articleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setIsBookmarked(true);
        }
      } catch (error) {
        console.error("Error checking bookmark:", error);
      } finally {
        setLoadingBookmark(false);
      }
    };

    checkBookmarkStatus();
  }, [articleId]);

  if (!article) {
    return (
      <View style={styles.center}>
        <Text>Article not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- 2. FUNGSI TOGGLE BOOKMARK (SAVE/DELETE) ---
  const toggleBookmark = async () => {
    if (!user) {
      Alert.alert("Authentication", "Please login to save articles.");
      return;
    }

    if (!articleId) return;

    const docRef = doc(db, "users", user.uid, "bookmarks", articleId);

    try {
      if (isBookmarked) {
        // Hapus dari database
        await deleteDoc(docRef);
        setIsBookmarked(false);
        // Alert opsional, bisa ganti Toast
      } else {
        // Simpan ke database
        await setDoc(docRef, {
          ...article,
          savedAt: serverTimestamp(), // Catat waktu simpan
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Alert.alert("Error", "Failed to update bookmark.");
    }
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out this news: ${article.title}\n\nRead more at: ${article.url}`,
        url: article.url,
      });
    } catch (error) { console.log(error); }
  };

  const openOriginal = async () => {
    const supported = await Linking.canOpenURL(article.url);
    if (supported) {
      await Linking.openURL(article.url);
    } else {
      Alert.alert("Error", "Don't know how to open this URL");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        
        <View style={styles.imageWrapper}>
          {article.urlToImage ? (
            <Image source={{ uri: article.urlToImage }} style={styles.headerImg} />
          ) : (
            <View style={[styles.headerImg, styles.placeholderImg]} />
          )}
          
          <View style={styles.overlay} />

          <SafeAreaView edges={['top']} style={styles.topButtons}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.rightButtons}>
              <TouchableOpacity style={styles.circleBtn} onPress={onShare}>
                <Feather name="share" size={20} color="#FFF" />
              </TouchableOpacity>
              
              {/* TOMBOL BOOKMARK DENGAN LOADING */}
              <TouchableOpacity 
                style={[styles.circleBtn, { marginLeft: 10 }]} 
                onPress={toggleBookmark}
                disabled={loadingBookmark}
              >
                {loadingBookmark ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons 
                    name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                    size={20} 
                    color={isBookmarked ? "#FFD700" : "#FFF"} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.sourceRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{article.source?.name || "News"}</Text>
            </View>
            <Text style={styles.readTime}>• 5 min read</Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.authorSection}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${article.author || 'Author'}&background=random` }} 
              style={styles.authorAvatar} 
            />
            <View>
              <Text style={styles.authorName}>{article.author || "Unknown Author"}</Text>
              <Text style={styles.date}>Published recently</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <Text style={styles.bodyText}>
            {article.description || "No description available."}
            {"\n\n"}
            {article.content ? article.content.replace(/\[\+\d+ chars\]/g, "") : "Click button below to read full content on the official website."}
          </Text>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.readMoreBtn} onPress={openOriginal}>
          <Text style={styles.readMoreText}>Read Original Article</Text>
          <Feather name="external-link" size={16} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageWrapper: { height: 420, width: width, position: 'relative' },
  headerImg: { width: "100%", height: "100%", resizeMode: 'cover' },
  placeholderImg: { backgroundColor: '#333' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  topButtons: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  circleBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  rightButtons: { flexDirection: 'row' },
  contentCard: {
    flex: 1, backgroundColor: "#FFF", marginTop: -40,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 25, paddingTop: 35, paddingBottom: 120,
  },
  sourceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  badge: { backgroundColor: "#F0F3FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: "#4A5CFF", fontFamily: "InterBold", fontSize: 12, textTransform: 'uppercase' },
  readTime: { marginLeft: 10, color: "#999", fontFamily: "InterRegular", fontSize: 13 },
  title: { fontFamily: "InterBold", fontSize: 26, lineHeight: 34, color: "#111", marginBottom: 20 },
  authorSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  authorName: { fontFamily: "InterBold", fontSize: 15, color: "#111" },
  date: { fontFamily: "InterRegular", fontSize: 13, color: "#777", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginBottom: 25 },
  bodyText: { fontFamily: "InterRegular", fontSize: 17, lineHeight: 28, color: "#333" },
  footer: {
    position: 'absolute', bottom: 0, width: width,
    paddingHorizontal: 20, paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  readMoreBtn: {
    backgroundColor: "#111", height: 56, borderRadius: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  readMoreText: { color: "#FFF", fontFamily: "InterBold", fontSize: 16 },
});