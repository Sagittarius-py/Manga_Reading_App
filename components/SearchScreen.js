import React, { useState, useContext } from "react";
import {
	View,
	TextInput,
	FlatList,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";

const SearchScreen = () => {
	const { theme, colors, currentTheme, adultContentEnabled } =
		useContext(ThemeContext);
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const navigation = useNavigation();

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: currentTheme.background,
			padding: 20,
		},
		input: {
			height: 40,
			borderColor: currentTheme.text,
			borderWidth: 1,
			borderRadius: 8,
			paddingHorizontal: 10,
			color: currentTheme.text,
			marginBottom: 20,
		},
		itemContainer: {
			flexDirection: "row",
			alignItems: "center",
			padding: 10,
			marginBottom: 10,
			borderRadius: 8,
			backgroundColor: currentTheme.cardBackground,
		},
		coverImage: {
			width: 50,
			height: 75,
			borderRadius: 8,
		},
		textContainer: {
			flex: 1,
			marginLeft: 10,
		},
		title: {
			fontSize: 16,
			fontWeight: "bold",
			color: currentTheme.text,
		},
	});

	const handleSearch = async () => {
		if (!query) return;
		setLoading(true);
		try {
			const response = await axios.get(
				`https://api.mangadex.org/manga?title=${encodeURIComponent(
					query
				)}&limit=10&includes[]=cover_art${
					!adultContentEnabled
						? "&contentRating[]=safe&contentRating[]=suggestive"
						: ""
				}`
			);
			setSearchResults(response.data.data);
		} catch (error) {
			console.error("Error searching manga:", error);
		} finally {
			setLoading(false);
		}
	};

	const renderItem = ({ item }) => {
		const coverArt = item.relationships.find((r) => r.type === "cover_art");
		const coverArtUri = coverArt
			? `https://uploads.mangadex.org/covers/${item.id}/${coverArt.attributes.fileName}`
			: "https://via.placeholder.com/100x150?text=No+Image";

		return (
			<TouchableOpacity
				onPress={() => navigation.navigate("MangaDetails", { manga: item })}
				style={styles.itemContainer}
			>
				<Image source={{ uri: coverArtUri }} style={styles.coverImage} />
				<View style={styles.textContainer}>
					<Text style={styles.title}>{item.attributes.title.en}</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				placeholder="Search manga..."
				placeholderTextColor={currentTheme.text}
				value={query}
				onChangeText={setQuery}
				onSubmitEditing={handleSearch}
			/>
			{loading ? (
				<ActivityIndicator size="large" color={currentTheme.text} />
			) : (
				<FlatList
					data={searchResults}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
				/>
			)}
		</View>
	);
};

export default SearchScreen;
