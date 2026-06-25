function validateBookInput(data) {
    const errors = [];
    if (!data.title || data.title.trim() === '') {
        errors.push('title.required');
    }
    if (!data.author || data.author.trim() === '') {
        errors.push('author.required');
    }
    return errors;
}

module.exports = {
    validateBookInput
};
