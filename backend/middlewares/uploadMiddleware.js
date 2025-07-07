const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({}); // We will not store locally

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
        return cb(new Error("Only .jpg, .jpeg, and .png files are allowed"), false);
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
