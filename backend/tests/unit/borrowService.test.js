const sequelize = require('../../config/database');
const { User, Book, BorrowRequest } = require('../../config/associations');
const borrowService = require('../../modules/borrow/borrowService');

describe('Módulo Borrow (Testes Unitários de Serviço)', () => {
    let owner, requester, otherUser, book, anotherBook;

    beforeAll(async () => {
        // Inicializa o banco de dados em memória para os testes
        await sequelize.sync({ force: true });

        // Setup inicial dos usuários
        owner = await User.create({ username: 'owner1', fullName: 'Owner One', email: 'owner1@test.com', password: '123' });
        requester = await User.create({ username: 'req1', fullName: 'Requester One', email: 'req1@test.com', password: '123' });
        otherUser = await User.create({ username: 'other1', fullName: 'Other One', email: 'other1@test.com', password: '123' });

        // Setup dos livros
        book = await Book.create({ title: 'Clean Code', author: 'Robert Martin', ownerId: owner.id });
        anotherBook = await Book.create({ title: 'Refactoring', author: 'Martin Fowler', ownerId: owner.id });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('requestBorrow', () => {
        it('deve criar uma solicitação de empréstimo pendente com sucesso (Sucesso)', async () => {
            const req = await borrowService.requestBorrow(book.id, requester.id);
            expect(req).toBeDefined();
            expect(req.status).toBe('pendente');
            expect(req.bookId).toBe(book.id);
            expect(req.requesterId).toBe(requester.id);
            expect(req.ownerId).toBe(owner.id);
        });

        it('deve impedir de solicitar empréstimo para livro inexistente (Caso Negativo)', async () => {
            await expect(borrowService.requestBorrow(999, requester.id))
                .rejects.toThrow('Livro não encontrado.');
        });

        it('deve impedir que o dono solicite empréstimo do próprio livro (Caso Negativo / Autorização)', async () => {
            await expect(borrowService.requestBorrow(anotherBook.id, owner.id))
                .rejects.toThrow('Você não pode solicitar o empréstimo do próprio livro.');
        });

        it('deve impedir solicitação duplicada se já houver uma pendente (Caso Negativo)', async () => {
            await expect(borrowService.requestBorrow(book.id, otherUser.id))
                .rejects.toThrow('Já existe uma solicitação pendente para este livro.');
        });
    });

    describe('approveBorrowRequest', () => {
        let pendingRequest, duplicateRequest;

        beforeAll(async () => {
            // Cria um pedido pendente para o anotherBook
            pendingRequest = await BorrowRequest.create({
                bookId: anotherBook.id,
                requesterId: requester.id,
                ownerId: owner.id,
                status: 'pendente'
            });

            // Cria um outro pedido pendente para o anotherBook por outro usuário
            duplicateRequest = await BorrowRequest.create({
                bookId: anotherBook.id,
                requesterId: otherUser.id,
                ownerId: owner.id,
                status: 'pendente'
            });
        });

        it('deve impedir aprovação por quem não é o dono do livro (Caso Negativo / Autorização)', async () => {
            await expect(borrowService.approveBorrowRequest(pendingRequest.id, otherUser.id))
                .rejects.toThrow('Você não tem permissão para aprovar esta solicitação.');
        });

        it('deve aprovar a solicitação, marcar livro como emprestado e rejeitar outras solicitações do mesmo livro (Sucesso)', async () => {
            const approved = await borrowService.approveBorrowRequest(pendingRequest.id, owner.id);
            expect(approved.status).toBe('aprovado');

            // Verifica se o livro mudou para emprestado
            const updatedBook = await Book.findByPk(anotherBook.id);
            expect(updatedBook.status).toBe('emprestado');

            // Verifica se a outra solicitação foi cancelada/rejeitada automaticamente
            const updatedDuplicate = await BorrowRequest.findByPk(duplicateRequest.id);
            expect(updatedDuplicate.status).toBe('rejeitado');
        });

        it('deve impedir aprovação de solicitação que não está pendente (Caso Negativo)', async () => {
            await expect(borrowService.approveBorrowRequest(pendingRequest.id, owner.id))
                .rejects.toThrow('Esta solicitação não está mais pendente.');
        });
    });

    describe('rejectBorrowRequest', () => {
        let requestToReject;

        beforeAll(async () => {
            requestToReject = await BorrowRequest.create({
                bookId: book.id,
                requesterId: otherUser.id,
                ownerId: owner.id,
                status: 'pendente'
            });
        });

        it('deve impedir rejeição por usuário comum que não é o dono (Caso Negativo / Autorização)', async () => {
            await expect(borrowService.rejectBorrowRequest(requestToReject.id, otherUser.id))
                .rejects.toThrow('Você não tem permissão para rejeitar esta solicitação.');
        });

        it('deve permitir ao dono rejeitar a solicitação (Sucesso)', async () => {
            const rejected = await borrowService.rejectBorrowRequest(requestToReject.id, owner.id);
            expect(rejected.status).toBe('rejeitado');
        });
    });

    describe('returnBook', () => {
        let activeRequest, unapprovedRequest;

        beforeAll(async () => {
            // Cria um livro já emprestado e uma solicitação aprovada correspondente
            const rentBook = await Book.create({ title: 'Clean Architecture', author: 'Robert Martin', ownerId: owner.id, status: 'emprestado' });
            activeRequest = await BorrowRequest.create({
                bookId: rentBook.id,
                requesterId: requester.id,
                ownerId: owner.id,
                status: 'aprovado'
            });

            unapprovedRequest = await BorrowRequest.create({
                bookId: book.id,
                requesterId: requester.id,
                ownerId: owner.id,
                status: 'pendente'
            });
        });

        it('deve impedir devolução por usuário que não seja o locatário ou o proprietário (Caso Negativo / Autorização)', async () => {
            await expect(borrowService.returnBook(activeRequest.id, otherUser.id))
                .rejects.toThrow('Você não tem permissão para devolver este livro.');
        });

        it('deve impedir devolução de solicitação não aprovada (Caso Negativo)', async () => {
            await expect(borrowService.returnBook(unapprovedRequest.id, requester.id))
                .rejects.toThrow('Este livro não está marcado como emprestado ou a solicitação não foi aprovada.');
        });

        it('deve devolver o livro com sucesso e alterar status para disponivel (Sucesso)', async () => {
            const returned = await borrowService.returnBook(activeRequest.id, requester.id);
            expect(returned.status).toBe('devolvido');

            const updatedBook = await Book.findByPk(activeRequest.bookId);
            expect(updatedBook.status).toBe('disponivel');
        });
    });
});
