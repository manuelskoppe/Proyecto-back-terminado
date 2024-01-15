// users.js
const express = require('express');
const router = express.Router();
const prisma = require("../prisma");

// Ruta para obtener los usuarios registrados
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany(); // Cambia 'user' por el modelo correcto si es diferente
    // Formatear la fecha de cada usuario
    const usersWithFormattedDate = users.map(user => {
      return {
        ...user,
        // Formatear la fecha a un string más amigable
        createdAt: user.createdAt.toLocaleDateString('es-ES')
      };
    });
    res.render('usuarios', { users: usersWithFormattedDate }); // Asegúrate de que 'usuarios' sea el nombre correcto de tu vista de Handlebars.
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
