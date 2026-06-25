const request = require('supertest');
const app = require('../../app');
const sequelize = require('../../config/database');
const User = require('../../modules/user/userModel');

beforeAll(async () => {
    // Sincroniza o banco de dados antes dos testes de integração
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    // Fecha a conexão com o banco
    await sequelize.close();
});

describe('Fluxo de Autenticação (Integração)', () => {
    it('deve cadastrar um novo usuário válido', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                username: 'leitor1',
                fullName: 'Leitor Um',
                email: 'leitor1@email.com',
                password: 'password123',
                confirmPassword: 'password123'
            });

        expect(res.status).toBe(302); // Redirecionamento após cadastro
        expect(res.headers.location).toBe('/login');

        // Verifica no banco se foi inserido
        const user = await User.findOne({ where: { username: 'leitor1' } });
        expect(user).not.toBeNull();
        expect(user.fullName).toBe('Leitor Um');
    });

    it('deve rejeitar cadastro com e-mail duplicado', async () => {
        // Tenta cadastrar com o mesmo email de 'leitor1'
        const res = await request(app)
            .post('/register')
            .send({
                username: 'leitor2',
                fullName: 'Leitor Dois',
                email: 'leitor1@email.com', // Duplicado!
                password: 'password123',
                confirmPassword: 'password123'
            });

        // Retorna 400 por erro de validação ou erro de controle
        expect(res.status).toBe(400);
    });

    it('deve realizar login com sucesso e criar sessão', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                login: 'leitor1',
                password: 'password123'
            });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/books');
    });
});
