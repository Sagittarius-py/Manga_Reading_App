import React, { useState, useEffect } from "react";
import {
	View,
	StyleSheet,
	ActivityIndicator,
	Dimensions,
	Modal,
	Text,
	TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import ImageViewer from "react-native-image-zoom-viewer";

const windowWidth = Dimensions.get("window").width;

const ChapterScreen = () => {
	const route = useRoute();
	const navigation = useNavigation(); // Navigation to allow leaving the chapter
	const { chapter } = route.params;
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

				// Update imageUrls to follow the format ImageViewer expects
				const imageUrls = chapterData.data.map((fileName) => ({
					url: `${baseUrl}/data/${chapterData.hash}/${fileName}`,
					width: windowWidth, // Default width (can be adjusted later if needed)
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

	// Function to navigate back/leave the chapter
	const leaveChapter = () => {
		navigation.goBack(); // This will navigate back to the previous screen
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#000" />
			</View>
		);
	}

	return (
		<Modal visible={true} transparent={true}>
			<ImageViewer
				imageUrls={pages} // Ensure the format is correct for ImageViewer
				enableSwipeDown={true} // Allow swipe down to close
				backgroundColor="#1c1d22"
			/>

			{/* Bottom Navigation Bar */}
			<View style={styles.bottomNavBar}>
				<TouchableOpacity style={styles.navButton} onPress={leaveChapter}>
					<Text style={styles.navButtonText}>Leave Chapter</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#1c1d22",
	},
	bottomNavBar: {
		position: "absolute",
		bottom: 0,
		width: "100%",
		backgroundColor: "#333", // Dark background for the navbar
		paddingVertical: 10,
		flexDirection: "row",
		justifyContent: "space-around",
	},
	navButton: {
		padding: 10,
	},
	navButtonText: {
		color: "#fff", // White text for better visibility
		fontSize: 16,
	},
});

export default ChapterScreen;
