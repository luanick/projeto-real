const request = require('supertest');
const app = require('../../app');
const { User, Book, BorrowRequest } = require('../../config/associations');

beforeAll(async () => {
    // Sincroniza o banco de dados antes dos testes
    await Book.sync({ force: true });
    await User.sync({ force: true });
    await BorrowRequest.sync({ force: true });
});

afterAll(async () => {
    // Fecha a conexão
});

describe('Fluxo de Empréstimo (Integração - TDD)', () => {
    
    it('deve permitir solicitar um empréstimo (Caso de Sucesso)', async () => {
        // Setup: Criar um dono, um solicitante e um livro
        const owner = await User.create({ username: 'dono', fullName: 'Dono', email: 'dono@test.com', password: '123' });
        const requester = await User.create({ username: 'aluno', fullName: 'Aluno', email: 'aluno@test.com', password: '123' });
        const book = await Book.create({ title: 'Livro Teste', author: 'Autor', ownerId: owner.id });

        const res = await request(app)
            .post(`/books/${book.id}/request`)
            .set('Cookie', [`session_id=fake_session_${requester.id}`]) // Ajuste conforme seu sistema de auth
            .send({});
            
        expect(res.status).toBe(302); // Espera redirecionamento
        
        const requestCreated = await BorrowRequest.findOne({ where: { bookId: book.id } });
        expect(requestCreated).not.toBeNull();
        expect(requestCreated.requesterId).toBe(requester.id);
    });

    it('deve impedir que o dono alugue o próprio livro (Caso Negativo)', async () => {
        const owner = await User.create({ username: 'dono2', fullName: 'Dono', email: 'dono2@test.com', password: '123' });
        const book = await Book.create({ title: 'Livro Proprio', author: 'Autor', ownerId: owner.id });

        const res = await request(app)
            .post(`/books/${book.id}/request`)
            .set('Cookie', [`session_id=fake_session_${owner.id}`])
            .send({});
            
        // Esperamos erro 400 ou mensagem de erro
        expect(res.status).toBe(400); 
    });
});