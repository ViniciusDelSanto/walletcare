"use client"

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import BottomNavBar from "../components/BottomNavBar"
import LoadingSpinner from "../components/LoadingSpinner"
import { showErrorAlert, showSuccessAlert } from "../components/Alert"
import { useState, useEffect } from "react"
import { getUserProfile, insertOrUpdateUserProfile, getAllExams } from "../database/database"
import { captureImage, pickImage, imageToBase64, base64ToUri } from "../utils/imageUtils"

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    phone: "",
    profileImage: null,
  })
  const [examCount, setExamCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingProfile, setEditingProfile] = useState({})
  const [profileImageUri, setProfileImageUri] = useState(null)

  useEffect(() => {
    loadProfileData()
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadExamCount()
    })
    return unsubscribe
  }, [navigation])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      const [profileData, exams] = await Promise.all([getUserProfile(), getAllExams()])

      if (profileData) {
        setProfile(profileData)
        setEditingProfile(profileData)

        // Converter imagem base64 para URI se existir
        if (profileData.profile_image) {
          try {
            const uri = await base64ToUri(profileData.profile_image, "profile.jpg")
            setProfileImageUri(uri)
          } catch (error) {
            console.error("Erro ao carregar imagem do perfil:", error)
          }
        }
      }

      setExamCount(exams.length)
    } catch (error) {
      console.error("Erro ao carregar dados do perfil:", error)
      showErrorAlert("Erro ao carregar perfil")
    } finally {
      setLoading(false)
    }
  }

  const loadExamCount = async () => {
    try {
      const exams = await getAllExams()
      setExamCount(exams.length)
    } catch (error) {
      console.error("Erro ao carregar contagem de exames:", error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      if (!editingProfile.name?.trim()) {
        showErrorAlert("Nome é obrigatório")
        return
      }

      const profileData = {
        ...editingProfile,
        age: editingProfile.age ? Number.parseInt(editingProfile.age) : null,
      }

      await insertOrUpdateUserProfile(profileData)
      setProfile(profileData)
      setEditModalVisible(false)
      showSuccessAlert("Perfil atualizado com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      showErrorAlert("Erro ao salvar perfil")
    }
  }

  const handleImagePicker = () => {
    Alert.alert(
      "Alterar Foto",
      "Como deseja alterar sua foto de perfil?",
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
        await updateProfileImage(image.uri)
      }
    } catch (error) {
      console.error("Erro ao capturar imagem:", error)
      if (error.message.includes("Permissão")) {
        Alert.alert(
          "Permissão Necessária",
          "Para usar a câmera, é necessário permitir o acesso nas configurações do dispositivo.",
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
        await updateProfileImage(image.uri)
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error)
      if (error.message.includes("Permissão")) {
        Alert.alert(
          "Permissão Necessária",
          "Para acessar a galeria, é necessário permitir o acesso às fotos nas configurações do dispositivo.",
        )
      } else {
        showErrorAlert("Erro ao acessar galeria")
      }
    }
  }

  const updateProfileImage = async (imageUri) => {
    try {
      const base64Image = await imageToBase64(imageUri)
      const updatedProfile = {
        ...profile,
        profileImage: base64Image,
      }

      await insertOrUpdateUserProfile(updatedProfile)
      setProfile(updatedProfile)
      setEditingProfile(updatedProfile)
      setProfileImageUri(imageUri)

      showSuccessAlert("Foto atualizada com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error)
      showErrorAlert("Erro ao atualizar foto")
    }
  }

  const profileOptions = [
    {
      id: 1,
      title: "Meus Exames",
      subtitle: `${examCount} exame(s) cadastrado(s)`,
      icon: "document-text-outline",
      onPress: () => navigation.navigate("ExamsList"),
    },
    {
      id: 2,
      title: "Adicionar Exame",
      subtitle: "Fotografar ou importar novo exame",
      icon: "add-circle-outline",
      onPress: () => navigation.navigate("ImportExam"),
    },
    {
      id: 3,
      title: "Configurações",
      subtitle: "Notificações e preferências",
      icon: "settings-outline",
      onPress: () => showErrorAlert("Funcionalidade em desenvolvimento"),
    },
    {
      id: 4,
      title: "Backup dos Dados",
      subtitle: "Exportar dados para segurança",
      icon: "cloud-upload-outline",
      onPress: () => showErrorAlert("Funcionalidade em desenvolvimento"),
    },
    {
      id: 5,
      title: "Ajuda e Suporte",
      subtitle: "FAQ e contato",
      icon: "help-circle-outline",
      onPress: () => showErrorAlert("Funcionalidade em desenvolvimento"),
    },
    {
      id: 6,
      title: "Sobre o App",
      subtitle: "Versão 1.0.0",
      icon: "information-circle-outline",
      onPress: () => showErrorAlert("WalletCare v1.0.0\nDesenvolvido para gerenciar seus exames médicos"),
    },
  ]

  if (loading) {
    return <LoadingSpinner message="Carregando perfil..." />
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header do Perfil */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePicker}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.defaultProfileImage}>
                <Ionicons name="person" size={50} color="#0099cc" />
              </View>
            )}
            <View style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{profile.name || "Usuário"}</Text>
          {profile.email && <Text style={styles.userEmail}>{profile.email}</Text>}

          <TouchableOpacity style={styles.editProfileButton} onPress={() => setEditModalVisible(true)}>
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.editProfileText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas Rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{examCount}</Text>
            <Text style={styles.statLabel}>Exames</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Perfil</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Backups</Text>
          </View>
        </View>

        {/* Opções do Menu */}
        <View style={styles.menuContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.menuItem} onPress={option.onPress}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={option.icon} size={24} color="#0099cc" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{option.title}</Text>
                <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal de Edição */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editingProfile.name || ""}
                  onChangeText={(text) => setEditingProfile((prev) => ({ ...prev, name: text }))}
                  placeholder="Seu nome completo"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editingProfile.email || ""}
                  onChangeText={(text) => setEditingProfile((prev) => ({ ...prev, email: text }))}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Idade</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editingProfile.age?.toString() || ""}
                  onChangeText={(text) => setEditingProfile((prev) => ({ ...prev, age: text }))}
                  placeholder="Sua idade"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editingProfile.phone || ""}
                  onChangeText={(text) => setEditingProfile((prev) => ({ ...prev, phone: text }))}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

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
  },
  profileHeader: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e6f7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0099cc",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  editProfileButton: {
    backgroundColor: "#0099cc",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  editProfileText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 5,
  },
  statsContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingVertical: 20,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0099cc",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e6f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  bottomSpacing: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalCancelText: {
    color: "#666",
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalSaveText: {
    color: "#0099cc",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
})
