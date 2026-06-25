module.exports = (err, req, res, next) => {
    console.error('--- Erro Capturado pelo Handler Central ---');
    console.error(err);

    const statusCode = err.status || 500;
    const message = err.message || 'Ocorreu um erro interno no servidor.';

    // Se for uma requisição AJAX, API ou se estivermos rodando testes (para simplificar asserções)
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1) || process.env.NODE_ENV === 'test') {
        return res.status(statusCode).json({
            success: false,
            message: message,
            errors: err.errors || []
        });
    }

    // Se for uma requisição de navegação normal (espera HTML)
    req.flash('error', message);
    const backURL = req.header('Referer') || '/books';
    res.redirect(backURL);
};