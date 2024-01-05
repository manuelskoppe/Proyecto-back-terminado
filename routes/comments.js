// comments.js
const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const isAuthenticated = require("../middlewares/isAuthenticated");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Configuración temporal de almacenamiento
const cloudinary = require('../config/cloudinary'); // Importa la configuración de Cloudinary

// Ruta para publicar un comentario en un post individual con una imagen opcional
router.post('/post/:id/comment', isAuthenticated, upload.single('image'), async (req, res) => {
  const postId = req.params.id;
  const { comment } = req.body; // El texto del comentario
  const userId = req.user.id; // El ID del usuario que publica el comentario
  const imageFile = req.file; // El archivo de imagen

  console.log("Archivo recibido:", imageFile); // Muestra información sobre el archivo recibido

  try {
    let imageUrl = null;
    if (imageFile) {
      console.log("Subiendo imagen a Cloudinary...");
      const result = await cloudinary.uploader.upload(imageFile.path);
      imageUrl = result.secure_url;
      console.log("Imagen subida a Cloudinary, URL:", imageUrl);
    } else {
      console.log("No se ha proporcionado ninguna imagen.");
    }

    // Crea el comentario en la base de datos con o sin URL de imagen
    console.log("Creando comentario en la base de datos...");
    await prisma.comment.create({
      data: {
        body: comment,
        postId: postId,
        userId: userId,
        imageUrl: imageUrl // URL de la imagen (puede ser null si no se proporcionó imagen)
      },
    });
    console.log("Comentario creado con éxito.");
    res.redirect(`/forum/post/${postId}`);
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).send("Error al publicar el comentario.");
  }
});

// Ruta para eliminar un comentario
router.post('/comment/:commentId/delete', isAuthenticated, async (req, res) => {
  const commentId = req.params.commentId;

  try {
    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
    res.sendStatus(200); // Comentario eliminado con éxito
  } catch (error) {
    console.error('Error deleting comment', error);
    res.sendStatus(500);
  }
});

// Ruta para responder a un comentario
router.post('/comment/:commentId/reply', isAuthenticated, async (req, res) => {
  const parentCommentId = req.params.commentId; // El ID del comentario padre
  const { reply } = req.body; // El texto de la respuesta
  const userId = req.user.id; // El ID del usuario que responde

  try {
    // Encuentra el post original asociado con el comentario padre
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentCommentId },
    });
    const postId = parentComment.postId;

    // Crea la respuesta en la base de datos
    await prisma.comment.create({
      data: {
        body: reply,
        parentId: parentCommentId,
        userId: userId,
        postId: postId, // Incluye el ID del post aquí
      },
    });
    res.redirect('back'); // Redirige de vuelta al post original
  } catch (error) {
    console.error("Error posting reply:", error);
    res.status(500).send("Error al publicar la respuesta.");
  }
});


// Ruta para editar un comentario
router.post('/comment/:commentId/edit', isAuthenticated, async (req, res) => {
  const commentId = req.params.commentId;
  const { editedComment } = req.body; // El texto del comentario editado
  const userId = req.user.id; // El ID del usuario que edita el comentario

  try {
    // Encuentra el comentario original
    const originalComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    // Verifica si el usuario actual es el autor del comentario
    if (originalComment.userId !== userId) {
      return res.status(403).send("No autorizado para editar este comentario.");
    }

    // Actualiza el comentario en la base de datos
    await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        body: editedComment, // Actualiza el cuerpo del comentario
      },
    });
    res.redirect('back'); // Redirige de vuelta al post original
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).send("Error al editar el comentario.");
  }
});




module.exports = router;
