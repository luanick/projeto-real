const User = require("../modules/user/userModel");
const Book = require("../modules/book/bookModel");

// Um usuário pode anunciar vários livros
User.hasMany(Book, { foreignKey: "ownerId", as: "books" });
// Um livro pertence a um usuário anunciante (owner)
Book.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

module.exports = { User, Book };