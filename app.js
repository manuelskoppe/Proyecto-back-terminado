const express = require("express");
const { create } = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

// Configuración de Handlebars
const hbs = create({
  extname: 'hbs',
  defaultLayout: 'main',
  partialsDir: 'views/partials',
  //helpers: require('./utils/helpers')
});

// Configuración de Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'tu_clave_secreta',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Archivos estáticos
app.use(express.static('public'));

// Configuración de Handlebars
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

// Configuraciones adicionales
require('./config/passport');
require('./config/cloudinary');

// Rutas
app.use("/", require("./routes/index")); // Solo montar el archivo index.js

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
