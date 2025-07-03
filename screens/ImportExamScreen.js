import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import BottomNavBar from "../components/BottomNavBar"
import { captureImage, pickImage } from "../utils/imageUtils"
import { showErrorAlert } from "../components/Alert"

export default function ImportExamScreen({ navigation }) {
  const handleCameraCapture = async () => {
    try {
      const image = await captureImage()
      if (image) {
        navigation.navigate("SelectExam", {
          imageUri: image.uri,
          imageType: "camera",
        })
      }
    } catch (error) {
      console.error("Erro ao capturar imagem:", error)
      if (error.message.includes("Permissão")) {
        Alert.alert("Permissão Necessária", "Para fotografar exames, é necessário permitir o acesso à câmera.", [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Configurações",
            onPress: () => {
            },
          },
        ])
      } else {
        showErrorAlert("Erro ao acessar a câmera")
      }
    }
  }

  const handleGalleryPick = async () => {
    try {
      const image = await pickImage()
      if (image) {
        navigation.navigate("SelectExam", {
          imageUri: image.uri,
          imageType: "gallery",
        })
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error)
      if (error.message.includes("Permissão")) {
        Alert.alert("Permissão Necessária", "Para importar da galeria, é necessário permitir o acesso às fotos.", [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Configurações",
            onPress: () => {
            },
          },
        ])
      } else {
        showErrorAlert("Erro ao acessar a galeria")
      }
    }
  }

  const handleManualEntry = () => {
    navigation.navigate("SelectExam", {
      imageUri: null,
      imageType: "manual",
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Ionicons name="add-circle-outline" size={64} color="#0099cc" />
          <Text style={styles.title}>Adicionar Exame</Text>
          <Text style={styles.subtitle}>Escolha como deseja adicionar seu exame</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={[styles.optionButton, styles.primaryOption]} onPress={handleCameraCapture}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="camera" size={32} color="#fff" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Fotografar Exame</Text>
              <Text style={styles.optionDescription}>Use a câmera para capturar o documento</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionButton, styles.secondaryOption]} onPress={handleGalleryPick}>
            <View style={[styles.optionIconContainer, styles.secondaryIconContainer]}>
              <Ionicons name="images" size={32} color="#0099cc" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, styles.secondaryTitle]}>Importar da Galeria</Text>
              <Text style={[styles.optionDescription, styles.secondaryDescription]}>
                Selecione uma foto já existente
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#0099cc" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionButton, styles.tertiaryOption]} onPress={handleManualEntry}>
            <View style={[styles.optionIconContainer, styles.tertiaryIconContainer]}>
              <Ionicons name="create" size={32} color="#666" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, styles.tertiaryTitle]}>Entrada Manual</Text>
              <Text style={[styles.optionDescription, styles.tertiaryDescription]}>
                Digite as informações manualmente
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Dicas para melhor qualidade:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
            <Text style={styles.tipText}>Certifique-se de que o documento está bem iluminado</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
            <Text style={styles.tipText}>Mantenha a câmera estável para evitar borrões</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
            <Text style={styles.tipText}>Enquadre todo o documento na foto</Text>
          </View>
        </View>
      </View>

      <BottomNavBar />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryOption: {
    backgroundColor: "#0099cc",
  },
  secondaryOption: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0099cc",
  },
  tertiaryOption: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  secondaryIconContainer: {
    backgroundColor: "#e6f7ff",
  },
  tertiaryIconContainer: {
    backgroundColor: "#f5f5f5",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  secondaryTitle: {
    color: "#0099cc",
  },
  tertiaryTitle: {
    color: "#333",
  },
  optionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  secondaryDescription: {
    color: "#666",
  },
  tertiaryDescription: {
    color: "#666",
  },
  tipsContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
})
