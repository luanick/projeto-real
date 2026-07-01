const BorrowRequest = require('./borrowModel');
const Book = require('../book/bookModel');
const User = require('../user/userModel');

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

async function listIncomingRequests(ownerId) {
    return await BorrowRequest.findAll({
        where: { ownerId },
        include: [
            {
                model: Book,
                as: 'book',
                attributes: ['id', 'title', 'author', 'status']
            },
            {
                model: User,
                as: 'requester',
                attributes: ['id', 'username', 'fullName']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
}

async function listOutgoingRequests(requesterId) {
    return await BorrowRequest.findAll({
        where: { requesterId },
        include: [
            {
                model: Book,
                as: 'book',
                attributes: ['id', 'title', 'author', 'status']
            },
            {
                model: User,
                as: 'owner',
                attributes: ['id', 'username', 'fullName']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
}

async function approveBorrowRequest(requestId, ownerId) {
    const request = await BorrowRequest.findByPk(requestId);
    if (!request) {
        throw new Error('Solicitação de empréstimo não encontrada.');
    }

    if (request.ownerId !== ownerId) {
        throw new Error('Você não tem permissão para aprovar esta solicitação.');
    }

    if (request.status !== 'pendente') {
        throw new Error('Esta solicitação não está mais pendente.');
    }

    const book = await Book.findByPk(request.bookId);
    if (!book) {
        throw new Error('Livro não encontrado.');
    }

    if (book.status === 'emprestado') {
        throw new Error('Este livro já está emprestado.');
    }

    // Aprova a solicitação atual
    request.status = 'aprovado';
    await request.save();

    // Altera o status do livro para emprestado
    book.status = 'emprestado';
    await book.save();

    // Rejeita todas as outras solicitações pendentes para o mesmo livro
    await BorrowRequest.update(
        { status: 'rejeitado' },
        {
            where: {
                bookId: book.id,
                status: 'pendente'
            }
        }
    );

    return request;
}

async function rejectBorrowRequest(requestId, ownerId) {
    const request = await BorrowRequest.findByPk(requestId);
    if (!request) {
        throw new Error('Solicitação de empréstimo não encontrada.');
    }

    if (request.ownerId !== ownerId) {
        throw new Error('Você não tem permissão para rejeitar esta solicitação.');
    }

    if (request.status !== 'pendente') {
        throw new Error('Esta solicitação não está mais pendente.');
    }

    request.status = 'rejeitado';
    await request.save();

    return request;
}

module.exports = {
    requestBorrow,
    listIncomingRequests,
    listOutgoingRequests,
    approveBorrowRequest,
    rejectBorrowRequest
};