const { validateRegisterInput } = require('../../modules/user/userValidationHelper');

describe('Validação de Cadastro de Usuários (Unitário)', () => {
    it('deve retornar erro quando o username for muito curto', () => {
        const errors = validateRegisterInput({
            username: 'ab',
            email: 'test@test.com',
            password: 'password123'
        });
        expect(errors).toContain('username.minLength');
    });

    it('deve retornar erro quando o email for inválido', () => {
        const errors = validateRegisterInput({
            username: 'validuser',
            email: 'invalid-email',
            password: 'password123'
        });
        expect(errors).toContain('email.invalid');
    });

    it('deve passar sem erros quando os dados forem válidos', () => {
        const errors = validateRegisterInput({
            username: 'validuser',
            email: 'test@test.com',
            password: 'password123'
        });
        expect(errors.length).toBe(0);
    });
});
