import express from "express"
const router = express.Router()

import UserModel from "../models/User.model.js"
import GardenModel from "../models/Garden.model.js";
import CommentModel from "../models/Comment.model.js";

router.post("/create/:idgarden/:idAuthor", async (req, res) => {
    try {
      const { idGarden, idAuthor } = req.params;
  
      const newComment = await CommentModel.create({
        ...req.body,
        author: idAuthor,
        post: idGarden,
      });
  
      await GardenModel.findByIdAndUpdate(idGarden, {
        $push: {
          comments: newComment._id,
        },
      });
  
      return res.status(201).json(newComment);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  });