export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^$$\d{2}$$\s\d{4,5}-\d{4}$/
  return phoneRegex.test(phone)
}

export const validateDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}

export const formatPhone = (phone) => {
  const numbers = phone.replace(/\D/g, "")

  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
}

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  } catch {
    return dateString
  }
}
