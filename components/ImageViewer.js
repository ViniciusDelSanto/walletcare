"use client"

import { View, Image, StyleSheet, TouchableOpacity, Modal, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"

const { width, height } = Dimensions.get("window")

export default function ImageViewer({ imageUri, style, onPress }) {
  const [modalVisible, setModalVisible] = useState(false)

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      setModalVisible(true)
    }
  }

  return (
    <>
      <TouchableOpacity onPress={handlePress} style={style}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <Image source={{ uri: imageUri }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 5,
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
})
