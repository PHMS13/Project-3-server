import express from "express"
const router = express.Router()

import UserModel from "../models/User.model.js"
import GardenModel from "../models/Garden.model.js";
import CommentModel from "../models/Comment.model.js";
import { PlantModel } from "../models/Plant.model.js";

router.post("/create-garden", middlewares, async (req, res) => {
    try {
      const idAuthor = req.currentUser._id
  
      const newGarden = await GardenModel.create({
        ...req.body,
        author: idAuthor, 
      });
  
      await UserModel.findByIdAndUpdate(idGarden, {
        $push: {
          garden: newGarden._id,
        },
      });
  
      return res.status(201).json(newGarden);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  });

  export default router;