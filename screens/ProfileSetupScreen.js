"use client"

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import LoadingSpinner from "../components/LoadingSpinner"
import { showErrorAlert, showSuccessAlert } from "../components/Alert"
import { useState } from "react"
import { insertOrUpdateUserProfile } from "../database/database"
import { captureImage, pickImage, imageToBase64 } from "../utils/imageUtils"

export default function ProfileSetupScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    phone: "",
  })
  const [profileImage, setProfileImage] = useState(null)
  const [profileImageData, setProfileImageData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (
      formData.age &&
      (isNaN(formData.age) || Number.parseInt(formData.age) < 1 || Number.parseInt(formData.age) > 120)
    ) {
      newErrors.age = "Idade deve ser entre 1 e 120 anos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleImagePicker = () => {
    Alert.alert(
      "Escolher Foto",
      "Como deseja adicionar sua foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Câmera", onPress: handleCameraCapture },
        { text: "Galeria", onPress: handleGalleryPick },
      ],
      { cancelable: true },
    )
  }

  const handleCameraCapture = async () => {
    try {
      const image = await captureImage()
      if (image) {
        setProfileImage(image.uri)
        const base64 = await imageToBase64(image.uri)
        setProfileImageData(base64)
      }
    } catch (error) {
      console.error("Erro ao capturar imagem:", error)
      if (error.message.includes("Permissão")) {
        Alert.alert(
          "Permissão Necessária",
          "Para usar a câmera, é necessário permitir o acesso nas configurações do dispositivo.",
          [{ text: "OK", style: "default" }],
        )
      } else {
        showErrorAlert("Erro ao acessar câmera")
      }
    }
  }

  const handleGalleryPick = async () => {
    try {
      const image = await pickImage()
      if (image) {
        setProfileImage(image.uri)
        const base64 = await imageToBase64(image.uri)
        setProfileImageData(base64)
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error)
      if (error.message.includes("Permissão")) {
        Alert.alert(
          "Permissão Necessária",
          "Para acessar a galeria, é necessário permitir o acesso às fotos nas configurações do dispositivo.",
          [{ text: "OK", style: "default" }],
        )
      } else {
        showErrorAlert("Erro ao acessar galeria")
      }
    }
  }

  const handleRemoveImage = () => {
    Alert.alert("Remover Foto", "Deseja remover a foto de perfil?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          setProfileImage(null)
          setProfileImageData(null)
        },
      },
    ])
  }

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      showErrorAlert("Por favor, corrija os erros no formulário")
      return
    }

    setLoading(true)

    try {
      const profileData = {
        ...formData,
        age: formData.age ? Number.parseInt(formData.age) : null,
        profileImage: profileImageData,
      }

      await insertOrUpdateUserProfile(profileData)
      showSuccessAlert("Perfil criado com sucesso!")

      setTimeout(() => {
        navigation.replace("Home")
      }, 1500)
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      showErrorAlert("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Salvando perfil..." />
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="person-add" size={64} color="#0099cc" />
          <Text style={styles.title}>Bem-vindo ao WalletCare!</Text>
          <Text style={styles.subtitle}>Vamos configurar seu perfil para começar</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Foto de perfil */}
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
              {profileImage ? (
                <>
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="camera" size={32} color="#0099cc" />
                  <Text style={styles.imageText}>Adicionar Foto</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.imageHint}>
              {profileImage ? "Toque para alterar ou no X para remover" : "Toque para adicionar uma foto (opcional)"}
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Digite seu nome completo"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="seu@email.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Idade</Text>
              <TextInput
                style={[styles.input, errors.age && styles.inputError]}
                placeholder="Sua idade"
                value={formData.age}
                onChangeText={(value) => handleInputChange("age", value)}
                keyboardType="numeric"
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Botão de salvar */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Criar Perfil</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>Você pode alterar essas informações a qualquer momento na seção Perfil.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 40,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    padding: 20,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e6f7ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0099cc",
    borderStyle: "dashed",
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageText: {
    color: "#0099cc",
    fontSize: 12,
    marginTop: 5,
    fontWeight: "600",
  },
  imageHint: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 250,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#0099cc",
    borderRadius: 10,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
})
