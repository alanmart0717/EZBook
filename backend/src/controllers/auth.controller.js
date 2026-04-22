const AuthService = require("../services/auth.service");

// Register
const register = async (req, res) => {
    try {
        const result = await AuthService.registerUser(req.body);

        res.status(201).json({
            message: "User registered successfully",
            data: result
        });

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await AuthService.loginUser(email, password);

        res.status(200).json({
            message: "Login successful",
            data: result
        });

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

module.exports = {
    register,
    login
};