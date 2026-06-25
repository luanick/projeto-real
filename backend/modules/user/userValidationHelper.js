function validateRegisterInput(data) {
    const errors = [];
    if (!data.username || data.username.length < 3) {
        errors.push('username.minLength');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('email.invalid');
    }
    return errors;
}

module.exports = {
    validateRegisterInput
};
