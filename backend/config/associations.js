const User = require("../modules/user/userModel");
const Book = require("../modules/book/bookModel");
const BorrowRequest = require("../modules/borrow/borrowModel"); // Importe o novo model

// Relacionamentos existentes de Book
User.hasMany(Book, { foreignKey: "ownerId", as: "books" });
Book.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// --- NOVOS RELACIONAMENTOS DO BORROW ---

// 1. Relacionamento com o Livro
Book.hasMany(BorrowRequest, { foreignKey: "bookId", as: "borrowRequests" });
BorrowRequest.belongsTo(Book, { foreignKey: "bookId", as: "book" });

// 2. Relacionamento com o Solicitante (Requester)
User.hasMany(BorrowRequest, { foreignKey: "requesterId", as: "requestedBorrows" });
BorrowRequest.belongsTo(User, { foreignKey: "requesterId", as: "requester" });

// 3. Relacionamento com o Dono (Owner)
User.hasMany(BorrowRequest, { foreignKey: "ownerId", as: "receivedBorrows" });
BorrowRequest.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

module.exports = { User, Book, BorrowRequest };