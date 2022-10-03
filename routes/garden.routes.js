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


  router.get("/all-garden", attachCurrentUser, async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const { idGarden } = req.params;
  
 //PRECISA TERMINAR AQUI, ACHO QUE TA FALTANDO COISA

      return res.status(200).json(garden);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  });



  router.put("/idGarden/edit", isAuth, attachCurrentUser, async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const { idGarden } = req.params;
  
      const editedGarden = await GardenModel.findByIdAndUpdate(
        idGarden,
        {
          ...req.body,
        },
        { new: true, runValidators: true }
      );
  
      return res.status(200).json(editedGarden);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  });
  

 // router.delete("/delete/:idgarden")

 router.delete(
  "/delete/:idgarden",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const { idGarden } = req.params;

      const deletedPost = await GardenModel.findByIdAndDelete(idGarden);

      await GardenModel.findByIdAndUpdate(deletedGarden.author, {
        $pull: { garden: idGarden},
      });

      // deleto todos os comentários desse post.
      await CommentModel.deleteMany({ comments: idComment });

      return res
        .status(200)
        .json("Jardim deleteado. Usuário atualizado. Comentários deletados");
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

