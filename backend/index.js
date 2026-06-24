var express = require('express');
var router = express.Router();


// Rota para a página inicial 
router.get('/', function (req, res, next) {
    res.render('landing', { title: 'Biblioteca de Empréstimos - Início' });
});


module.exports = router;