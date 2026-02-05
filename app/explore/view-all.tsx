import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { NEWS_API_KEY } from "../../constants/keys";

export default function ViewAllNews() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(
        `https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`
      );
      const json = await res.json();
      setArticles(json.articles || []);
    } catch (err) {
      console.log("Error fetching all news: ", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderArticleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.articleCard}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/explore-article",
          params: { data: JSON.stringify(item) },
        })
      }
    >
      <Image
        source={{ uri: item.urlToImage || "https://via.placeholder.com/150" }}
        style={styles.thumbnail}
      />
      <View style={styles.cardContent}>
        <View style={styles.badgeRow}>
          <Text style={styles.sourceTag}>{item.source?.name || "Health"}</Text>
          <Text style={styles.dateText}> • 5 min read</Text>
        </View>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description || "No description available for this article."}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Center</Text>
        <View style={{ width: 42 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={18} color="#999" />
          <TextInput
            placeholder="Search articles..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A5CFF" />
          <Text style={styles.loadingText}>Fetching latest news...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderArticleItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No articles found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerTitle: {
    fontFamily: "InterBold",
    fontSize: 20,
    color: "#111",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF0F2",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "InterRegular",
    fontSize: 15,
    color: "#111",
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  articleCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: "#EEE",
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  sourceTag: {
    fontFamily: "InterBold",
    fontSize: 10,
    color: "#4A5CFF",
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 10,
    color: "#999",
  },
  articleTitle: {
    fontFamily: "InterBold",
    fontSize: 15,
    color: "#111",
    lineHeight: 20,
  },
  description: {
    fontFamily: "InterRegular",
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontFamily: "InterMedium",
  },
  emptyText: {
    fontFamily: "InterMedium",
    color: "#999",
  },
});