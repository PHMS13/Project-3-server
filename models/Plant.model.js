import mongoose from ("mongoose")
const Schema = mongoose.Schema

const PlantSchema = new Schema(
    {
        
        //Plantas
        popularName:{type: String, required: true}, //required
        scientificName:{type: String},
        origin:{type: String},
        luminosity:{type: Number},
        care:{type: Number},
        plantImage:{type: String},
        info:{type: String},
        garden: { type: Schema.Types.ObjectId, ref: "Garden"},

      },
      { timestamps: true }
    );

export const PlantModel = mongoose.model("Plant", PlantSchema);