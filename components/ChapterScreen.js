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
	const { chapter } = route.params;
	const chapterId = chapter.id;

	const [pages, setPages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingImageIndices, setLoadingImageIndices] = useState(new Set());

	useEffect(() => {
		const fetchChapterPages = async () => {
			try {
				const response = await axios.get(
					`https://api.mangadex.org/at-home/server/${chapterId}`
				);

				const baseUrl = response.data.baseUrl;
				const chapterData = response.data.chapter;

				const imageUrls = chapterData.data.map((fileName) => ({
					uri: `${baseUrl}/data/${chapterData.hash}/${fileName}`,
					width: windowWidth,
					height: windowWidth, // Initial height, will be updated later
				}));

				setPages(imageUrls);
			} catch (error) {
				console.error("Error fetching chapter pages:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchChapterPages();
	}, [chapterId]);

	const onImageLoad = (width, height, index) => {
		setPages((prevPages) =>
			prevPages.map((item, i) =>
				i === index ? { ...item, width, height } : item
			)
		);
		setLoadingImageIndices((prevIndices) => {
			const newIndices = new Set(prevIndices);
			newIndices.delete(index);
			return newIndices;
		});
	};

	const renderItem = ({ item, index }) => {
		const imageStyle = {
			width: "100%",
			marginTop: 10,
			height: item.width
				? windowWidth * (item.height / item.width)
				: windowWidth,
		};

		return (
			<View style={styles.imageContainer}>
				{loadingImageIndices.has(index) && (
					<ActivityIndicator
						size="large"
						color="#000"
						style={styles.imageLoader}
					/>
				)}
				<Image
					key={index.toString()}
					source={{ uri: item.uri }}
					style={imageStyle}
					onLoadStart={() =>
						setLoadingImageIndices((prev) => new Set(prev).add(index))
					}
					onLoad={({ nativeEvent: { source } }) =>
						onImageLoad(source.width, source.height, index)
					}
					onLoadEnd={() =>
						setLoadingImageIndices((prev) => {
							const newIndices = new Set(prev);
							newIndices.delete(index);
							return newIndices;
						})
					}
				/>
			</View>
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
	imageContainer: {
		position: "relative",
	},
	imageLoader: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default ChapterScreen;
