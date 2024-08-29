import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import MangaListScreen from "./MangaListScreen";
import MangaDetailsScreen from "./MangaDetailsScreen";
import SettingsScreen from "./SettingsScreen"; // Import your Settings screen

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MangaStack = () => (
	<Stack.Navigator>
		<Stack.Screen name="MangaList" component={MangaListScreen} />
		<Stack.Screen name="MangaDetails" component={MangaDetailsScreen} />
	</Stack.Navigator>
);

const AppNavigator = () => (
	<NavigationContainer>
		<Tab.Navigator>
			<Tab.Screen name="Manga" component={MangaStack} />
			<Tab.Screen name="Settings" component={SettingsScreen} />{" "}
			{/* Add Settings screen here */}
		</Tab.Navigator>
	</NavigationContainer>
);

export default AppNavigator;
