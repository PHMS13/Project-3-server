import express from "express"
const router = express.Router();

//middleware
import uploadimg from "../config/cloudnary.config.js"

//localhost:4000/upload-image
router.post("/upload-image", uploadimg.single("picture"), (req, res) => {
  //se não vier um file na requisição
  if (!req.file) {
    return res.status(400).json({ message: "Upload failed." });
  }

  return res.status(200).json({ url: req.file.path });
});

export default router