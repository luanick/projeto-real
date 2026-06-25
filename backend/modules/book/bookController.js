const bookService = require('./bookService');
const asyncHandler = require('../../middlewares/asyncHandler');

exports.renderBooksFeed = asyncHandler(async (req, res) => {
    const books = await bookService.listAllBooks();
    res.render('feed', { title: 'Biblioteca de Empréstimos - Início', books });
});

exports.renderNewBookForm = (req, res) => {
    res.render('upload', { title: 'Anunciar Livro' });
};

exports.createBook = asyncHandler(async (req, res) => {
    const { title, author, description } = req.body;
    const ownerId = req.session.user.id;

    try {
        await bookService.createBook(title, author, description, ownerId);
    } catch (err) {
        err.status = 400;
        throw err;
    }

    req.flash('success', 'Livro anunciado com sucesso!');
    res.redirect('/books');
});
