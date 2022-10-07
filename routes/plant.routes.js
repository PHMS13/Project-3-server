import express from "express";
const router = express.Router();

import { UserModel } from "../models/User.model.js";
import { GardenModel } from "../models/Garden.model.js";
import { PlantModel } from "../models/Plant.model.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";

//CRIAR Planta:
router.post(
  "/create/:idGarden",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const newPlant = await PlantModel.create({
        ...req.body,
        garden: req.params.idGarden,
      });

      await GardenModel.findByIdAndUpdate(req.params.idGarden, {
        $push: { plants: newPlant._id },
      });

      return res.status(201).json(newPlant);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

//EDITAR Planta:
router.put("/edit/:id", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { id } = req.params;

    const planta = await PlantModel.findByIdAndUpdate(id, {
      ...req.body,
    });

    return res.status(200).json(planta);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//VER TODAS as Plantas:
router.get("/all", async (req, res) => {
  const allPlants = await PlantModel.find();

  return res.status(200).json(allPlants);
});

//DELETAR Planta
router.delete("/delete/:id", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.currentUser);
    //deletando a planta
    const deletedPlant = await PlantModel.findByIdAndDelete(id);
    //delete deletedPlant._doc.passwordHash;

    //deletando todos os comentários da planta
    /*    const deletedComments = await CommentModel.deleteMany({
      author: req.currentUser._id,
    }); */

    return res.status(200).json({
      message: "Usuário atualizado. Plantas e comentários deletados.",
      deletedPlant: deletedPlant,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

export default router;
