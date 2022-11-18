import mongoose from "mongoose"

async function dbConnect() {
    try {

        const conect = await mongoose.connect(process.env.MONGODB_URI)

        console.log(`Conected to db: ${conect.connection.name}`)

    } catch (error) {
        console.log(error)
    }
}

export default dbConnect;