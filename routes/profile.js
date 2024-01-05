const express = require('express');
const router = express.Router();

const prisma = require('../prisma');
const upload = require('../config/multer');
const handleUpload = require('../middlewares/handleUpload');

router.get('/', async (req, res) => {
  const weeklies = await prisma.post.findMany({
    where: {
      userId: req.user.id,
    },
  });

  res.render('profile', { user: req.user, weeklies });
});

router.get('/update', (req, res) => {
  res.render('profile-form', { user: req.user });
});

router.put('/', upload.single('photo'), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
  
    const cldRes = await handleUpload(dataURI);
  
    const userUpdated = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        username: req.body.username,
        email: req.body.email,
        photo: cldRes.secure_url,
        country: req.body.country,
        age: Number(req.body.age),
        profession: req.body.profession,
      },
    });
  
    res.redirect('/profile'); 
  } catch (error) {
    console.log(error);
    res.redirect('/profile');
  }
});

module.exports = router;
