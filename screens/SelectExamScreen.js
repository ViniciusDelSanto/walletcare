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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import BottomNavBar from "../components/BottomNavBar"
import ImageViewer from "../components/ImageViewer"
import LoadingSpinner from "../components/LoadingSpinner"
import { showErrorAlert, showSuccessAlert } from "../components/Alert"
import { useState, useEffect } from "react"
import { imageToBase64 } from "../utils/imageUtils"
import { insertExam, updateExam, getExamById } from "../database/database"

export default function SelectExamScreen({ navigation, route }) {
  const { imageUri, imageType, examId, editMode } = route.params || {}

  const [formData, setFormData] = useState({
    name: "",
    doctor: "",
    date: new Date().toISOString().split("T")[0],
    clinic: "",
    type: "laboratorial",
    description: "", // Added description field to form state
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editMode && examId) {
      loadExamData()
    }
  }, [editMode, examId])

  const loadExamData = async () => {
    try {
      setLoading(true)
      const exam = await getExamById(examId)
      if (exam) {
        setFormData({
          name: exam.name || "",
          doctor: exam.doctor || "",
          date: exam.date || new Date().toISOString().split("T")[0],
          clinic: exam.clinic || "",
          type: exam.type || "laboratorial",
          description: exam.description || "", // Added description to loaded data
        })
      }
    } catch (error) {
      console.error("Erro ao carregar dados do exame:", error)
      showErrorAlert("Erro ao carregar dados do exame")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome do exame é obrigatório"
    }

    if (!formData.date.trim()) {
      newErrors.date = "Data é obrigatória"
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (formData.date && !dateRegex.test(formData.date)) {
      newErrors.date = "Formato de data inválido (AAAA-MM-DD)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const formatDateForDisplay = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR")
    } catch {
      return dateString
    }
  }

  const handleConfirmExam = async () => {
    if (!validateForm()) {
      showErrorAlert("Por favor, corrija os erros no formulário")
      return
    }

    setLoading(true)

    try {
      let imageData = null

      if (imageUri) {
        imageData = await imageToBase64(imageUri)
      }

      const examData = {
        ...formData,
        imageData,
      }

      if (editMode && examId) {
        await updateExam(examId, examData)
        showSuccessAlert("Exame atualizado com sucesso!")
        navigation.navigate("ExamDetails", { examId })
      } else {
        const newExamId = await insertExam(examData)
        showSuccessAlert("Exame adicionado com sucesso!")
        navigation.navigate("ExamDetails", { examId: newExamId })
      }
    } catch (error) {
      console.error("Erro ao salvar exame:", error)
      showErrorAlert("Erro ao salvar exame. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message={editMode ? "Carregando dados..." : "Salvando exame..."} />
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{editMode ? "Editar Exame" : "Informações do Exame"}</Text>

          {/* Visualização da imagem se houver */}
          {imageUri && (
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>Imagem do Exame:</Text>
              <ImageViewer imageUri={imageUri} style={styles.examImage} />
            </View>
          )}

          {/* Formulário */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Exame *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Ex: Hemograma Completo"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Médico(a)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do médico responsável"
                value={formData.doctor}
                onChangeText={(value) => handleInputChange("doctor", value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data do Exame *</Text>
              <TextInput
                style={[styles.input, errors.date && styles.inputError]}
                placeholder="AAAA-MM-DD"
                value={formData.date}
                onChangeText={(value) => handleInputChange("date", value)}
                keyboardType="numeric"
              />
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              <Text style={styles.helperText}>Formato: {formatDateForDisplay(formData.date)}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Clínica/Hospital</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da clínica ou hospital"
                value={formData.clinic}
                onChangeText={(value) => handleInputChange("clinic", value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Exame</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, formData.type === "laboratorial" && styles.typeButtonActive]}
                  onPress={() => handleInputChange("type", "laboratorial")}
                >
                  <Ionicons name="flask" size={20} color={formData.type === "laboratorial" ? "#fff" : "#0099cc"} />
                  <Text
                    style={[styles.typeButtonText, formData.type === "laboratorial" && styles.typeButtonTextActive]}
                  >
                    Laboratorial
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeButton, formData.type === "imagem" && styles.typeButtonActive]}
                  onPress={() => handleInputChange("type", "imagem")}
                >
                  <Ionicons name="camera" size={20} color={formData.type === "imagem" ? "#fff" : "#0099cc"} />
                  <Text style={[styles.typeButtonText, formData.type === "imagem" && styles.typeButtonTextActive]}>
                    Imagem
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva detalhes sobre o exame, observações, resultados, etc."
                value={formData.description}
                onChangeText={(value) => handleInputChange("description", value)}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Botões de ação */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmExam}>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>{editMode ? "Atualizar" : "Confirmar"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar />
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
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  imageContainer: {
    marginBottom: 25,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  examImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
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
  helperText: {
    color: "#666",
    fontSize: 14,
    marginTop: 5,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0099cc",
    backgroundColor: "#fff",
  },
  typeButtonActive: {
    backgroundColor: "#0099cc",
  },
  typeButtonText: {
    color: "#0099cc",
    fontWeight: "600",
    marginLeft: 8,
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#0099cc",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
})
