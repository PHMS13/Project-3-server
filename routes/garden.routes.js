import express from "express";
const router = express.Router();

import { UserModel } from "../models/User.model.js";
import { GardenModel } from "../models/Garden.model.js";
import { CommentModel } from "../models/Comment.model.js";
import { PlantModel } from "../models/Plant.model.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";

router.post("/create", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    //criar um jardim
    const oneGarden = await GardenModel.create({
      ...req.body,
      author: loggedInUser._id,
    });

    //adicionar o garden criado, na array do usuario
    await UserModel.findByIdAndUpdate(loggedInUser._id, {
      $push: {
        garden: oneGarden._id,
      },
    });

    return res.status(201).json(oneGarden);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get(
  "/one-garden/:idGarden",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    const oneGarden = await GardenModel.findById(req.params.idGarden).populate(
      "plants"
    );

    return res.status(200).json(oneGarden);
  }
);

router.get("/all-garden", async (req, res) => {
  try {
    const allGarden = await GardenModel.find();

    return res.status(200).json(allGarden);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.put("/edit/:idGarden", isAuth, attachCurrentUser, async (req, res) => {
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
  "/delete/:idGarden",
  isAuth,
  attachCurrentUser,

  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const { idGarden } = req.params;

      //delete o usuario
      const deleteGarden = await GardenModel.findByIdAndDelete(idGarden);

      //retirar a referencia do jardim deletado do usuario.
      await UserModel.findByIdAndUpdate(loggedInUser._id, {
        $pull: { garden: idGarden },
      });

      //deletar todas as plantas, de dentro do garden
      deleteGarden.plants.forEach(async (plantId) => {
        await PlantModel.findByIdAndDelete(plantId);
      });

      // deleto todos os comentários desse jardim.
      await CommentModel.deleteMany({ garden: deleteGarden._id });

      return res
        .status(200)
        .json(
          "Jardim deleteado. Usuário atualizado. Plants deletadas. Comentários apagados"
        );
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

router.get("/one-garden/:id", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const oneGarden = await GardenModel.findById(req.params.id).populate(
      "plants"
    );

    return res.status(200).json(oneGarden);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

export default router;
