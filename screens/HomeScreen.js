"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native"
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import BottomNavBar from "../components/BottomNavBar"
import { useState, useEffect } from "react"
import { getAllExams } from "../database/database"
import { getUserProfile } from "../database/database"
import { base64ToUri } from "../utils/imageUtils"

export default function HomeScreen({ navigation }) {
  const [examCount, setExamCount] = useState(0)
  const [userName, setUserName] = useState("")
  const [userProfileImage, setUserProfileImage] = useState(null)

  useEffect(() => {
    loadData()

    const unsubscribe = navigation.addListener("focus", () => {
      loadData()
    })

    return unsubscribe
  }, [navigation])

  const loadData = async () => {
    try {
      const [exams, profile] = await Promise.all([getAllExams(), getUserProfile()])
      setExamCount(exams.length)

      const fullName = profile?.name || "Usuário"
      const firstName = fullName.split(" ")[0]
      setUserName(firstName)

      if (profile?.profile_image) {
        try {
          const uri = await base64ToUri(profile.profile_image, "profile_home.jpg")
          setUserProfileImage(uri)
        } catch (error) {
          console.error("Erro ao carregar imagem do perfil:", error)
          setUserProfileImage(null)
        }
      } else {
        setUserProfileImage(null)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const menuItems = [
    {
      id: 1,
      title: "Exames",
      subtitle: "Laboratoriais",
      icon: "flask",
      iconType: "ionicon",
      color: "#0099cc",
      onPress: () => navigation.navigate("ExamsList", { examType: "laboratorial" }),
    },
    {
      id: 2,
      title: "Exames",
      subtitle: "de Imagem",
      icon: "camera",
      iconType: "ionicon",
      color: "#0099cc",
      onPress: () => navigation.navigate("ExamsList", { examType: "imagem" }),
    },
    {
      id: 3,
      title: "Adicionar",
      subtitle: "Novo Exame",
      icon: "add-circle",
      iconType: "ionicon",
      color: "#0099cc",
      onPress: () => navigation.navigate("ImportExam"),
    },
    {
      id: 4,
      title: "Perfil",
      subtitle: "Configurações",
      icon: "person",
      iconType: "ionicon",
      color: "#0099cc",
      onPress: () => navigation.navigate("Profile"),
    },
  ]

  const renderIcon = (item) => {
    const iconProps = {
      size: 30,
      color: item.color,
    }

    switch (item.iconType) {
      case "fontawesome5":
        return <FontAwesome5 name={item.icon} {...iconProps} />
      case "material":
        return <MaterialIcons name={item.icon} {...iconProps} />
      default:
        return <Ionicons name={item.icon} {...iconProps} />
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header com nome do usuário e foto */}
        <View style={styles.headerCard}>
          <View style={styles.userInfoContainer}>
            <View style={styles.userTextContainer}>
              <Text style={styles.welcomeText}>Olá, {userName}!</Text>
              <Text style={styles.subtitleText}>Gerencie seus exames médicos</Text>
            </View>

            <TouchableOpacity style={styles.profileImageContainer} onPress={() => navigation.navigate("Profile")}>
              {userProfileImage ? (
                <Image source={{ uri: userProfileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.defaultProfileImage}>
                  <Ionicons name="person" size={30} color="#0099cc" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{examCount}</Text>
              <Text style={styles.statLabel}>Exames Cadastrados</Text>
            </View>
          </View>
        </View>

        {/* Menu principal */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Menu Principal</Text>

          <View style={styles.gridContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.gridItem} onPress={item.onPress} activeOpacity={0.7}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>{renderIcon(item)}</View>
                <Text style={styles.gridText}>{item.title}</Text>
                <Text style={styles.gridSubText}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ações rápidas */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.menuTitle}>Ações Rápidas</Text>

          <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("ImportExam")}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Fotografar Exame</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate("ExamsList")}
          >
            <Ionicons name="list" size={20} color="#0099cc" />
            <Text style={[styles.quickActionText, styles.secondaryButtonText]}>Ver Todos os Exames</Text>
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
  headerCard: {
    backgroundColor: "#fff",
    margin: 20,
    marginBottom: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  userTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: "#666",
  },
  profileImageContainer: {
    marginLeft: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#0099cc",
  },
  defaultProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e6f7ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0099cc",
  },
  statsContainer: {
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0099cc",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  menuContainer: {
    backgroundColor: "#fff",
    margin: 20,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    minHeight: 120,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 2,
  },
  gridSubText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  quickActionsContainer: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionButton: {
    backgroundColor: "#0099cc",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#0099cc",
  },
  quickActionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#0099cc",
  },
})
