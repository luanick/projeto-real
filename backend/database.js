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
        dialectModule: require('@libsql/sqlite3'), // <-- ADICIONADO: Para os testes funcionarem com o novo driver do Turso
        logging: false,
        define: {
            timestamps: true,
            underscored: true
        }
    });
} else if (process.env.TURSO_DATABASE_URL || process.env.DB_DIALECT === 'sqlite' || !process.env.DB_NAME) {
    // Conecta ao Turso se a URL existir, ou usa SQLite local como fallback inteligente
    sequelize = new Sequelize({
        dialect: 'sqlite',
        // Se existir a variável do Turso, usa ela. Senão, cria o arquivo local na sua máquina
        storage: process.env.TURSO_DATABASE_URL || 'database.sqlite', 
        dialectModule: require('@libsql/sqlite3'), // <-- AQUI ESTÁ A MÁGICA: Conecta ao Turso e resolve o erro do Render
        dialectOptions: process.env.TURSO_AUTH_TOKEN ? {
            authToken: process.env.TURSO_AUTH_TOKEN // Envia o token de autenticação apenas se ele existir
        } : {},
        logging: false,
        define: {
            timestamps: true,
            underscored: true
        }
    });
} else {
    // cria uma instância da classe 'Sequelize' para MySQL (caso mude de banco no futuro)
    sequelize = new Sequelize(
        process.env.DB_NAME,          // nome do banco de dados
        process.env.DB_USER,          // nome do usuário
        process.env.DB_PASSWORD,      // senha do usuário
        {
            host: process.env.DB_HOST || 'localhost', 
            port: process.env.DB_PORT || 3306, 
            dialect: 'mysql',          
            logging: false,            
            define: {
                timestamps: true,       
                underscored: true       
            }
        }
    );
}

  

// torna a instância 'sequelize' publica para uso
module.exports = sequelize;