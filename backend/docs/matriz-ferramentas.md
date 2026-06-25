# Matriz Comparativa de Ferramentas de Teste

Este documento inicia a pesquisa e comparação de ferramentas de testes solicitada para o projeto, incluindo uma análise de impacto e aplicabilidade das tecnologias frente aos requisitos técnicos.

---

## 1. Tabela Resumo (Modelo de Matriz)

| Ferramenta | Camada da Pirâmide | O que testa? | Substitui Vitest + Supertest? | Melhor Uso no Projeto |
| :--- | :--- | :--- | :--- | :--- |
| **Vitest + Supertest** | Unitário / API | Funções, serviços e rotas HTTP. | *Base do projeto* | Testar a lógica de negócio e as rotas locais do Express. |
| **Jest** | Unitário / Integração | Funções, serviços e lógica. | Substitui parcialmente o Vitest. | Projetos JS/TS tradicionais. |
| **Playwright** | E2E / Interface | Fluxos reais de ponta a ponta no navegador. | Não, complementa. | Testar fluxos complexos como login, cadastro e solicitação de empréstimo. |
| **Cypress** | E2E / Interface | Interface web e interações do usuário. | Não, complementa. | Testar interface gráfica e fluxos de navegação visual. |
| **Testing Library** | Componentes / UI | Comportamento e renderização de componentes de interface. | Não, complementa. | Testes em frameworks SPA (React/Vue) caso a arquitetura evolua. |
| **Postman / Newman** | API | Coleções de requisições HTTP e fluxos de API. | Substitui parcialmente para testes de API/rotas. | Validar endpoints JSON de forma independente da stack. |
| **k6** | Performance / Carga | Volume, latência e estabilidade sob carga. | Não, complementa. | Validar quantos acessos simultâneos a biblioteca de empréstimos suporta. |
| **OWASP ZAP** | Segurança | Vulnerabilidades web conhecidas (OWASP Top 10). | Não, complementa. | Análise de segurança nas rotas e formulários (proteção contra SQLi, XSS). |
| **GitHub Actions** | CI/CD (Pipeline) | Execução automatizada da suíte de testes. | Não, complementa. | Integração contínua (executar testes unitários e de integração a cada push). |

---

## 2. Detalhamento das Ferramentas da Stack Atual

### Vitest + Supertest
1. **Para que serve?** Vitest é um executor de testes extremamente rápido e moderno (baseado em Vite). Supertest é uma biblioteca para testar agentes HTTP e rotas de servidores Node.js.
2. **Que tipo de teste atende?** Testes unitários (lógica pura) e testes de integração/API (chamadas de rotas sem necessidade de subir o servidor fisicamente).
3. **Em qual camada da pirâmide se encaixa?** Unitário e Integração.
4. **Testa o quê?** Backend e APIs.
5. **Substitui ou complementa?** É a base principal de testes definida no escopo.
6. **Exige mudanças?** Não. É nativo para a stack Node.js/Express.
7. **Instalação básica:**
   ```bash
   npm install -D vitest supertest
   ```
8. **Exemplo mínimo de uso:**
   ```javascript
   const request = require('supertest');
   const app = require('./app');
   
   it('GET / retorna status 200', async () => {
     const res = await request(app).get('/');
     expect(res.status).toBe(200);
   });
   ```
9. **Evidência:** Relatórios de sucesso/falha no console e relatórios de cobertura de código (coverage).
10. **Vantagens:** Execução extremamente rápida, compatibilidade total com módulos ES e CommonJS, e facilidade para mockar banco de dados na memória.
11. **Desvantagens:** Não simula a renderização final do navegador com execução de scripts do lado do cliente (JS do frontend).

### GitHub Actions
1. **Para que serve?** Ferramenta de automação de fluxos de trabalho (CI/CD) integrada ao GitHub.
2. **Que tipo de teste atende?** Automação e execução de pipelines de testes (executa testes unitários, integração e E2E a cada alteração de código).
3. **Em qual camada da pirâmide se encaixa?** Pipeline / Integração Contínua.
4. **Testa o quê?** O fluxo de integração (garante que alterações de código não quebraram as suítes existentes).
5. **Substitui ou complementa?** Complementa a suíte executando-a automaticamente.
6. **Exige mudanças?** Não, exige apenas a criação de um arquivo de workflow em `.github/workflows/`.
7. **Instalação básica:** Configuração declarativa via arquivo `.yml`.
8. **Exemplo mínimo de uso (Ver arquivo `.github/workflows/tests.yml` do projeto):**
   ```yaml
   name: CI Run
   on: [push]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - run: npm install
         - run: npm test
   ```
9. **Evidência:** Badge de status no repositório (Passando/Falhando) e log detalhado da execução de cada comando da pipeline.
10. **Vantagens:** Totalmente integrado ao ecossistema do GitHub, gratuito para repositórios públicos, e impede que código quebrado seja mesclado na branch principal.
11. **Desvantagens:** Depende de créditos/limites de execução em repositórios privados e requer configurações complexas caso precise de dependências de banco de dados locais robustos (embora tenhamos mitigado isso usando SQLite em memória).

---

## 3. Nota sobre Publicação e Hospedagem na Cloudflare

> [!IMPORTANT]
> **Desafio com EJS e Backend Tradicional na Cloudflare Pages**
>
> A Cloudflare Pages hospeda originalmente **arquivos estáticos** (HTML, CSS, JS). Ela não interpreta nativamente arquivos EJS, pois o EJS exige um servidor Node.js ativo (como Express) rodando do lado do servidor (Server-Side Rendering) para processar as variáveis e renderizar o HTML final para o cliente.
>
> Para viabilizar a arquitetura e cumprir os requisitos, a equipe propõe duas abordagens possíveis para a hospedagem final:
>
> 1. **Compilação Estática (Build Time):**
>    Escrever um script Node.js na pipeline do GitHub Actions que renderiza todas as views EJS do projeto para HTML puro no momento da publicação (gerando uma pasta `/dist` ou `/build` estática) e hospedar essa pasta estática na Cloudflare Pages. O frontend consumiria o backend Express (que estaria hospedado em uma plataforma gratuita compatível com Node.js completo, como Render, Koyeb ou Fly.io) via chamadas de API (AJAX/Fetch).
>
> 2. **Cloudflare Workers com Adaptador Serverless:**
>    Migrar/adaptar o servidor Express para rodar em uma **Cloudflare Worker/Pages Function**. Isso exige o uso de adaptadores (como Hono ou adaptadores específicos de Express para Workers) e a substituição da biblioteca SQLite de arquivo local para um banco na nuvem compatível (como Cloudflare D1 ou um banco MySQL hospedado em serviço SaaS), uma vez que Cloudflare Workers rodam sob runtime V8 e não possuem acesso a sistema de arquivos persistente local.
