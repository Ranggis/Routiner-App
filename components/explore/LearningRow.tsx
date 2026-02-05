import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NEWS_API_KEY } from "../../constants/keys";

const { width } = Dimensions.get("window");

// Tambahkan Interface Props agar bisa menerima searchQuery dari parent
interface LearningRowProps {
  searchQuery?: string;
}

export default function LearningRow({ searchQuery = "" }: LearningRowProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(
        `https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
      );
      const json = await res.json();
      setArticles(json.articles || []);
    } catch (err) {
      console.log("News error: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Logika Filter berdasarkan Search Query
  const filteredArticles = articles.filter((article) =>
    article.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4A5CFF" />
      </View>
    );
  }

  // Sembunyikan baris jika sedang mencari dan tidak ada hasil yang cocok
  if (searchQuery !== "" && filteredArticles.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.rowHeader}>
        <Text style={styles.title}>Learning</Text>
        <TouchableOpacity 
          style={styles.viewAllBtn} 
          onPress={() => router.push("/explore/view-all" as any)}
        >
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Ionicons name="arrow-forward" size={14} color="#4A5CFF" />
        </TouchableOpacity>
      </View>

      {/* HORIZONTAL LIST */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={240 + 16} // Snapping effect
        decelerationRate="fast"
      >
        {filteredArticles.map((article, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/explore-article",
                params: { data: JSON.stringify(article) },
              })
            }
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: article.urlToImage || "https://images.unsplash.com/photo-1505751172177-51ad186730a3?q=80&w=500" }}
                style={styles.thumbnail}
              />
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceText}>{article.source?.name.split('.')[0] || "Health"}</Text>
              </View>
            </View>

            <View style={styles.cardInfo}>
              <Text numberOfLines={2} style={styles.cardTitle}>
                {article.title}
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Ionicons name="time-outline" size={12} color="#94A3B8" />
                  <Text style={styles.dateText}>5 min read</Text>
                </View>
                <View style={styles.footerItem}>
                   <Ionicons name="eye-outline" size={12} color="#94A3B8" />
                   <Text style={styles.dateText}>Learn</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    marginTop: 22,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontFamily: "InterBold",
    fontSize: 18,
    color: "#111",
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontFamily: "InterBold",
    fontSize: 12,
    color: "#4A5CFF",
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 5,
  },

  /* Card Styles */
  card: {
    width: 240,
    backgroundColor: "#FFF",
    borderRadius: 24,
    marginRight: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  imageContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: "100%",
    height: 130,
    resizeMode: 'cover',
  },
  sourceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sourceText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: 'InterBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  cardInfo: {
    padding: 15,
  },
  cardTitle: {
    fontFamily: "InterBold",
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
    height: 40, 
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between'
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: "InterMedium",
    fontSize: 11,
    color: "#94A3B8",
  },
});