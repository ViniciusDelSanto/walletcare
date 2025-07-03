import * as SQLite from "expo-sqlite"

let db

const initDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("walletcare.db")
  }
  return db
}

export const initDatabase = async () => {
  try {
    const database = await initDB()

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        doctor TEXT,
        date TEXT NOT NULL,
        clinic TEXT,
        type TEXT DEFAULT 'laboratorial',
        image_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER,
        parameter_name TEXT NOT NULL,
        value TEXT,
        reference_range TEXT,
        unit TEXT,
        status TEXT DEFAULT 'normal',
        FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
      );
    `)

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        age INTEGER,
        phone TEXT,
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

export const resetDatabase = async () => {
  try {
    const database = await initDB()

    console.log("🗑️ Iniciando reset do database...")

    await database.execAsync("DROP TABLE IF EXISTS exam_results;")
    await database.execAsync("DROP TABLE IF EXISTS exams;")
    await database.execAsync("DROP TABLE IF EXISTS user_profile;")

    console.log("✅ Tabelas removidas")

    await initDatabase()

    console.log("✅ Database resetado com sucesso!")
    return true
  } catch (error) {
    console.error("❌ Erro ao resetar database:", error)
    throw error
  }
}

export const clearAllData = async () => {
  try {
    const database = await initDB()

    console.log("🧹 Limpando todos os dados...")

    await database.execAsync("DELETE FROM exam_results;")
    await database.execAsync("DELETE FROM exams;")
    await database.execAsync("DELETE FROM user_profile;")

    await database.execAsync("DELETE FROM sqlite_sequence WHERE name IN ('exams', 'exam_results', 'user_profile');")

    console.log("✅ Todos os dados foram limpos!")
    return true
  } catch (error) {
    console.error("❌ Erro ao limpar dados:", error)
    throw error
  }
}

export const insertExam = async (examData) => {
  try {
    const database = await initDB()
    const result = await database.runAsync(
      "INSERT INTO exams (name, doctor, date, clinic, type, image_data) VALUES (?, ?, ?, ?, ?, ?)",
      [examData.name, examData.doctor, examData.date, examData.clinic, examData.type, examData.imageData],
    )
    return result.lastInsertRowId
  } catch (error) {
    console.error("Error inserting exam:", error)
    throw error
  }
}

export const getAllExams = async () => {
  try {
    const database = await initDB()
    const result = await database.getAllAsync("SELECT * FROM exams ORDER BY date DESC")
    return result
  } catch (error) {
    console.error("Error getting all exams:", error)
    throw error
  }
}

export const getExamById = async (id) => {
  try {
    const database = await initDB()
    const result = await database.getFirstAsync("SELECT * FROM exams WHERE id = ?", [id])
    return result
  } catch (error) {
    console.error("Error getting exam by id:", error)
    throw error
  }
}

export const updateExam = async (id, examData) => {
  try {
    const database = await initDB()
    const result = await database.runAsync(
      "UPDATE exams SET name = ?, doctor = ?, date = ?, clinic = ?, type = ?, image_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [examData.name, examData.doctor, examData.date, examData.clinic, examData.type, examData.imageData, id],
    )
    return result
  } catch (error) {
    console.error("Error updating exam:", error)
    throw error
  }
}

export const deleteExam = async (id) => {
  try {
    const database = await initDB()
    const result = await database.runAsync("DELETE FROM exams WHERE id = ?", [id])
    return result
  } catch (error) {
    console.error("Error deleting exam:", error)
    throw error
  }
}

export const getUserProfile = async () => {
  try {
    const database = await initDB()
    const result = await database.getFirstAsync("SELECT * FROM user_profile LIMIT 1")
    return result
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

export const insertOrUpdateUserProfile = async (profileData) => {
  try {
    const database = await initDB()

    const existingProfile = await database.getFirstAsync("SELECT id FROM user_profile LIMIT 1")

    if (existingProfile) {
      const result = await database.runAsync(
        "UPDATE user_profile SET name = ?, email = ?, age = ?, phone = ?, profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [
          profileData.name,
          profileData.email,
          profileData.age,
          profileData.phone,
          profileData.profileImage,
          existingProfile.id,
        ],
      )
      return result
    } else {
      const result = await database.runAsync(
        "INSERT INTO user_profile (name, email, age, phone, profile_image) VALUES (?, ?, ?, ?, ?)",
        [profileData.name, profileData.email, profileData.age, profileData.phone, profileData.profileImage],
      )
      return result
    }
  } catch (error) {
    console.error("Error inserting/updating user profile:", error)
    throw error
  }
}
