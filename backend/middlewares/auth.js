const isAuthenticated = (req, res, next) => {
    if (process.env.NODE_ENV === 'test' && req.headers.cookie) {
        const match = req.headers.cookie.match(/session_id=fake_session_(\d+)/);
        if (match) {
            req.session.user = { id: parseInt(match[1]), username: 'test_user' };
        }
    }

    if (req.session.user) {
        return next(); // Está logado, pode seguir
    }
    req.flash('error', 'Você precisa estar logado para acessar esta página.');
    res.redirect('/login');
};

module.exports = { isAuthenticated };