// carrega a classe 'Sequelize' do módulo 'sequelize'
const { Sequelize } = require('sequelize');
// carrega as variaveis de ambiente através do módulo 'dotenv'
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'test') {
    // Configuração em memória para rodar testes rápidos sem dependência externa
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define: {
            timestamps: true,
            underscored: true
        }
    });
} else if (process.env.DB_DIALECT === 'sqlite' || !process.env.DB_NAME) {
    // Usar SQLite como fallback ou se explicitamente configurado
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: 'database.sqlite',
        logging: false,
        define: {
            timestamps: true,
            underscored: true
        }
    });
} else {
    // cria uma instância da classe 'Sequelize' para MySQL
    sequelize = new Sequelize(
        // variáveis carregas do arquivo .env 
        // sobre o banco de dados
        process.env.DB_NAME,          // nome do banco de dados
        process.env.DB_USER,          // nome do usuário
        process.env.DB_PASSWORD,      // senha do usuário
        {
            // sobre o servidor
            host: process.env.DB_HOST || 'localhost', // endereço do servidor do banco de dados
            port: process.env.DB_PORT || 3306, // porta do servidor do banco de dados
            dialect: 'mysql',          // tipo do banco de dados
            logging: false,            // liga/desliga log de SQL no terminal
            define: {
                timestamps: true,       // cria os campos createdAt e updatedAt
                underscored: true       // usa a forma created_at e updated_at
            }
        }
    );
}

// torna a instância 'sequelize' publica para uso
module.exports = sequelize;