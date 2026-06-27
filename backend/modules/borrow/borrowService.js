const BorrowRequest = require('./borrowModel');
const Book = require('../book/bookModel');

async function requestBorrow(bookId, requesterId) {
    // 1. Busca o livro para validar existência e dono
    const book = await Book.findByPk(bookId);
    if (!book) {
        throw new Error('Livro não encontrado.');
    }

    // 2. Regra de Negócio: Impede de alugar o próprio livro
    if (book.ownerId === requesterId) {
        throw new Error('Você não pode solicitar o empréstimo do próprio livro.');
    }

    // 3. Verifica se já existe uma solicitação pendente para este livro
    const existingRequest = await BorrowRequest.findOne({
        where: { 
            bookId: book.id, 
            status: 'pendente' 
        }
    });

    if (existingRequest) {
        throw new Error('Já existe uma solicitação pendente para este livro.');
    }

    // 4. Cria a solicitação
    const borrowRequest = await BorrowRequest.create({
        bookId: book.id,
        requesterId: requesterId,
        ownerId: book.ownerId,
        status: 'pendente'
    });

    return borrowRequest;
}

// Futuramente você pode adicionar métodos como listUserRequests, approveBorrow, etc.

module.exports = {
    requestBorrow
};