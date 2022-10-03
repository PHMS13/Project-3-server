import express from "express"
const router = express.Router()

import {UserModel} from "../models/User.model.js"
import {GardenModel} from "../models/Garden.model.js";
import {PlantModel} from '../models/Plant.model.js'

//Criar Planta:
router.post('/create', async (req, res) => {
    const newPlant = await PlantModel.create({ ...req.body })

    return res.status(201).json(newPlant)
})

//Editar planta:
router.put('/edit/:idPlant', async (req, res) => {
     
})

export default router;