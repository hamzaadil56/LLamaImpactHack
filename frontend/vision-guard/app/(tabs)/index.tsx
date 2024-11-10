import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Image,
  Button,
} from "react-native";
import { Camera, CameraType, CameraView } from "expo-camera";
import * as Permissions from "expo-permissions";
import { launchCameraAsync } from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import CustomAlert from "@/components/CustomAlert";

const App = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState("");
  // ... (previous state declarations)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: "", message: "" });

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();

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

  const takeImageHandler = async () => {
    const image = await launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });
    setImagePreview(image?.assets[0]?.uri);
    console.log(image);
  };

  const askAI = async () => {
    if (!imagePreview) {
      Alert.alert("No image", "Please capture an image first.");
      return;
    }
    console.log(imagePreview);
    try {
      // Read the file as binary data
      setIsLoading(true);
      const fileUri = imagePreview;
      const fileName = fileUri.split("/").pop(); // Extract the file name from URI

      const fileBytes = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to byte array if needed, or send as-is if base64 is accepted
      const byteArray = Uint8Array.from(atob(fileBytes), (c) =>
        c.charCodeAt(0)
      );
      // const blob = new Blob([byteArray], { type: "image/jpeg" });
      const responseImg = await fetch(fileUri);
      const blob = await responseImg.blob();
      const formData = new FormData();
      formData.append("is_url", JSON.stringify(false));
      formData.append("image", {
        uri: fileUri,
        name: fileName,
        type: blob.type, // Set the MIME type of the image
      });

      const response = await fetch(
        "https://b9d8-223-29-232-28.ngrok-free.app/analyze-image/",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data", // or application/json, depending on backend
          },
          body: formData, // Send byte array directly in body
        }
      );

      const data = await response.json();
      if (data?.result === "Yes.") {
        setAlertConfig({
          type: "danger",
          message: "Thats enough screen time for you!",
        });
      } else if (data?.result === "No.") {
        setAlertConfig({
          type: "success",
          message: "All Okay. You are good to use your phone!",
        });
      }
      setAlertVisible(true);
      console.log(data);
      setAIResponse(data?.result);
    } catch (error) {
      console.error("Error uploading image:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isCameraActive ? (
        <View style={styles.content}>
          <Text style={styles.heading}>Welcome To Vision Guard</Text>
          <TouchableOpacity style={styles.button} onPress={takeImageHandler}>
            <Text style={styles.buttonText}>Test Eye</Text>
          </TouchableOpacity>
          <View>
            {imagePreview && (
              <View>
                <Image
                  source={{ uri: imagePreview }}
                  style={{ width: 300, height: 100 }}
                />
                <Button
                  title={
                    isLoading
                      ? "loading..."
                      : "Click To Here Ask AI About Your Eye"
                  }
                  onPress={askAI}
                />
              </View>
            )}
          </View>

          {aiResponse && (
            <View>
              <Text>
                {aiResponse === "Yes."
                  ? "Thats enough screen time for you"
                  : aiResponse === "No."
                  ? "All Ok! You are good to go."
                  : "Try Again"}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <CameraView style={styles.camera} facing={"front"}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleStopMonitoring}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleStopMonitoring}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </CameraView>
      )}
      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
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
    justifyContent: "center",
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
    width: 100, // Adjust size as needed
    height: 100,
    borderRadius: 50,
    elevation: 3,
    shadowColor: "#000",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#ff4444",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 20,
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
