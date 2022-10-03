import mongoose from ("mongoose")
const Schema = mongoose.Schema

const PlantSchema = new Schema(
    {
        
        //Plantas
        popularName:{type: String},
        scientificName:{type: String},
        origin:{type: String},
        luminosity:{type: Number},
        care:{type: Number},
        plantImage:{type: String},
        info:{type: String}
      },
      { timestamps: true }
    );

export const PlantModel = mongoose.model("Plant", PlantSchema);