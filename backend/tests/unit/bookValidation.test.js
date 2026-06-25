const { validateBookInput } = require('../../modules/book/bookValidator');

describe('Validação de Cadastro de Livros (Unitário)', () => {
    it('deve retornar erro quando o título estiver vazio', () => {
        const errors = validateBookInput({
            title: '',
            author: 'Machado de Assis',
            description: 'Um clássico brasileiro'
        });

        expect(errors).toContain('title.required');
    });

    it('deve retornar erro quando o autor estiver vazio', () => {
        const errors = validateBookInput({
            title: 'Dom Casmurro',
            author: '',
            description: 'Um clássico brasileiro'
        });

        expect(errors).toContain('author.required');
    });

    it('deve passar sem erros quando título e autor forem válidos', () => {
        const errors = validateBookInput({
            title: 'Dom Casmurro',
            author: 'Machado de Assis',
            description: 'Um clássico brasileiro'
        });

        expect(errors.length).toBe(0);
    });
});
