require('dotenv').config();
const sequelize = require('./config/database');
require('./config/associations');

async function sync() {
    try {
        console.log('Iniciando sincronização com o banco de dados (Turso)...');
        // O { alter: true } sincroniza o schema adicionando novas tabelas/colunas sem apagar dados existentes
        await sequelize.sync({ alter: true });
        console.log('✅ Banco de dados sincronizado com sucesso!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Erro ao sincronizar o banco de dados:', err);
        process.exit(1);
    }
}

sync();
