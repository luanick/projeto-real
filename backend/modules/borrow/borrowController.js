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

exports.listBorrows = asyncHandler(async (req, res) => {
    const userId = req.session.user.id;
    
    const incomingRequests = await borrowService.listIncomingRequests(userId);
    const outgoingRequests = await borrowService.listOutgoingRequests(userId);
    
    res.render('borrows', { 
        title: 'Biblioteca de Empréstimos - Solicitações', 
        incomingRequests, 
        outgoingRequests 
    });
});

exports.approveBorrow = asyncHandler(async (req, res) => {
    const requestId = req.params.id;
    const ownerId = req.session.user.id;

    try {
        await borrowService.approveBorrowRequest(requestId, ownerId);
    } catch (err) {
        err.status = 400;
        throw err;
    }

    req.flash('success', 'Solicitação de empréstimo aprovada com sucesso!');
    res.redirect('/borrows');
});

exports.rejectBorrow = asyncHandler(async (req, res) => {
    const requestId = req.params.id;
    const ownerId = req.session.user.id;

    try {
        await borrowService.rejectBorrowRequest(requestId, ownerId);
    } catch (err) {
        err.status = 400;
        throw err;
    }

    req.flash('success', 'Solicitação de empréstimo recusada com sucesso.');
    res.redirect('/borrows');
});