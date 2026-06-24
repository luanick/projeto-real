var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const errorHandler = require('./middlewares/errorHandler');

var indexRouter = require('./routes/index');
var userRoutes = require("./modules/user/userRoutes");
var bookRoutes = require("./modules/book/bookRoutes");

var app = express();
var expressLayouts = require('express-ejs-layouts');

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('layout', path.join(__dirname, 'views/layouts/main'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'bibliotecasecreta123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 dia
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.user = req.session.user || null; // Globaliza o objeto user para as views
    next();
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', userRoutes);
app.use('/', bookRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(errorHandler);

// Configuração do Sequelize para conexão com o banco de dados
require("./config/associations");
const sequelize = require('./config/database');

// Sincroniza o modelo com o banco de dados (apenas fora do ambiente de testes)
if (process.env.NODE_ENV !== 'test') {
    sequelize.sync({ alter: true })
        .then(() => console.log('Banco de dados sincronizado!'))
        .catch(err => console.error('Erro ao sincronizar banco:', err));
}

module.exports = app;
