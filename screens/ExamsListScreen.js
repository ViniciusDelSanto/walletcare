"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, RefreshControl, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import BottomNavBar from "../components/BottomNavBar"
import LoadingSpinner from "../components/LoadingSpinner"
import { showConfirmAlert, showErrorAlert } from "../components/Alert"
import { useState, useEffect } from "react"
import { getAllExams, deleteExam } from "../database/database"
import { base64ToUri } from "../utils/imageUtils"

export default function ExamsListScreen({ navigation, route }) {
  const { examType } = route.params || {}
  const [exams, setExams] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [selectedType, setSelectedType] = useState(examType || "all")
  const [examImages, setExamImages] = useState({})

  useEffect(() => {
    loadExams()

    const unsubscribe = navigation.addListener("focus", () => {
      loadExams()
    })

    return unsubscribe
  }, [navigation])

  useEffect(() => {
    filterExams()
  }, [searchText, exams, selectedType])

  useEffect(() => {
    if (examType) {
      setSelectedType(examType)
    }
  }, [examType])

  const loadExams = async () => {
    try {
      setLoading(true)
      const examsList = await getAllExams()
      setExams(examsList)

      const images = {}
      for (const exam of examsList) {
        if (exam.image_data) {
          try {
            const uri = await base64ToUri(exam.image_data, `exam_${exam.id}.jpg`)
            images[exam.id] = uri
          } catch (error) {
            console.error(`Erro ao carregar imagem do exame ${exam.id}:`, error)
          }
        }
      }
      setExamImages(images)
    } catch (error) {
      console.error("Erro ao carregar exames:", error)
      showErrorAlert("Erro ao carregar exames")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filterExams = () => {
    let filtered = [...exams] 

    if (selectedType !== "all") {
      filtered = filtered.filter((exam) => {
        return exam.type === selectedType
      })
    }

    if (searchText.trim()) {
      filtered = filtered.filter(
        (exam) =>
          exam.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (exam.doctor && exam.doctor.toLowerCase().includes(searchText.toLowerCase())) ||
          (exam.clinic && exam.clinic.toLowerCase().includes(searchText.toLowerCase())),
      )
    }

    setFilteredExams(filtered)
  }

  const handleDeleteExam = (examId, examName) => {
    showConfirmAlert("Excluir Exame", `Tem certeza que deseja excluir o exame "${examName}"?`, async () => {
      try {
        await deleteExam(examId)
        loadExams()
      } catch (error) {
        console.error("Erro ao excluir exame:", error)
        showErrorAlert("Erro ao excluir exame")
      }
    })
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadExams()
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR")
    } catch {
      return dateString
    }
  }

  const getExamTypeIcon = (type) => {
    switch (type) {
      case "laboratorial":
        return "flask"
      case "imagem":
        return "camera"
      default:
        return "document-text"
    }
  }

  const getExamTypeLabel = (type) => {
    switch (type) {
      case "laboratorial":
        return "Laboratorial"
      case "imagem":
        return "Imagem"
      default:
        return "Exame"
    }
  }

  const getLabCount = () => exams.filter((exam) => exam.type === "laboratorial").length
  const getImageCount = () => exams.filter((exam) => exam.type === "imagem").length

  const handleFilterChange = (newType) => {
    setSelectedType(newType)
    setSearchText("") 
  }

  if (loading) {
    return <LoadingSpinner message="Carregando exames..." />
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header com filtros */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Meus Exames</Text>

          {/* Botões de filtro por tipo */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, selectedType === "all" && styles.filterButtonActive]}
              onPress={() => handleFilterChange("all")}
            >
              <Ionicons name="list" size={16} color={selectedType === "all" ? "#fff" : "#0099cc"} />
              <Text style={[styles.filterButtonText, selectedType === "all" && styles.filterButtonTextActive]}>
                Todos ({exams.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedType === "laboratorial" && styles.filterButtonActive]}
              onPress={() => handleFilterChange("laboratorial")}
            >
              <Ionicons name="flask" size={16} color={selectedType === "laboratorial" ? "#fff" : "#0099cc"} />
              <Text style={[styles.filterButtonText, selectedType === "laboratorial" && styles.filterButtonTextActive]}>
                Lab ({getLabCount()})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedType === "imagem" && styles.filterButtonActive]}
              onPress={() => handleFilterChange("imagem")}
            >
              <Ionicons name="camera" size={16} color={selectedType === "imagem" ? "#fff" : "#0099cc"} />
              <Text style={[styles.filterButtonText, selectedType === "imagem" && styles.filterButtonTextActive]}>
                Imagem ({getImageCount()})
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{filteredExams.length} exame(s) encontrado(s)</Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome, médico ou clínica..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Lista de exames */}
        <ScrollView
          style={styles.examsList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredExams.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {searchText
                  ? "Nenhum exame encontrado"
                  : selectedType === "all"
                    ? "Nenhum exame cadastrado"
                    : `Nenhum exame ${getExamTypeLabel(selectedType).toLowerCase()} cadastrado`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText ? "Tente buscar com outros termos" : "Adicione seu primeiro exame tocando no botão abaixo"}
              </Text>
            </View>
          ) : (
            filteredExams.map((exam) => (
              <View key={exam.id} style={styles.examCard}>
                <TouchableOpacity
                  style={styles.examContent}
                  onPress={() => navigation.navigate("ExamDetails", { examId: exam.id })}
                >
                  <View style={styles.examHeader}>
                    <View style={styles.examIconContainer}>
                      <Ionicons name={getExamTypeIcon(exam.type)} size={24} color="#0099cc" />
                    </View>
                    <View style={styles.examInfo}>
                      <Text style={styles.examName}>{exam.name}</Text>
                      <Text style={styles.examDate}>{formatDate(exam.date)}</Text>
                      <Text style={styles.examType}>{getExamTypeLabel(exam.type)}</Text>
                    </View>

                    {/* Exibir imagem se houver */}
                    {examImages[exam.id] && (
                      <View style={styles.examImageContainer}>
                        <Image source={{ uri: examImages[exam.id] }} style={styles.examThumbnail} />
                      </View>
                    )}

                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteExam(exam.id, exam.name)}>
                      <Ionicons name="trash-outline" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>

                  {(exam.doctor || exam.clinic) && (
                    <View style={styles.examDetails}>
                      {exam.doctor && (
                        <View style={styles.detailRow}>
                          <Ionicons name="person-outline" size={16} color="#0099cc" />
                          <Text style={styles.detailText}>Dr(a). {exam.doctor}</Text>
                        </View>
                      )}
                      {exam.clinic && (
                        <View style={styles.detailRow}>
                          <Ionicons name="business-outline" size={16} color="#0099cc" />
                          <Text style={styles.detailText}>{exam.clinic}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* Botão de adicionar */}
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("ImportExam")}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
  },
  headerContainer: {
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0099cc",
    backgroundColor: "#fff",
  },
  filterButtonActive: {
    backgroundColor: "#0099cc",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#0099cc",
    marginLeft: 4,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  examsList: {
    flex: 1,
    padding: 20,
  },
  examCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  examContent: {
    padding: 15,
  },
  examHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  examIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  examDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  examType: {
    fontSize: 12,
    color: "#0099cc",
    fontWeight: "600",
  },
  examImageContainer: {
    marginRight: 10,
  },
  examThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 5,
  },
  examDetails: {
    paddingLeft: 65,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  addButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0099cc",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
})
