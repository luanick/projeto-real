const userService = require("./userService");
const asyncHandler = require("../../middlewares/asyncHandler");

exports.register = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    try {
        await userService.registerUser(username, email, password, fullName);
    } catch (err) {
        err.status = 400;
        throw err;
    }

    req.flash("success", "Conta criada com sucesso! Faça seu login.");
    res.redirect("/login");
});

exports.login = asyncHandler(async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = await userService.loginUser(login, password);
        const userData = await userService.getUserProfile(user.id);
        req.session.user = userData;
    } catch (err) {
        err.status = 400;
        throw err;
    }

    req.flash("success", `Bem-vindo de volta, ${req.session.user.username}!`);
    res.redirect("/books");
});

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};

exports.renderRegisterForm = (req, res) => {
    res.render("register", { title: "Criar Conta" });
};

exports.renderLoginForm = (req, res) => {
    res.render("login", { title: "Entrar" });
};