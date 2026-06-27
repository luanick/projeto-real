const borrowService = require('./borrowService');
const asyncHandler = require('../../middlewares/asyncHandler');

exports.requestBorrow = asyncHandler(async (req, res) => {
    const bookId = req.params.id;
    const requesterId = req.session.user.id;

    try {
        // Chamamos a lógica de negócio no service
        await borrowService.requestBorrow(bookId, requesterId);
    } catch (err) {
        // Capturamos erros de negócio (ex: tentar alugar o próprio livro)
        // O asyncHandler vai repassar para o seu middleware de erro global
        err.status = 400;
        throw err;
    }

    // Feedback para o utilizador
    req.flash('success', 'Solicitação de empréstimo enviada com sucesso!');
    res.redirect('/books');
});