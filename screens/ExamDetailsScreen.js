"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import BottomNavBar from "../components/BottomNavBar"
import ImageViewer from "../components/ImageViewer"
import LoadingSpinner from "../components/LoadingSpinner"
import { showConfirmAlert, showErrorAlert } from "../components/Alert"
import { useState, useEffect } from "react"
import { getExamById, deleteExam } from "../database/database"
import { base64ToUri } from "../utils/imageUtils"

export default function ExamDetailsScreen({ navigation, route }) {
  const { examId } = route.params
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imageUri, setImageUri] = useState(null)

  useEffect(() => {
    loadExamDetails()
  }, [examId])

  const loadExamDetails = async () => {
    try {
      setLoading(true)
      const examData = await getExamById(examId)

      if (!examData) {
        showErrorAlert("Exame não encontrado")
        navigation.goBack()
        return
      }

      setExam(examData)

      if (examData.image_data) {
        try {
          const uri = await base64ToUri(examData.image_data, `exam_${examId}.jpg`)
          setImageUri(uri)
        } catch (error) {
          console.error("Erro ao converter imagem:", error)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do exame:", error)
      showErrorAlert("Erro ao carregar exame")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExam = () => {
    showConfirmAlert("Excluir Exame", `Tem certeza que deseja excluir o exame "${exam.name}"?`, async () => {
      try {
        await deleteExam(examId)
        navigation.navigate("ExamsList")
      } catch (error) {
        console.error("Erro ao excluir exame:", error)
        showErrorAlert("Erro ao excluir exame")
      }
    })
  }

  const handleShareExam = async () => {
    try {
      const shareContent = {
        message: `Exame: ${exam.name}\nData: ${formatDate(exam.date)}${exam.doctor ? `\nMédico: Dr(a). ${exam.doctor}` : ""}${exam.clinic ? `\nClínica: ${exam.clinic}` : ""}`,
        title: "Compartilhar Exame",
      }

      await Share.share(shareContent)
    } catch (error) {
      console.error("Erro ao compartilhar:", error)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR")
    } catch {
      return dateString
    }
  }

  const getExamTypeInfo = (type) => {
    switch (type) {
      case "laboratorial":
        return { icon: "flask", label: "Exame Laboratorial", color: "#0099cc" }
      case "imagem":
        return { icon: "camera", label: "Exame de Imagem", color: "#ff9900" }
      default:
        return { icon: "document-text", label: "Exame", color: "#666" }
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando detalhes..." />
  }

  if (!exam) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
          <Text style={styles.errorText}>Exame não encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
        <BottomNavBar />
      </View>
    )
  }

  const typeInfo = getExamTypeInfo(exam.type)

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header do exame */}
        <View style={styles.headerContainer}>
          <View style={styles.examHeader}>
            <View style={[styles.typeIconContainer, { backgroundColor: `${typeInfo.color}15` }]}>
              <Ionicons name={typeInfo.icon} size={32} color={typeInfo.color} />
            </View>
            <View style={styles.examTitleContainer}>
              <Text style={styles.examTitle}>{exam.name}</Text>
              <Text style={styles.examType}>{typeInfo.label}</Text>
            </View>
          </View>

          {/* Botões de ação */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShareExam}>
              <Ionicons name="share-outline" size={20} color="#0099cc" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteExam}>
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações do exame */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Data do Exame</Text>
                <Text style={styles.infoValue}>{formatDate(exam.date)}</Text>
              </View>
            </View>

            {exam.doctor && (
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Médico Responsável</Text>
                  <Text style={styles.infoValue}>Dr(a). {exam.doctor}</Text>
                </View>
              </View>
            )}

            {exam.clinic && (
              <View style={styles.infoItem}>
                <Ionicons name="business-outline" size={20} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Clínica/Hospital</Text>
                  <Text style={styles.infoValue}>{exam.clinic}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Adicionado em</Text>
                <Text style={styles.infoValue}>{formatDate(exam.created_at)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Imagem do exame */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Documento</Text>
            <ImageViewer imageUri={imageUri} style={styles.examImage} />
          </View>
        )}

        {/* Botão de editar */}
        <View style={styles.editContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("SelectExam", {
                examId: exam.id,
                editMode: true,
                imageUri: imageUri,
              })
            }
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Editar Exame</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  headerContainer: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  examHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  examTitleContainer: {
    flex: 1,
  },
  examTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  examType: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoGrid: {
    gap: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  imageContainer: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  examImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  editContainer: {
    margin: 20,
    marginTop: 0,
  },
  editButton: {
    backgroundColor: "#0099cc",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginTop: 15,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: "#0099cc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
})
