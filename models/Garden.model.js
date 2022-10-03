import mongoose from ("mongoose")
const Schema = mongoose.Schema

const GardenSchema = new Schema(
    {
        local: { type: String, required: true, minlength: 1, maxlength: 300 },
        author: { type: Schema.Types.ObjectId, ref: "User" },
        plants: [{ type: Schema.Types.ObjectId, ref: "Plant" }],
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        gardenImage: {type: String, default: ""},
      },
      { timestamps: true }
    );

export const GardenModel = mongoose.model("Garden", GardenSchema);