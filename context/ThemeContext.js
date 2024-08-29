import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const themes = {
	light: {
		background: "#ffffff",
		bars: "#e0e0e0",
		text: "#18181b",
		text2: "#282828",
		header: "#e0e0e0",
		cardBackground: "",
	},
	dark: {
		background: "#27272A",
		bars: "#18181b",
		text: "#e0e0e0",
		text2: "#777777",
		header: "#2d2d2d",
		cardBackground: "#18181b",
	},
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState("light");
	const [colors, setColors] = useState({
		header: "#f8f8f8",
		accent: "#FF5733", // Default accent color
	});
	const [adultContentEnabled, setAdultContentEnabled] = useState(false);

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const storedTheme = await AsyncStorage.getItem("theme");
				const storedColors = await AsyncStorage.getItem("colors");
				const storedAdultContent = await AsyncStorage.getItem(
					"adultContentEnabled"
				);

				if (storedTheme) setTheme(storedTheme);
				if (storedColors) setColors(JSON.parse(storedColors));
				if (storedAdultContent !== null)
					setAdultContentEnabled(JSON.parse(storedAdultContent));
			} catch (error) {
				console.error("Failed to load settings:", error);
			}
		};

		loadSettings();
	}, []);

	const saveSettings = async (newTheme, newColors, adultContent) => {
		try {
			await AsyncStorage.setItem("theme", newTheme);
			await AsyncStorage.setItem("colors", JSON.stringify(newColors));
			await AsyncStorage.setItem(
				"adultContentEnabled",
				JSON.stringify(adultContent)
			);
		} catch (error) {
			console.error("Failed to save settings:", error);
		}
	};

	const toggleTheme = (newTheme) => {
		setTheme(newTheme);
		saveSettings(newTheme, colors, adultContentEnabled);
	};

	const updateColors = (newColors) => {
		setColors(newColors);
		saveSettings(theme, newColors, adultContentEnabled);
	};

	const toggleAdultContent = () => {
		const newAdultContentEnabled = !adultContentEnabled;
		setAdultContentEnabled(newAdultContentEnabled);
		saveSettings(theme, colors, newAdultContentEnabled);
	};

	const value = {
		theme,
		colors,
		toggleTheme,
		updateColors,
		currentTheme: themes[theme],
		adultContentEnabled,
		toggleAdultContent,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
};
