const request = require('supertest');
const app = require('../../app');
const { User, Book, BorrowRequest } = require('../../config/associations');
const sequelize = require('../../config/database');

beforeAll(async () => {
    // Sincroniza o banco de dados antes dos testes
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    // Fecha a conexão com o banco de dados
    await sequelize.close();
});

describe('Fluxo de Empréstimo e Devolução (Integração - API)', () => {
    let owner, requester, unauthorizedUser, book, anotherBook, activeRequest;

    beforeAll(async () => {
        owner = await User.create({ username: 'owner_api', fullName: 'Owner API', email: 'owner_api@test.com', password: '123' });
        requester = await User.create({ username: 'req_api', fullName: 'Requester API', email: 'req_api@test.com', password: '123' });
        unauthorizedUser = await User.create({ username: 'unauth_api', fullName: 'Unauth API', email: 'unauth_api@test.com', password: '123' });
        
        book = await Book.create({ title: 'Design Patterns', author: 'Gang of Four', ownerId: owner.id });
        anotherBook = await Book.create({ title: 'Refactoring HTML', author: 'Elliotte Rusty', ownerId: owner.id });
    });

    // 1. Autenticação: Deve impedir acesso à listagem de solicitações sem autenticação (Caso Negativo / Autenticação)
    it('deve impedir acesso à listagem de solicitações sem autenticação (Autenticação)', async () => {
        const res = await request(app)
            .get('/borrows');
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/login');
    });

    // 2. Autenticação: Deve listar solicitações de empréstimo para usuário autenticado (Caso de Sucesso / Autenticação)
    it('deve listar solicitações de empréstimo para usuário autenticado (Sucesso)', async () => {
        const res = await request(app)
            .get('/borrows')
            .set('Cookie', [`session_id=fake_session_${requester.id}`]);
        expect(res.status).toBe(200);
    });

    // 3. Solicitação: Deve permitir solicitar um empréstimo (Caso de Sucesso)
    it('deve permitir solicitar um empréstimo (Sucesso)', async () => {
        const res = await request(app)
            .post(`/books/${book.id}/request`)
            .set('Cookie', [`session_id=fake_session_${requester.id}`])
            .send({});
            
        expect(res.status).toBe(302); // Espera redirecionamento para /books
        
        const requestCreated = await BorrowRequest.findOne({ where: { bookId: book.id, requesterId: requester.id } });
        expect(requestCreated).not.toBeNull();
        expect(requestCreated.status).toBe('pendente');
    });

    // 4. Solicitação: Deve impedir que o dono alugue o próprio livro (Caso Negativo / Autorização)
    it('deve impedir que o dono alugue o próprio livro (Caso Negativo)', async () => {
        const res = await request(app)
            .post(`/books/${book.id}/request`)
            .set('Cookie', [`session_id=fake_session_${owner.id}`])
            .send({});
            
        expect(res.status).toBe(400); 
    });

    // 5. Solicitação: Deve impedir solicitação para livro inexistente (Caso Negativo)
    it('deve impedir solicitar empréstimo de livro inexistente (Caso Negativo)', async () => {
        const res = await request(app)
            .post('/books/9999/request')
            .set('Cookie', [`session_id=fake_session_${requester.id}`])
            .send({});
            
        expect(res.status).toBe(400); 
    });

    // 6. Aprovação: Deve impedir aprovação por usuário comum que não é o dono (Caso Negativo / Autorização)
    it('deve impedir aprovação por quem não é o dono do livro (Autorização / Caso Negativo)', async () => {
        const pending = await BorrowRequest.create({
            bookId: anotherBook.id,
            requesterId: requester.id,
            ownerId: owner.id,
            status: 'pendente'
        });

        const res = await request(app)
            .post(`/borrows/${pending.id}/approve`)
            .set('Cookie', [`session_id=fake_session_${unauthorizedUser.id}`])
            .send({});

        expect(res.status).toBe(400); // Erro de permissão
    });

    // 7. Aprovação: Deve permitir ao dono aprovar a solicitação de empréstimo (Caso de Sucesso)
    it('deve permitir ao dono aprovar a solicitação de empréstimo (Sucesso)', async () => {
        const pending = await BorrowRequest.findOne({ where: { bookId: book.id, status: 'pendente' } });
        
        const res = await request(app)
            .post(`/borrows/${pending.id}/approve`)
            .set('Cookie', [`session_id=fake_session_${owner.id}`])
            .send({});
            
        expect(res.status).toBe(302); // Redireciona para /borrows

        const approved = await BorrowRequest.findByPk(pending.id);
        expect(approved.status).toBe('aprovado');
        
        const updatedBook = await Book.findByPk(book.id);
        expect(updatedBook.status).toBe('emprestado');

        // Guarda essa solicitação aprovada para o teste de devolução
        activeRequest = approved;
    });

    // 8. Rejeição: Deve permitir ao dono rejeitar a solicitação de empréstimo (Caso de Sucesso)
    it('deve permitir ao dono rejeitar uma solicitação de empréstimo pendente (Sucesso)', async () => {
        const toReject = await BorrowRequest.create({
            bookId: anotherBook.id,
            requesterId: unauthorizedUser.id,
            ownerId: owner.id,
            status: 'pendente'
        });

        const res = await request(app)
            .post(`/borrows/${toReject.id}/reject`)
            .set('Cookie', [`session_id=fake_session_${owner.id}`])
            .send({});

        expect(res.status).toBe(302);

        const rejected = await BorrowRequest.findByPk(toReject.id);
        expect(rejected.status).toBe('rejeitado');
    });

    // 9. Devolução: Deve impedir a devolução de livro por usuário que não participou do empréstimo (Caso Negativo / Autorização)
    it('deve impedir que usuário não autorizado devolva o livro (Autorização / Caso Negativo)', async () => {
        const res = await request(app)
            .post(`/borrows/${activeRequest.id}/return`)
            .set('Cookie', [`session_id=fake_session_${unauthorizedUser.id}`])
            .send({});

        expect(res.status).toBe(400);
    });

    // 10. Devolução: Deve permitir ao locatário devolver o livro (Caso de Sucesso)
    it('deve permitir ao locatário devolver o livro com sucesso (Sucesso)', async () => {
        const res = await request(app)
            .post(`/borrows/${activeRequest.id}/return`)
            .set('Cookie', [`session_id=fake_session_${requester.id}`])
            .send({});

        expect(res.status).toBe(302); // Redireciona para /borrows

        const returned = await BorrowRequest.findByPk(activeRequest.id);
        expect(returned.status).toBe('devolvido');

        const updatedBook = await Book.findByPk(book.id);
        expect(updatedBook.status).toBe('disponivel');
    });
});