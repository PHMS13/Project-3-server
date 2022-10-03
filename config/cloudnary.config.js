// configuranda cloudinary para receber nossas imagens
import cloudinary from "cloudinary"
import {CloudinaryStorage} from "multer-storage-cloudinary"
import multer from "multer"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

const storage = new CloudinaryStorage ({
    cloudinary,
    params:{
        allowed_formats: ["jpg", "png"],
        folder:"blog" // verificar o que é isso
    }
})

export default multer({storage})