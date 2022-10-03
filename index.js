import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();

import dbConnect  from "./config/db.config.js";
dbConnect();

app.use(cors({origin: process.env.REACT_APP_URI}));
app.use(express.json());

import UsersRoute from "./routes/users.routes.js"
app.use("/users", UsersRoute)

import CommentsRoute from "./routes/comments.routes.js"
app.use("/comments", CommentsRoute)

/* import PostRoute from "./routes/posts.routes.js"
app.use("/posts", PostsRoute) */

import GardenRoute from "./routes/garden.routes"
app.use("/garden", GardenRoute)

import PlantRoute from "./routes/plant.routes"
app.use("/plant", PlantRoute)


app.listen(Number(process.env.PORT), () => {
  console.log("Server up and running on port", process.env.PORT);
});

