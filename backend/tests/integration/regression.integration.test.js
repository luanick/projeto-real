const request = require('supertest');
const app = require('../../app');
const sequelize = require('../../config/database');
const User = require('../../modules/user/userModel');
const Book = require('../../modules/book/bookModel');

beforeAll(async () => {
    // Sincroniza o banco de dados antes dos testes de regressão
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    // Fecha a conexão com o banco de dados
    await sequelize.close();
});

describe('Testes de Regressão (Garantia de que funcionalidades antigas continuam funcionando)', () => {
    
    // Teste de Regressão 1: Valida se o fluxo clássico de criação de usuário ainda funciona
    it('deve garantir que o cadastro de usuário continue funcionando perfeitamente (Regressão 1)', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                username: 'usuario_regressao',
                fullName: 'Usuário Regressão',
                email: 'regressao@email.com',
                password: 'password123',
                confirmPassword: 'password123'
            });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/login');

        const user = await User.findOne({ where: { username: 'usuario_regressao' } });
        expect(user).not.toBeNull();
        expect(user.fullName).toBe('Usuário Regressão');
    });

    // Teste de Regressão 2: Valida se a criação de anúncio de livro clássico ainda funciona
    it('deve garantir que a criação de livros continue funcionando perfeitamente (Regressão 2)', async () => {
        // Primeiro cria um usuário para ser o dono
        const owner = await User.create({
            username: 'dono_regressao',
            fullName: 'Dono Regressao',
            email: 'dono_regressao@email.com',
            password: 'password123'
        });

        const res = await request(app)
            .post('/books')
            .set('Cookie', [`session_id=fake_session_${owner.id}`])
            .send({
                title: 'Livro de Regressão',
                author: 'Autor de Regressão',
                description: 'Este é um teste de regressão para verificar criação'
            });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/books');

        const book = await Book.findOne({ where: { title: 'Livro de Regressão' } });
        expect(book).not.toBeNull();
        expect(book.author).toBe('Autor de Regressão');
    });
});
