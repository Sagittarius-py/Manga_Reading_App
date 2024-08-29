import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
	View,
	Text,
	Image,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
	getFavorites,
	addFavorite,
	removeFavorite,
	isFavorite,
} from "../utils/favoritesStorage";
import { ThemeContext } from "../context/ThemeContext";

const MangaDetailsScreen = () => {
	const { theme, colors, currentTheme } = useContext(ThemeContext);
	const navigation = useNavigation();
	const route = useRoute();
	const { manga } = route.params;

	const [chapterList, setChapterList] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isFav, setIsFav] = useState(false);

	const styles = StyleSheet.create({
		container: {
			backgroundColor: currentTheme.background,
		},
		coverImage: {
			width: "100%",
			height: 600,
			resizeMode: "cover",
		},
		detailsContainer: {
			padding: 10,
		},
		title: {
			fontSize: 24,
			fontWeight: "bold",
			marginVertical: 10,
			color: currentTheme.text,
		},
		description: {
			fontSize: 16,
			color: currentTheme.text,
		},
		year: {
			fontSize: 16,
			color: currentTheme.text2,
			marginVertical: 5,
		},
		status: {
			fontSize: 16,
			color: currentTheme.text2,
			marginVertical: 5,
		},
		chaptersTitle: {
			fontSize: 18,
			color: currentTheme.text,
			marginBottom: 10,
		},
		chapterItem: {
			padding: 10,
			borderBottomWidth: 1,
			borderBottomColor: "#ccc",
		},
		chapterTitle: {
			color: currentTheme.text,
			fontSize: 16,
		},
		chapterDate: {
			fontSize: 14,
			color: currentTheme.text2,
		},
		favoriteButton: {
			padding: 10,
			backgroundColor: colors.accent,
			alignItems: "center",
			marginVertical: 10,
			borderRadius: 5,
		},
		favoriteButtonText: {
			color: "#fff",
			fontSize: 16,
			fontWeight: "bold",
		},
		loadMoreButton: {
			padding: 10,
			backgroundColor: colors.accent,
			alignItems: "center",
			marginVertical: 10,
			borderRadius: 5,
		},
		loadMoreText: {
			color: "#fff",
			fontSize: 16,
		},
	});

	const fetchMangaData = async () => {
		if (!hasMore) return;

		try {
			const response = await axios.get(
				`https://api.mangadex.org/manga/${manga.id}/feed`,
				{
					params: {
						translatedLanguage: ["en", "pl"],
						limit: 100,
						offset: (page - 1) * 100,
						order: { chapter: "asc" },
					},
				}
			);

			// Filter out chapters not hosted on MangaDex
			const filteredChapters = response.data.data.filter(
				(chapter) => chapter.attributes.pages > 0
			);

			setChapterList((prevChapters) => [...prevChapters, ...filteredChapters]);

			// If fewer than 100 chapters were returned, no more pages are available
			if (filteredChapters.length < 100) {
				setHasMore(false);
			} else {
				setPage((prevPage) => prevPage + 1);
			}
		} catch (error) {
			console.error("Error fetching manga data:", error);
		}
	};

	useEffect(() => {
		fetchMangaData();
		checkIfFavorite();
	}, []);

	const checkIfFavorite = async () => {
		const favorite = await isFavorite(manga.id);
		setIsFav(favorite);
	};

	const toggleFavorite = async () => {
		if (isFav) {
			await removeFavorite(manga.id);
			Alert.alert("Removed from Favorites");
		} else {
			await addFavorite(manga);
			Alert.alert("Added to Favorites");
		}
		setIsFav(!isFav);
	};

	const coverArt = manga.relationships.find((r) => r.type === "cover_art");
	const coverArtUri = coverArt
		? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`
		: "https://via.placeholder.com/100x150?text=No+Image";

	const renderItem = ({ item }) => (
		<TouchableOpacity
			style={styles.chapterItem}
			onPress={() => navigation.navigate("ChapterScreen", { chapter: item })}
		>
			<Text style={styles.chapterTitle}>
				Chapter {item.attributes.chapter}: {item.attributes.title || "No Title"}
			</Text>
			<Text style={styles.chapterDate}>
				Published: {new Date(item.attributes.publishAt).toDateString()}
			</Text>
		</TouchableOpacity>
	);

	const ListHeaderComponent = () => (
		<View style={styles.detailsContainer}>
			<Image source={{ uri: coverArtUri }} style={styles.coverImage} />
			<Text style={styles.title}>{manga.attributes.title.en}</Text>
			<Text style={styles.description}>{manga.attributes.description.en}</Text>
			<Text style={styles.year}>Year: {manga.attributes.year}</Text>
			<Text style={styles.status}>
				Status:{" "}
				{manga.attributes.status.charAt(0).toUpperCase() +
					manga.attributes.status.slice(1)}
			</Text>
			<TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
				<Text style={styles.favoriteButtonText}>
					{isFav ? "Remove from Favorites" : "Add to Favorites"}
				</Text>
			</TouchableOpacity>
			<Text style={styles.chaptersTitle}>Chapters:</Text>
		</View>
	);

	const renderFooter = () => {
		if (!hasMore) return null;

		return (
			<TouchableOpacity style={styles.loadMoreButton} onPress={fetchMangaData}>
				<Text style={styles.loadMoreText}>Load More Chapters</Text>
			</TouchableOpacity>
		);
	};

	return (
		<FlatList
			data={chapterList}
			ListHeaderComponent={ListHeaderComponent}
			ListFooterComponent={renderFooter}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
			contentContainerStyle={styles.container}
		/>
	);
};

export default MangaDetailsScreen;
