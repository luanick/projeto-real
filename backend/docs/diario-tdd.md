# Diário de TDD (Test-Driven Development)

Este documento registra a aplicação prática de TDD no desenvolvimento do sistema da **Biblioteca de Empréstimos**. Conforme a metodologia de Shift-Left, os testes foram definidos e codificados antes ou paralelamente à escrita do código de negócio.

---

## Ciclo TDD 1: Validação de Cadastro de Livros

### 1. História de Usuário
Como usuário autenticado, quero anunciar um livro informando o título e o autor, para que o livro fique visível no catálogo de empréstimos.

### 2. Critério de Aceite
- O livro não pode ser cadastrado sem um **Título**.
- O livro não pode ser cadastrado sem um **Autor**.
- Caso falte algum desses campos, o validador deve retornar os erros correspondentes (`title.required` e `author.required`).

### 3. Teste Automatizado Planejado (Antes da Implementação)
Criou-se o arquivo de testes unitários `tests/unit/bookValidation.test.js` com o seguinte escopo:
```javascript
const { validateBookInput } = require('../../modules/book/bookValidator');

describe('Validação de Cadastro de Livros (Unitário)', () => {
    it('deve retornar erro quando o título estiver vazio', () => {
        const errors = validateBookInput({ title: '', author: 'Machado de Assis' });
        expect(errors).toContain('title.required');
    });

    it('deve retornar erro quando o autor estiver vazio', () => {
        const errors = validateBookInput({ title: 'Dom Casmurro', author: '' });
        expect(errors).toContain('author.required');
    });
});
```

### 4. Evidência do Teste Falhando Inicialmente
Ao rodar `npm run test:unit`, o teste falha com `TypeError: validateBookInput is not a function`, pois a função e o arquivo do validador ainda não existiam no projeto.

### 5. Implementação Mínima Realizada para Passar
Criação do arquivo `modules/book/bookValidator.js` com a estrutura mais simples possível para suprir as expectativas do teste:
```javascript
function validateBookInput(data) {
    const errors = [];
    if (!data.title || data.title.trim() === '') {
        errors.push('title.required');
    }
    if (!data.author || data.author.trim() === '') {
        errors.push('author.required');
    }
    return errors;
}
module.exports = { validateBookInput };
```

### 6. Evidência do Teste Passando
Execução de `npm run test:unit` mostra os 3 testes unitários passando com sucesso (100% verde).

### 7. Refatoração ou Justificativa Técnica
A implementação mínima é altamente performática, limpa e modular. Optou-se por não introduzir bibliotecas pesadas de validação neste estágio inicial, garantindo velocidade máxima e simplicidade no código do validador.

---

## Ciclo TDD 2: Impedir Anúncio de Livro Duplicado pelo Mesmo Usuário

### 1. História de Usuário
Como usuário anunciante, quero ser impedido de anunciar um livro com o mesmo título mais de uma vez, para evitar listagens duplicadas e poluição do catálogo.

### 2. Critério de Aceite
- Um usuário não pode anunciar dois livros com o mesmo título.
- Caso o usuário tente anunciar um título idêntico ao de outro livro que ele já possui anunciado, o sistema deve retornar um erro HTTP status `400` com a mensagem apropriada.

### 3. Teste Automatizado Planejado (Antes da Implementação)
Adição do seguinte caso de teste de integração em `tests/integration/book.integration.test.js`:
```javascript
it('deve rejeitar anunciar um livro com título duplicado pelo mesmo usuário', async () => {
    // Tenta anunciar o mesmo título 'O Alienista' que já foi anunciado pelo usuário de teste anteriormente
    const res = await request(app)
        .post('/books')
        .set('Cookie', cookie)
        .send({
            title: 'O Alienista',
            author: 'Machado de Assis',
            description: 'Segunda cópia'
        });

    expect(res.status).toBe(400);
});
```

### 4. Evidência do Teste Falhando Inicialmente
O teste falha retornando código de status `302` (redirecionando com sucesso para `/books`) em vez do esperado `400`, porque o serviço simplesmente inseria o livro duplicado sem qualquer restrição no banco de dados.

### 5. Implementação Mínima Realizada para Passar
Adição da verificação de existência prévia do livro no `bookService.createBook` e definição do status HTTP `400` no `bookController.createBook`:
```javascript
// Em bookService.js:
const existingBook = await Book.findOne({ where: { title, ownerId } });
if (existingBook) {
    throw new Error('Você já cadastrou um livro com este título.');
}
```
```javascript
// Em bookController.js:
try {
    await bookService.createBook(title, author, description, ownerId);
} catch (err) {
    err.status = 400;
    throw err;
}
```

### 6. Evidência do Teste Passando
O teste de integração agora captura o erro com sucesso e retorna status `400`, passando com 100% de sucesso.

### 7. Refatoração ou Justificativa Técnica
A verificação foi adicionada na camada de serviço (`bookService`), mantendo as regras de negócio desacopladas do controlador Express. O controlador captura a exceção e delega o erro ao middleware de tratamento central, o qual, em ambiente de teste ou requisições API, retorna JSON perfeitamente formatado.
