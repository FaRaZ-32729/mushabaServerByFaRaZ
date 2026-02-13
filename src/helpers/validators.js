// Validate Email
const validateEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
};

// Validate Phone (simple, 10-15 digits)
const validatePhone = (phone) => {
    const re = /^\d{10,15}$/;
    return re.test(phone);
};

// Validate Password (min 6 chars, at least 1 letter & 1 number)
const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;;
    return re.test(password);
};

module.exports = {
    validateEmail,
    validatePhone,
    validatePassword,
};
