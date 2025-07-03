import { Alert as RNAlert } from "react-native"

export const showAlert = (title, message, buttons = []) => {
  const defaultButtons = [{ text: "OK", style: "default" }]

  RNAlert.alert(title, message, buttons.length > 0 ? buttons : defaultButtons)
}

export const showConfirmAlert = (title, message, onConfirm, onCancel) => {
  RNAlert.alert(title, message, [
    { text: "Cancelar", style: "cancel", onPress: onCancel },
    { text: "Confirmar", style: "default", onPress: onConfirm },
  ])
}

export const showErrorAlert = (message) => {
  showAlert("Erro", message)
}

export const showSuccessAlert = (message) => {
  showAlert("Sucesso", message)
}
