import express from "express"
const router = express.Router()

import UserModel from "../models/User.model.js"
import PostModel from "../models/Post.model.js";
import CommentModel from "../models/Comment.model.js";

router.post("/create/:idAuthor", async (req, res) => {
  try {
    const { idAuthor } = req.params;

    const newPost = await PostModel.create({ ...req.body, author: idAuthor });

    const author = await UserModel.findByIdAndUpdate(
      idAuthor,
      {
        $push: { posts: newPost._id },
      },
      { new: true }
    );

    return res.status(201).json([newPost, author]);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/post/:idPost", async (req, res) => {
  try {
    const { idPost } = req.params;

    const post = await PostModel.findById(idPost)
      .populate("comments")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
        },
      });

    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/edit/:idPost", async (req, res) => {
  try {
    const { idPost } = req.params;

    const editedPost = await PostModel.findByIdAndUpdate(
      idPost,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json(editedPost)
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete/:idPost", async (req, res) => {
  try {
    const { idPost } = req.params;

    //deletar o post
    const deletedPost = await PostModel.findByIdAndDelete(idPost);

    // deletando a REFERENCIAS do id DO POST do meu usuário (se quem criou o post)
    await UserModel.findByIdAndUpdate(deletedPost.author, {
      $pull: { posts: idPost },
    });

    // deleto todos os comentários desse post.
    await CommentModel.deleteMany({ post: idPost });

    return res
      .status(200)
      .json("Post deleteado. Usuário atualizado. Comentários deletados");
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

export default router;
