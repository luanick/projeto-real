const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Book = sequelize.define('Book',
    {
        id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title:       { type: DataTypes.STRING, allowNull: false },
        author:      { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        status:      { type: DataTypes.STRING, defaultValue: 'disponivel' }, // 'disponivel', 'emprestado'
        ownerId:     { type: DataTypes.INTEGER, allowNull: false }
    },
    {
        timestamps: true,
        tableName: 'books'
    }
);

module.exports = Book;
