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
  Animated,
  Modal,
} from "react-native";

const CustomAlert = ({ visible, type, message, onClose }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const backgroundColor = type === "success" ? "#4CAF50" : "#FF6B6B";
  const icon = type === "success" ? "✓" : "⚠️";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={alertStyles.modalBackground}>
        <Animated.View
          style={[
            alertStyles.alertContainer,
            { backgroundColor },
            { transform: [{ scale: scaleValue }] },
          ]}
        >
          <Text style={alertStyles.icon}>{icon}</Text>
          <Text style={alertStyles.message}>{message}</Text>
          <TouchableOpacity
            style={[
              alertStyles.button,
              { backgroundColor: type === "success" ? "#45a049" : "#ff4444" },
            ]}
            onPress={onClose}
          >
            <Text style={alertStyles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const alertStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
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
  icon: {
    fontSize: 50,
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: "white",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomAlert;
