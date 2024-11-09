import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { Camera, CameraType, CameraView } from "expo-camera";
import * as Permissions from "expo-permissions";

const App = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const cameraRef = useRef(null);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");

    if (status === "granted") {
      setIsCameraActive(true);
    } else {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to monitor your eyes",
        [{ text: "OK" }]
      );
    }
  };

  const handleStartMonitoring = () => {
    requestCameraPermission();
  };

  const handleStopMonitoring = () => {
    setIsCameraActive(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isCameraActive ? (
        <View style={styles.content}>
          <Text style={styles.heading}>Welcome To Vision Guard</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleStartMonitoring}
          >
            <Text style={styles.buttonText}>Start Eye Monitoring</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CameraView style={styles.camera} facing={"front"}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  stopButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#ff4444",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default App;
