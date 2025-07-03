"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar } from "expo-status-bar"
import LoadingScreen from "./screens/LoadingScreen"
import HomeScreen from "./screens/HomeScreen"
import ExamsListScreen from "./screens/ExamsListScreen"
import ImportExamScreen from "./screens/ImportExamScreen"
import SelectExamScreen from "./screens/SelectExamScreen"
import ExamDetailsScreen from "./screens/ExamDetailsScreen"
import ProfileScreen from "./screens/ProfileScreen"
import ProfileSetupScreen from "./screens/ProfileSetupScreen"
import { initDatabase, getUserProfile } from "./database/database"
import { showErrorAlert } from "./components/Alert"

const Stack = createNativeStackNavigator()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [dbInitialized, setDbInitialized] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      await initDatabase()
      setDbInitialized(true)

      const profile = await getUserProfile()
      setHasProfile(!!profile?.name)

      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Erro ao inicializar app:", error)
      showErrorAlert("Erro ao inicializar aplicativo")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !dbInitialized) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={hasProfile ? "Home" : "ProfileSetup"}
        screenOptions={{
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#0099cc",
          contentStyle: {
            backgroundColor: "#fff",
          },
        }}
      >
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "WalletCare",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="ExamsList"
          component={ExamsListScreen}
          options={{
            title: "Meus Exames",
          }}
        />
        <Stack.Screen
          name="ImportExam"
          component={ImportExamScreen}
          options={{
            title: "Adicionar Exame",
          }}
        />
        <Stack.Screen
          name="SelectExam"
          component={SelectExamScreen}
          options={{
            title: "Informações do Exame",
          }}
        />
        <Stack.Screen
          name="ExamDetails"
          component={ExamDetailsScreen}
          options={{
            title: "Detalhes do Exame",
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: "Perfil",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
