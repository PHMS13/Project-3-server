import express from "express";
//const express = require("express")
import { CommentModel } from "../models/User.model";
import { PostModel } from "../models/Garden.model";
import { PlantModel } from "../models/Plant.model";
import { GardenModel } from "../models/Garden.model";

import bcrypt from "bcrypt";
const saltRounds = 10;

const router = express.Router();

import { UserModel } from "../models/User.model";

import generateToken from "../config/jwt.config";
import isAuth from "../middlewares/isAuth";
import attachCurrentUser from "../middlewares/attachCurrentUser";
import isAdmin from "../middlewares/isAdmin";

//configurar o transporter
import nodemailer from "nodemailer";
let transporter = nodemailer.createTransport({
  service: "", //email
  auth: {
    user: "", //usuário
    pass: "", //senha
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
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#_!])[0-9a-zA-Z$*&@#_!]{8,}$/
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
      from: "turma85wdft@hotmail.com",
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
    }).populate("posts");

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

    //deletando todos os comentários que o usuário já fez
    const deletedComments = await CommentModel.deleteMany({ author: idUser });

    //primeiro eu vou PROCURAR todos os posts que o usuário fez
    const postsFromUser = await PostModel.find({ author: idUser }); //array

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

//!ADMIN
//rota para ver todos os usuário apenas para o administrador
router.get("/all", isAuth, attachCurrentUser, isAdmin, async (req, res) => {
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

    //deletando todos os comentários que o usuário já fez
    const deletedComments = await CommentModel.deleteMany({ author: idUser });

    //primeiro eu vou PROCURAR todos os posts que o usuário fez
    const postsFromUser = await PostModel.find({ author: idUser }); //array

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


// tamires              // bruno
//quem está seguindo // quem foi seguido
/* router.put(
  "/follow/:idUserFollowed",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const idUserFollowing = req.currentUser._id;
      const { idUserFollowed } = req.params;

      //FARIA UM IF PARA NÃO DEIXAR O PRÓPRIO USUÁRIO SE SEGUIR

      //tamires
      const userFollowing = await UserModel.findByIdAndUpdate(
        idUserFollowing,
        {
          $addToSet: { following: idUserFollowed },
        },
        { new: true }
      );

      //Pedro
      const userFollowed = await UserModel.findByIdAndUpdate(idUserFollowed, {
        $addToSet: { followers: idUserFollowing },
      });

      return res.status(200).json(userFollowing);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

router.put(
  "/unfollow/:idUserUnfollowed",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const idUserUnfollowing = req.currentUser._id;
      const { idUserUnfollowed } = req.params;

      //Tamires
      const userUnfollowing = await UserModel.findByIdAndUpdate(
        idUserUnfollowing,
        {
          $pull: { following: idUserUnfollowed },
        },
        {
          new: true,
        }
      );

      //Pedro
      const userUnfollowed = await UserModel.findByIdAndUpdate(
        idUserUnfollowed,
        {
          $pull: { followers: idUserUnfollowing },
        }
      );

      return res.status(200).json(userUnfollowing);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
); */

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



export default router
