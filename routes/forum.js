// routes/.js
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("passport");
const prisma = require("../prisma");

// Uncomment the isAuthenticated middleware definition or ensure it is imported if defined in another file.
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { // This assumes you are using Passport.js
    return next();
  }
  res.redirect("/auth/login-page");
};

router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true, // This includes the information of the associated user for each post
      },
    });
    res.render('forum', { posts: posts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener los posts del foro.");
  }
});

router.post('/create-post', isAuthenticated, async (req, res) => {
  const { body } = req.body;
  let { frustrationLevel } = req.body;
  const userId = req.user.id;

  // Convert frustrationLevel to a number and ensure it's not NaN
  frustrationLevel = parseInt(frustrationLevel, 10);
  if (isNaN(frustrationLevel)) {
    // Handle the error appropriately
    return res.status(400).send("Nivel de frustración debe ser un número.");
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        body: body,
        frustrationLevel: frustrationLevel,
        userId: userId,
      },
    });
    res.redirect('/forum');
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).send("No se pudo crear el post.");
  }
});

router.get('/post/:id', async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true, // Include the post's author
        comments: {
          include: {
            user: true // Include the author of each comment
          }
        },
      },
    });

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.render('post', { post }); // Ensure you have a 'post' view set up
  } catch (error) {
    console.error("Error retrieving individual post:", error);
    res.status(500).send("Internal Server Error");
  }
});




// Delete a post
router.post('/post/:id/delete', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id; // The ID of the user requesting the delete

  try {
    // Retrieve the post to check if the current user is the owner
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Optional: Check if the user is the owner of the post or an admin
    if (post.userId !== userId /* && !req.user.isAdmin */) {
      return res.status(403).send("You do not have permission to delete this post");
    }

    // Delete comments associated with the post first
    await prisma.comment.deleteMany({
      where: { postId: postId },
    });

    // Then delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    res.redirect('/forum');
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Error al eliminar el post.");
  }
});





module.exports = router;
