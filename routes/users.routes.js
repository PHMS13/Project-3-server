import express from "express";
//const express = require("express")

import { UserModel } from "../models/User.model.js";
import { PlantModel } from "../models/Plant.model.js";
import { GardenModel } from "../models/Garden.model.js";
import { CommentModel } from "../models/Comment.model.js";

import bcrypt from "bcrypt";
const saltRounds = 10;

const router = express.Router();
import isAuth from "../middlewares/isAuth.js";

import generateToken from "../config/jwt.config.js";

import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";

//configurar o transporter
import nodemailer from "nodemailer";
let transporter = nodemailer.createTransport({
  service: "Hotmail", //email
  auth: {
    user: "garden85wd@hotmail.com", //usuário
    pass: "SenhaSegura!123", //senha
  },
});

//sign-up (login com senha)
router.post("/sign-up", async (req, res) => {
  try {
    //pegando a senha do body
    const { password, email } = req.body;

    //checando se a senha existe e se ela passou na RegEx
    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/
      )
    ) {
      return res
        .status(400)
        .json({ message: "Senha não atende os requisitos de segurança" });
    }

    //gerar salt
    const salt = await bcrypt.genSalt(saltRounds);
    console.log(salt);
    //gerar passwordHash com a senha enviada pelo usuário mais o salt criado
    const passwordHash = await bcrypt.hash(password, salt);
    console.log(passwordHash);

    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: passwordHash,
    });

    delete newUser._doc.passwordHash;

    //envio de email
    const mailOptions = {
      from: "garden85wd@hotmail.com",
      to: email,
      subject: "Ativação de conta",
      html: `<p>Clique no link para ativar sua conta:<p> <a href=http://localhost:4000/users/activate-account/${newUser._id}>LINK</a>`,
    };

    // Dispara e-mail para o usuário
    await transporter.sendMail(mailOptions);

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    //capturar email e senha
    const { email, password } = req.body;

    //confirmar se foi enviado email e senha no body da requisição
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Por favor, informe seu email e senha." });
    }

    //achar o user que está tentando logar
    const user = await UserModel.findOne({ email: email });
    //checar se o usuário existe no banco de dados
    if (!user) {
      return res.status(400).json({ message: "Usuário não cadastrado" });
    }

    //sabendo que o user existe, vamos comparar as senhas agora
    if (await bcrypt.compare(password, user.passwordHash)) {
      //deletando a senha
      delete user._doc.passwordHash;

      //criando token de acesso para esse usuário
      const token = generateToken(user);

      //retorna um objeto com o token e com as informações do usuário logado
      return res.status(200).json({
        token: token,
        user: user,
      });
    } else {
      return res.status(400).json({ message: "Senha ou email incorretos" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//get one user, agora usando os middlewares
router.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    //console.log(req.currentUser);
    const loggedInUser = req.currentUser;
    console.log(loggedInUser);

    const user = await UserModel.findById(loggedInUser._id, {
      passwordHash: 0,
    }).populate("garden");

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//get one user, agora usando os middlewares
router.get("/user/:idUser", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { idUser } = req.params;
    console.log(idUser);

    //console.log(req.currentUser);

    const user = await UserModel.findById(idUser).populate("garden");
    console.log(user);
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//edit
router.put("/edit", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    const editedUser = await UserModel.findByIdAndUpdate(
      loggedInUser._id,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    delete editedUser._doc.passwordHash;

    return res.status(200).json(editedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete-user", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const idUser = req.currentUser._id;

    //deletando o usuário
    const deletedUser = await UserModel.findByIdAndDelete(idUser);
    delete deletedUser._doc.passwordHash;

    const deleteComment = await CommentModel.deleteMany({ author: idUser });

    const deletePlant = await PlantModel.deleteMany({ author: idUser });

    const deleteGarden = await GardenModel.deleteMany({ author: idUser });

    //iterar por todos os posts!
    CommentFromUser.forEach(async (post) => {
      //iterar por todos os meus COMMENTS
      post.comments.forEach(async (comment) => {
        await CommentModel.findByIdAndDelete(comment._id);
      });
    });

    CommentFromUser.forEach(async (post) => {
      //iterar por todos os meus COMMENTS
      post.comments.forEach(async (comment) => {
        await CommentModel.findByIdAndDelete(comment._id);
      });
    });

    //deletando todos os posts que o usuários já fez
    const deletedPosts = await PostModel.deleteMany({ author: idUser });

    await UserModel.updateMany(
      {
        $or: [
          { following: { $in: [idUser] } },
          { followers: { $in: [idUser] } },
        ],
      },
      {
        $pull: {
          following: idUser,
          followers: idUser,
        },
      }
    );

    //deletar o usuário da array de folowers

    return res.status(200).json({
      deleteduser: deletedUser,
      postsFromUser: postsFromUser,
      commentsUser: deletedComments,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//!ADMIN
//rota para ver todos os usuário apenas para o administrador
router.get("/all", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const allUsers = await UserModel.find({}, { passwordHash: 0 });

    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/delete/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;

    //deletando o usuário
    const deletedUser = await UserModel.findByIdAndDelete(idUser);

    //deletando todos os gardens que o usuário já fez
    const deletedGarden = await GardenModel.deleteMany({ author: idUser });

    //primeiro eu vou PROCURAR todos os posts que o usuário fez
    const postsFromUser = await PostModel.find({ author: idUser }); //arrayE

    //iterar por todos os posts!
    postsFromUser.forEach(async (post) => {
      //iterar por todos os meus COMMENTS
      post.comments.forEach(async (comment) => {
        await CommentModel.findByIdAndDelete(comment._id);
      });
    });

    //deletando todos os posts que o usuários já fez
    const deletedPosts = await PostModel.deleteMany({ author: idUser });

    await UserModel.updateMany(
      {
        $or: [
          { following: { $in: [idUser] } },
          { followers: { $in: [idUser] } },
        ],
      },
      {
        $pull: {
          following: idUser,
          followers: idUser,
        },
      }
    );

    //deletar o usuário da array de folowers

    return res.status(200).json({
      deleteduser: deletedUser,
      postsFromUser: postsFromUser,
      commentsUser: deletedComments,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/activate-account/:idUser", async (req, res) => {
  try {
    const { idUser } = req.params;

    const user = await UserModel.findOne({ _id: idUser });

    if (!user) {
      return res.send("Erro na ativação da conta");
    }

    await UserModel.findByIdAndUpdate(idUser, {
      emailConfirm: true,
    });

    res.send(`<h1>Usuário ativado</h1>`);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

export default router;
