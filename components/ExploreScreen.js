import React, { useState, useEffect, useContext } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	StatusBar,
	Modal,
	Button,
	ScrollView,
	Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import Icon from "react-native-vector-icons/Ionicons";

const ExploreScreen = ({ navigation }) => {
	const { theme, colors, currentTheme, adultContentEnabled } =
		useContext(ThemeContext);
	const [tags, setTags] = useState([]);
	const [selectedTags, setSelectedTags] = useState([]);
	const [mangaList, setMangaList] = useState([]);
	const [sortOption, setSortOption] = useState("rating");

	const [sortOrder, setSortOrder] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showTags, setShowTags] = useState(false);
	const [offset, setOffset] = useState(0);

	const limit = 15; // Number of manga per page

	const styles = StyleSheet.create({
		button: {
			backgroundColor: colors.accent,
			color: colors.accent,
		},
		container: {
			flex: 1,
			backgroundColor: currentTheme.background,
			padding: 16,
		},
		tagGroup: {
			padding: 4,
			borderRightWidth: 1,
			borderRightColor: colors.accent,
		},
		tagGroup2: {
			marginVertical: 10,
			flexDirection: "row",
		},

		tagGroupTitle: {
			fontSize: 18,
			color: currentTheme.text,
			marginBottom: 10,
		},
		tagItem: {
			padding: 10,
			margin: 5,
			borderRadius: 8,
			backgroundColor: currentTheme.cardBackground,
			flex: 1,
			alignItems: "center",
		},
		tagText: {
			fontSize: 10,
			color: currentTheme.text,
		},
		selectedTagItem: {
			backgroundColor: colors.accent,
		},
		selectedTagText: {
			color: currentTheme.text,
		},
		modalView: {
			margin: 20,
			backgroundColor: currentTheme.background,
			borderRadius: 20,
			padding: 35,
			alignItems: "center",
			shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 2,
			},
			shadowOpacity: 0.25,
			shadowRadius: 4,
			elevation: 5,
		},
		button: {
			borderRadius: 10,
			padding: 10,
			elevation: 2,
			backgroundColor: colors.accent,
			marginVertical: 10,
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
		},
		buttonText: {
			fontSize: 16,
			color: currentTheme.text,
		},
		itemContainer: {
			flexDirection: "column",
			margin: 5,
			backgroundColor: currentTheme.cardBackground,
			borderRadius: 8,
			overflowX: "hidden",
			width: "30%",
		},
		coverImage: {
			height: 150,
			borderTopRightRadius: 8,
			borderTopLeftRadius: 8,
		},
		textContainer: {
			padding: 10,
			justifyContent: "center",
			alignItems: "center",
		},
		title: {
			fontSize: 14,
			color: currentTheme.text,
			textAlign: "center",
		},

		navGroup: {
			marginVertical: 10,
			flexDirection: "row",
			justifyContent: "space-evenly",
			alignItems: "center",
		},
		navButton: {
			height: 40,
			backgroundColor: colors.accent,
			padding: 4,
			paddingHorizontal: 8,
			borderRadius: 4,
			marginBottom: 0,
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
		},
		navButtonText: {
			fontSize: 20,
			color: currentTheme.text,
		},
		navPage: {
			backgroundColor: currentTheme.bars,
			fontSize: 20,
			color: currentTheme.text,
			padding: 4,
			paddingHorizontal: 14,
			borderRadius: 4,
		},
	});

	// Fetch Tags with Grouping
	useEffect(() => {
		const fetchTags = async () => {
			try {
				const response = await axios.get("https://api.mangadex.org/manga/tag");
				const groupedTags = response.data.data.reduce((groups, tag) => {
					const group = tag.attributes.group || "Other";
					if (!groups[group]) {
						groups[group] = [];
					}
					groups[group].push(tag);
					return groups;
				}, {});
				setTags(groupedTags);
			} catch (error) {
				console.error("Error fetching tags:", error);
			}
		};

		fetchTags();
	}, []);

	// Fetch Manga based on selected tags and pagination
	useEffect(() => {
		const fetchManga = async () => {
			try {
				const includedTags = selectedTags
					.map((tag) => `includedTags[]=${tag}`)
					.join("&");
				const url = `https://api.mangadex.org/manga?limit=${limit}&offset=${offset}&includes[]=cover_art${
					!adultContentEnabled
						? "&contentRating[]=safe&contentRating[]=suggestive"
						: "&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica"
				}&order[${sortOption}]=${
					sortOrder ? "asc" : "desc"
				}&${includedTags}&includedTagsMode=AND&excludedTagsMode=OR`;

				const response = await axios.get(url);
				setMangaList(response.data.data);
			} catch (error) {
				console.error(
					"Error fetching manga:",
					error.response ? error.response.data : error.message
				);
			}
		};

		fetchManga();
	}, [selectedTags, sortOption, sortOrder, offset]);

	const toggleTagSelection = (tagId) => {
		setSelectedTags((prevTags) =>
			prevTags.includes(tagId)
				? prevTags.filter((id) => id !== tagId)
				: [...prevTags, tagId]
		);
	};

	const renderTag = ({ item }) => (
		<TouchableOpacity
			style={[
				styles.tagItem,
				selectedTags.includes(item.id) && styles.selectedTagItem,
			]}
			onPress={() => toggleTagSelection(item.id)}
		>
			<Text
				style={[
					styles.tagText,
					selectedTags.includes(item.id) && styles.selectedTagText,
				]}
			>
				{item.attributes.name.en}
			</Text>
		</TouchableOpacity>
	);

	const renderTagGroups = () => {
		return Object.keys(tags).map((group) => (
			<View key={group} style={styles.tagGroup}>
				<Text style={styles.tagGroupTitle}>{group}</Text>
				<FlatList
					data={tags[group]}
					renderItem={renderTag}
					keyExtractor={(item) => item.id.toString()}
					numColumns={3}
				/>
			</View>
		));
	};

	const loadMoreManga = () => {
		setOffset((prevOffset) => prevOffset + limit);
	};

	const loadLessManga = () => {
		if (offset - limit >= 0) setOffset((prevOffset) => prevOffset - limit);
	};

	const renderMangaItem = ({ item }) => {
		// Fetch cover image URL
		const coverArt = item.relationships.find((rel) => rel.type === "cover_art");
		const coverArtUri = coverArt
			? `https://uploads.mangadex.org/covers/${item.id}/${coverArt.attributes.fileName}`
			: null;

		return (
			<TouchableOpacity
				onPress={() => navigation.navigate("MangaDetails", { manga: item })}
				style={styles.itemContainer}
			>
				{coverArtUri && (
					<Image source={{ uri: coverArtUri }} style={styles.coverImage} />
				)}
				<View style={styles.textContainer}>
					<Text numberOfLines={1} style={styles.title}>
						{item.attributes.title.en || item.attributes.title["ja-ro"]}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" style={styles.button} />

			<TouchableOpacity
				style={styles.button}
				onPress={() => setShowTags(!showTags)}
			>
				<Text style={styles.navButtonText}>
					{showTags ? "Hide Tags" : "Show Tags"}
				</Text>
			</TouchableOpacity>

			{showTags && (
				<ScrollView horizontal>
					<View style={styles.tagGroup}>
						<Text numberOfLines={1} style={styles.tagGroupTitle}>
							Sort
						</Text>
						<View style={styles.tagGroup2}>
							<Picker
								selectedValue={sortOption}
								style={{
									height: 30,
									width: 150,
									backgroundColor: currentTheme.bars,
									color: currentTheme.text,
									borderRadius: 8,
								}}
								onValueChange={(itemValue) => setSortOption(itemValue)}
							>
								<Picker.Item label="Rating" value="rating" />
								<Picker.Item label="Follows count" value="followedCount" />
								<Picker.Item
									label="New Chapters"
									value="latestUploadedChapter"
								/>
								<Picker.Item label="New Relese" value="createdAt" />

								{/* Add more sort options as needed */}
							</Picker>

							<Icon
								name={sortOrder ? "arrow-down" : "arrow-up"}
								size={50}
								color={colors.accent}
								onPress={() => setSortOrder(!sortOrder)}
							/>
						</View>
					</View>

					{renderTagGroups()}
				</ScrollView>
			)}

			<FlatList
				data={mangaList}
				renderItem={renderMangaItem}
				keyExtractor={(item) => item.id}
				numColumns={3} // Change here to use three columns
				onEndReachedThreshold={0.5}
				columnWrapperStyle={{ justifyContent: "space-between" }} // Add spacing between columns
			/>

			<View style={styles.navGroup}>
				<TouchableOpacity
					style={styles.navButton}
					onPress={() => loadLessManga()}
				>
					<Text style={styles.navButtonText}>Prev Page</Text>
				</TouchableOpacity>
				<Text style={styles.navPage}>{offset / 15 + 1}</Text>
				<TouchableOpacity
					style={styles.navButton}
					onPress={() => loadMoreManga()}
				>
					<Text style={styles.navButtonText}>Next Page</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default ExploreScreen;
