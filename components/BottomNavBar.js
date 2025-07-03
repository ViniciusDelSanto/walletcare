import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"

export default function BottomNavBar() {
  const navigation = useNavigation()
  const route = useRoute()

  const isActive = (routeName) => {
    return route.name === routeName
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
        <Ionicons
          name={isActive("Profile") ? "person" : "person-outline"}
          size={24}
          color={isActive("Profile") ? "#0099cc" : "#0099cc"}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
        <Ionicons
          name={isActive("Home") ? "home" : "home-outline"}
          size={24}
          color={isActive("Home") ? "#0099cc" : "#0099cc"}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ExamsList")}>
        <Ionicons
          name={isActive("ExamsList") ? "document-text" : "document-text-outline"}
          size={24}
          color={isActive("ExamsList") ? "#0099cc" : "#0099cc"}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingBottom: 5,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
