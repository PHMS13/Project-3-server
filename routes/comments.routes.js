import express from "express";
const router = express.Router();

import {UserModel} from "../models/User.model.js";
import {CommentModel} from "../models/Comment.model.js";
import {PlantModel} from '../models/Plant.model.js'
import isAuth from '../middlewares/isAuth.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js'


//CRIAR COMMENT:
router.post("/create/:idPlant/:idUser", async (req, res) => {
  try {

    const { idPlant, idUser } = req.params

    const newComment = await CommentModel.create({
      ...req.body,
      author: idUser,
      plant: idPlant
    })

    await PlantModel.findByIdAndUpdate(idPlant, {
      $push: {
        comments: newComment._id
      }
    })

    return res.status(201).json(newComment)
    
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);  
  }
})


//DELETAR COMMENT:
router.delete("/delete/:idPlant/:idComment", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { idComment } = req.params;
    const deletedComment = await CommentModel.findByIdAndDelete(idComment)


    return res.status(200).json({
      deletedComment: deletedComment
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});



/* router.post("/create/:idPlant/:idUser", async (req, res) => {
    try {
      const { idPlant, idUser } = req.params;
  
      const newComment = await CommentModel.create({
router.put("/edit/:idComment", async (req, res) => {
  try {
    const { idComment } = req.params;

    const editedComment = await CommentModel.findByIdAndUpdate(
      idComment,
      {
        ...req.body,
      },
      { new: true }
    );

    return res.status(200).json(editedComment);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete/:idComment", async (req, res) => {
  try {
    const { idComment } = req.params;

    //apaguei o comentário do CommentModel
    const deletedComment = await CommentModel.findByIdAndDelete(idComment);

    //apagar o ID do comentário da ARRAY comments, no PlantModel
    await PlantModel.findByIdAndUpdate(
      deletedComment.plant,
      {
        $pull: {
          comments: idComment,
        },
      });
  
      return res.status(201).json(newComment);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  });
  
  router.put("/edit/:idComment", async (req, res) => {
    try {
      const { idComment } = req.params;
  
      const editedComment = await CommentModel.findByIdAndUpdate(
        idComment,
        {
          ...req.body,
        },
        { new: true }
      );
  
      return res.status(200).json(editedComment);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  });
  
  router.delete("/delete/:idComment", async (req, res) => {
    try {
      const { idComment } = req.params;
  
      //apaguei o comentário do CommentModel
      const deletedComment = await CommentModel.findByIdAndDelete(idComment);
  
      //apagar o ID do comentário da ARRAY comments, no PlantModel
      await PlantModel.findByIdAndUpdate(
        deletedComment.plant,
        {
          $pull: {
            comments: idComment,
          },
        },
        { new: true }
      );
  
      return res.status(200).json("comentário deletado :D");
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  });
  
  router.put("/like/:idComment", async (req, res) => {
    try {
      const { idComment } = req.params;
  
      const comment = await CommentModel.findByIdAndUpdate(
        idComment,
        {
          $inc: { likes: 1 },
        },
        { new: true }
      );
  
      return res.status(200).json(comment);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  });
  
  router.put("/dislike/:idComment", async (req, res) => {
    try {
      const { idComment } = req.params;
  
      const comment = await CommentModel.findByIdAndUpdate(
        idComment,
        {
          $inc: { likes: -1 },
        },
        { new: true }
      );
  
      return res.status(200).json(comment);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }); */
  
  export default router;
