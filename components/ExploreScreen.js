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

const ExploreScreen = ({ navigation }) => {
	const { theme, colors, currentTheme } = useContext(ThemeContext);
	const [tags, setTags] = useState([]);
	const [selectedTags, setSelectedTags] = useState([]);
	const [mangaList, setMangaList] = useState([]);
	const [sortOption, setSortOption] = useState("rating");
	const [modalVisible, setModalVisible] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showTags, setShowTags] = useState(false);
	const [offset, setOffset] = useState(0);

	const limit = 32; // Number of manga per page

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: currentTheme.background,
			padding: 16,
		},
		tagGroup: {
			marginVertical: 10,
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
			backgroundColor: currentTheme.bars,
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
		},
		buttonText: {
			fontSize: 16,
			color: currentTheme.text,
		},
		itemContainer: {
			flexDirection: "row",
			marginVertical: 10,
			backgroundColor: colors.accent,
			borderRadius: 8,
			overflow: "hidden",
		},
		coverImage: {
			width: 100,
			height: 150,
		},
		textContainer: {
			flex: 1,
			padding: 10,
			justifyContent: "center",
		},
		title: {
			fontSize: 18,
			color: currentTheme.text,
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
				const url = `https://api.mangadex.org/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&${includedTags}&includedTagsMode=AND&excludedTagsMode=OR`;
				console.log("Fetching manga with URL:", url);

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
	}, [selectedTags, sortOption, offset]);

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
						{item.attributes.title.en}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />

			<Button
				title={showTags ? "Hide Tags" : "Show Tags"}
				onPress={() => setShowTags(!showTags)}
			/>

			{showTags && <ScrollView>{renderTagGroups()}</ScrollView>}

			<Button title="Sort Options" onPress={() => setModalVisible(true)} />

			<FlatList
				data={mangaList}
				renderItem={renderMangaItem}
				keyExtractor={(item) => item.id}
				onEndReached={loadMoreManga}
				onEndReachedThreshold={0.5}
			/>

			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalView}>
					<Text style={styles.buttonText}>Sort by</Text>
					<Picker
						selectedValue={sortOption}
						style={{ height: 50, width: 150 }}
						onValueChange={(itemValue) => setSortOption(itemValue)}
					>
						<Picker.Item label="Rating" value="rating" />
						<Picker.Item label="Latest" value="createdAt" />
						{/* Add more sort options as needed */}
					</Picker>
					<TouchableOpacity
						style={styles.button}
						onPress={() => setModalVisible(false)}
					>
						<Text style={styles.buttonText}>Close</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		</View>
	);
};

export default ExploreScreen;
