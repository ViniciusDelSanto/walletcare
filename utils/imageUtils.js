import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system/legacy"

export const requestPermissions = async () => {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

  return {
    camera: cameraStatus === "granted",
    media: mediaStatus === "granted",
  }
}

export const captureImage = async () => {
  try {
    const permissions = await requestPermissions()
    if (!permissions.camera) {
      throw new Error("Permissão de câmera negada")
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      return result.assets[0]
    }
    return null
  } catch (error) {
    console.error("Erro ao capturar imagem:", error)
    throw error
  }
}

export const pickImage = async () => {
  try {
    const permissions = await requestPermissions()
    if (!permissions.media) {
      throw new Error("Permissão de galeria negada")
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      return result.assets[0]
    }
    return null
  } catch (error) {
    console.error("Erro ao selecionar imagem:", error)
    throw error
  }
}

export const imageToBase64 = async (uri) => {
  try {
    if (!uri) {
      throw new Error("URI da imagem não fornecida")
    }

    if (!FileSystem || !FileSystem.readAsStringAsync) {
      throw new Error("FileSystem não está disponível")
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    })

    return base64
  } catch (error) {
    console.error("Erro ao converter imagem para base64:", error)
    throw error
  }
}

export const base64ToUri = async (base64Data, filename = "temp_image.jpg") => {
  try {
    if (!base64Data) {
      throw new Error("Dados base64 não fornecidos")
    }

    if (!FileSystem || !FileSystem.writeAsStringAsync || !FileSystem.documentDirectory) {
      throw new Error("FileSystem não está disponível")
    }

    const fileUri = FileSystem.documentDirectory + filename
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: "base64",
    })

    return fileUri
  } catch (error) {
    console.error("Erro ao converter base64 para URI:", error)
    throw error
  }
}
