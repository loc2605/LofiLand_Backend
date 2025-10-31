import multer from 'multer'

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "/");
  },
});

// Create Multer middleware instance for single file upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
}).fields([
  { name: "coverUrl", maxCount: 1 },
  { name: "avatarUrl", maxCount: 1 }
]);

export default upload
