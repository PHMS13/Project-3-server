import express from "express"
const router = express.Router()

const PlantModel = require('../models/Plant.model')

//Criar Planta:
router.post('/create', async (req, res) => {
    const newPlant = await PlantModel.create({ ...req.body })

    return res.status(201).json(newPlant)
})

//Editar planta:
router.put('/edit/:idPlant', async (req, res) => {
    const 
})

export default router;