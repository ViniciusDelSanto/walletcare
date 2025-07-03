import { View, ActivityIndicator, Text, StyleSheet } from "react-native"

export default function LoadingSpinner({ message = "Carregando...", size = "large", color = "#0099cc" }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
})
