import React, { useState, useEffect, useContext } from "react";
import {
	View,
	ActivityIndicator,
	StyleSheet,
	Text,
	Button,
} from "react-native";
import MasonryList from "react-native-masonry-list"; // Masonry list for Pinterest-style layout
import axios from "axios";
import { ThemeContext } from "../../context/ThemeContext";

const PicturesScreen = () => {
	const { currentTheme } = useContext(ThemeContext);
	const [pictures, setPictures] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(0); // Current page for pagination
	const [hasMore, setHasMore] = useState(true); // To check if there are more images to load

	// Fetch images from Neko API
	const fetchPictures = async (pageNumber) => {
		let limit = 20;
		console.log(pageNumber);
		try {
			const response = await axios.get(
				`https://api.nekosapi.com/v3/images?limit=${limit}&offset=${
					pageNumber * limit
				}`
			);

			// Check if response and items are defined
			if (response.data && response.data.items) {
				// Filter images to only include those with a rating of "safe"
				const images = response.data.items
					.filter((item) => item.rating === "safe") // Filter for "safe" rating
					.map((item) => ({
						uri: item.image_url, // Use image_url for the full-size image
						title: item.rating, // Optionally add rating for additional info
					}));

				// If no images are found, set hasMore to false
				if (images.length === 0) {
					setHasMore(false);
				}

				// Update the pictures state
				setPictures((prevPictures) => [...prevPictures, ...images]);
			} else {
				setError("No images found.");
				setHasMore(false);
			}
		} catch (err) {
			setError(err.message || "Error fetching pictures");
		} finally {
			setLoading(false);
		}
	};

	// Initial fetch of images
	useEffect(() => {
		fetchPictures(page);
	}, [page]);

	const loadMorePictures = () => {
		if (hasMore) {
			setLoading(true); // Show loading indicator while fetching more
			setPage((prevPage) => prevPage + 1); // Increment page number
		}
	};

	const styles = StyleSheet.create({
		containera: {
			flex: 1,
			backgroundColor: currentTheme.background,
		},
		list: {
			backgroundColor: currentTheme.background,
		},
		loaderContainer: {
			backgroundColor: currentTheme.background,
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		},
		errorContainer: {
			backgroundColor: currentTheme.background, // Set background to currentTheme's background
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		},
		errorText: {
			fontSize: 16,
			color: "yellow",
		},
		imageContainer: {
			borderRadius: 8, // Rounded corners for images
			overflow: "hidden",
		},
		loadMoreButton: {
			margin: 20, // Add margin for spacing
		},
	});

	if (loading && page === 1) {
		return (
			<View style={styles.loaderContainer}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	return (
		<View style={styles.containera}>
			<MasonryList
				style={styles.list}
				images={pictures}
				onPressImage={(item, index) => {
					// Handle image click, if needed
					console.log("Image clicked:", item, index);
				}}
				columns={2} // Number of columns for the Pinterest-like layout
				imageContainerStyle={styles.imageContainer}
				spacing={2} // Space between images
			/>
			{hasMore && (
				<View style={styles.loadMoreButton}>
					<Button title="Load More" onPress={loadMorePictures} />
				</View>
			)}
		</View>
	);
};

export default PicturesScreen;
