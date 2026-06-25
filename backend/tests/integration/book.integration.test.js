const request = require('supertest');
const app = require('../../app');
const sequelize = require('../../config/database');
const Book = require('../../modules/book/bookModel');

let cookie;

beforeAll(async () => {
    // Sincroniza o banco de dados antes dos testes de integração
    await sequelize.sync({ force: true });

    // Criar um usuário de teste
    await request(app)
        .post('/register')
        .send({
            username: 'dono1',
            fullName: 'Dono Um',
            email: 'dono1@email.com',
            password: 'password123',
            confirmPassword: 'password123'
        });

    // Fazer login para obter o cookie de sessão
    const loginRes = await request(app)
        .post('/login')
        .send({
            login: 'dono1',
            password: 'password123'
        });

    cookie = loginRes.headers['set-cookie'];
});

afterAll(async () => {
    // Fecha a conexão com o banco
    await sequelize.close();
});

describe('Fluxo de Empréstimo de Livros (Integração)', () => {
    it('deve rejeitar anunciar livro se não estiver autenticado', async () => {
        const res = await request(app)
            .post('/books')
            .send({
                title: 'O Alienista',
                author: 'Machado de Assis',
                description: 'Humor e psicologia'
            });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/login');
    });

    it('deve anunciar um livro válido quando autenticado', async () => {
        const res = await request(app)
            .post('/books')
            .set('Cookie', cookie)
            .send({
                title: 'O Alienista',
                author: 'Machado de Assis',
                description: 'Humor e psicologia'
            });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/books');

        const book = await Book.findOne({ where: { title: 'O Alienista' } });
        expect(book).not.toBeNull();
        expect(book.author).toBe('Machado de Assis');
    });

    it('deve rejeitar anunciar um livro com título duplicado pelo mesmo usuário', async () => {
        // Tenta anunciar o mesmo título 'O Alienista' pelo mesmo usuário
        const res = await request(app)
            .post('/books')
            .set('Cookie', cookie)
            .send({
                title: 'O Alienista',
                author: 'Machado de Assis',
                description: 'Segunda cópia'
            });

        // Retorna 400 por erro de negócio/validação
        expect(res.status).toBe(400);
    });
});
