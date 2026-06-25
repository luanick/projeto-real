const User = require('./userModel');
const bcrypt = require('bcryptjs');

async function registerUser(username, email, password, fullName) {
    if (!username || !email || !password) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
    }

    const emailExists = await User.findOne({ where: { email } });
    const usernameExists = await User.findOne({ where: { username } });
    if (emailExists || usernameExists) {
        throw new Error('Este e-mail ou usuário já está cadastrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        fullName
    });
    return newUser;
}

async function loginUser(login, password) {
    if (!login || !password) {
        throw new Error('Usuário e senha são obrigatórios.');
    }

    const user = await User.findOne({
        where: {
            username: login
        }
    });

    if (!user) {
        // Tenta buscar por e-mail
        const userByEmail = await User.findOne({ where: { email: login } });
        if (!userByEmail || !(await bcrypt.compare(password, userByEmail.password))) {
            throw new Error('E-mail/Usuário ou senha incorretos.');
        }
        return userByEmail;
    }

    if (!(await bcrypt.compare(password, user.password))) {
        throw new Error('E-mail/Usuário ou senha incorretos.');
    }

    return user;
}

async function getUserProfile(userId) {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'fullName']
    });
    if (!user) {
        throw new Error('Usuário não encontrado.');
    }
    return user;
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};