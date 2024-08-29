// CustomTabBar.js
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigationState } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const CustomTabBar = ({ state, descriptors, navigation }) => {
	const { bottom } = useSafeAreaInsets();

	return (
		<View style={[styles.tabBar, { paddingBottom: bottom }]}>
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
				const isFocused = state.index === index;

				const onPress = () => {
					navigation.navigate(route.name);
				};

				return (
					<TouchableOpacity
						key={route.key}
						onPress={onPress}
						style={[styles.tabItem, index === 1 && styles.middleTab]}
					>
						<Icon
							name={getIconName(route.name, isFocused)}
							size={24}
							color={isFocused ? "blue" : "gray"}
						/>
						<Text style={{ color: isFocused ? "blue" : "gray" }}>{label}</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const getIconName = (routeName, isFocused) => {
	switch (routeName) {
		case "Home":
			return isFocused ? "home" : "home-outline";
		case "Favs":
			return isFocused ? "heart" : "heart-outline";
		case "Settings":
			return isFocused ? "settings" : "settings-outline";
		default:
			return "home-outline";
	}
};

const styles = StyleSheet.create({
	tabBar: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderTopColor: "rgba(0, 0, 0, 0.1)",
		height: 60,
	},
	tabItem: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 10,
	},
	middleTab: {
		flex: 1.5,
	},
});

export default CustomTabBar;
