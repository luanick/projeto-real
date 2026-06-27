const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const BorrowRequest = sequelize.define('BorrowRequest', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    status: { 
        type: DataTypes.STRING, 
        defaultValue: 'pendente', // 'pendente', 'aprovado', 'rejeitado'
        allowNull: false 
    },
    bookId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    requesterId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    ownerId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
}, {
    timestamps: true,
    tableName: 'borrow_requests'
});

module.exports = BorrowRequest;