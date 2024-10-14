import { AppRegistry } from "react-native";
import App from "./App"; // Assumes your main component is in App.js
import { name as appName } from "./app.json"; // Loads the app name from app.json

AppRegistry.registerComponent(appName, () => App);
