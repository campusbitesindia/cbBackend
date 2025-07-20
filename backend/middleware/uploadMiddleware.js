const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({}) // We will not store locally

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    return cb(new Error("Only .jpg, .jpeg, .png, and .webp files are allowed"), false)
  }

  // Check file size (5MB limit per image)
  if (file.size > 5 * 1024 * 1024) {
    return cb(new Error("File size should not exceed 5MB"), false)
  }

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 3, // Maximum 3 files
  },
})

module.exports = upload
