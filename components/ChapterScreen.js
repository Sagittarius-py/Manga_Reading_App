import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Image,
	ActivityIndicator,
	Dimensions,
} from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const ChapterScreen = () => {
	const route = useRoute();

	const { chapter } = route.params; // Get chapter ID from navigation parameters

	const chapterId = chapter.id;

	const [pages, setPages] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchChapterPages = async () => {
			try {
				const response = await axios.get(
					`https://api.mangadex.org/at-home/server/${chapterId}`
				);

				const baseUrl = response.data.baseUrl;
				const chapterData = response.data.chapter;

				const imageUrls = chapterData.data.map(
					(fileName) => `${baseUrl}/data/${chapterData.hash}/${fileName}`
				);

				setPages(imageUrls);
			} catch (error) {
				console.error("Error fetching chapter pages:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchChapterPages();
	}, [chapterId]);

	const renderItem = ({ item }) => (
		<Image
			source={{ uri: item }}
			style={styles.pageImage}
			resizeMode="contain"
		/>
	);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#000" />
			</View>
		);
	}

	return (
		<FlatList
			data={pages}
			renderItem={renderItem}
			keyExtractor={(item, index) => index.toString()}
			contentContainerStyle={styles.container}
		/>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#1c1d22",
		paddingVertical: 10,
	},
	pageImage: {
		// width: "100%",
		height: 600, // Adjust as needed based on your image dimensions
		width: windowWidth,
		marginBottom: 10,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#1c1d22",
	},
});

export default ChapterScreen;
