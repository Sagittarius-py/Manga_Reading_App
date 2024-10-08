import React, { useContext } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native";
import { ThemeContext } from "./context/ThemeContext";
import Icon from "react-native-vector-icons/Ionicons"; // Importing Ionicons for tab icons
import { StatusBar } from "react-native";

import MangaListScreen from "./components/MangaListScreen";
import MangaDetailsScreen from "./components/MangaDetailsScreen";
import SettingsScreen from "./components/SettingsScreen";
import ChapterScreen from "./components/ChapterScreen";
import FavoritesScreen from "./components/FavoritesScreen";
import ExploreScreen from "./components/ExploreScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
	const { theme, colors, currentTheme } = useContext(ThemeContext);

	const styles = StyleSheet.create({
		tabBar: {
			backgroundColor: currentTheme.bars, // White background for the tab bar
			borderTopColor: "rgba(0, 0, 0, 0.1)", // Light border on top
			height: 60, // Height of the tab bar
			paddingBottom: 5,
			paddingTop: 5, // Padding at the bottom for better icon alignment
		},
		tabBarLabel: {
			fontSize: 12, // Font size for the labels
			marginBottom: 5, // Margin for spacing
		},
	});

	return (
		<Tab.Navigator
			initialRouteName="Home"
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarIcon: ({ focused, color, size }) => {
					let iconName;

					if (route.name === "Home") {
						iconName = focused ? "home" : "home-outline";
					} else if (route.name === "Favs") {
						iconName = focused ? "heart" : "heart-outline";
					} else if (route.name === "Settings") {
						iconName = focused ? "settings" : "settings-outline";
					} else if (route.name === "Search") {
						iconName = focused ? "search" : "search-outline";
					} else if (route.name === "Explore") {
						iconName = focused ? "compass" : "compass-outline";
					}

					return <Icon name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: colors.accent, // Active tab color
				tabBarInactiveTintColor: "gray", // Inactive tab color
				tabBarStyle: styles.tabBar, // Tab bar styles
				tabBarLabelStyle: styles.tabBarLabel, // Label styles
				initialRouteName: "Home",
			})}
		>
			<Tab.Screen name="Explore" component={ExploreScreen} />

			<Tab.Screen name="Home" component={MangaListScreen} />
			<Tab.Screen name="Favs" component={FavoritesScreen} />
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	);
};

const App = () => (
	<>
		<StatusBar />
		<ThemeProvider>
			<NavigationContainer>
				<Stack.Navigator
					screenOptions={{
						headerShown: false, // Hide the header by default
					}}
				>
					<Stack.Screen name="Tabs" component={BottomTabNavigator} />
					<Stack.Screen name="MangaDetails" component={MangaDetailsScreen} />
					<Stack.Screen name="Settings" component={SettingsScreen} />
					<Stack.Screen name="ChapterScreen" component={ChapterScreen} />

					<Stack.Screen name="Favs" component={FavoritesScreen} />
					<Stack.Screen name="Explore" component={ExploreScreen} />
				</Stack.Navigator>
			</NavigationContainer>
		</ThemeProvider>
	</>
);

export default App;
