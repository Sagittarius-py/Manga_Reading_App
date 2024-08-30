import React, { useState, useEffect } from "react";
import {
	View,
	StyleSheet,
	FlatList,
	Image,
	ActivityIndicator,
	Dimensions,
} from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

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

	// Function to handle image loading and update dimensions
	const onImageLoad = (width, height, index) => {
		setPages((prevPages) =>
			prevPages.map((item, i) =>
				i === index ? { uri: item, width, height } : item
			)
		);
	};

	const renderItem = ({ item, index }) => {
		const imageSource = item.uri || item;
		const imageStyle = {
			width: windowWidth,
			marginTop: 10,
			height: windowWidth * (item.height / item.width) || windowWidth, // Dynamically adjust height
		};

		return (
			<Image
				source={{ uri: imageSource }}
				style={imageStyle}
				resizeMode="contain"
				onLoad={({ nativeEvent: { source } }) =>
					onImageLoad(source.width, source.height, index)
				}
			/>
		);
	};

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
		flexDirection: "column",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#1c1d22",
	},
});

export default ChapterScreen;
