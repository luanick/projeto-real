const Book = require('./bookModel');
const User = require('../user/userModel');

async function createBook(title, author, description, ownerId) {
    if (!title || !author) {
        throw new Error('Título e autor são campos obrigatórios.');
    }

    // TDD Ciclo 2: Impede o cadastro de livro com título duplicado pelo mesmo usuário
    const existingBook = await Book.findOne({ where: { title, ownerId } });
    if (existingBook) {
        throw new Error('Você já cadastrou um livro com este título.');
    }

    const book = await Book.create({
        title,
        author,
        description,
        ownerId
    });

    return book;
}

async function listAllBooks() {
    return await Book.findAll({
        include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'fullName']
        }],
        order: [['createdAt', 'DESC']]
    });
}

async function getBookById(id) {
    const book = await Book.findByPk(id, {
        include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'fullName']
        }]
    });
    if (!book) {
        throw new Error('Livro não encontrado.');
    }
    return book;
}

module.exports = {
    createBook,
    listAllBooks,
    getBookById
};
