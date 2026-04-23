const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Register new user
const registerUser = async ({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role
}) => {
    // Check if user already exists
    const existingUser = await User.findUserByEmail(email);

    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.createUser(
        firstName,
        lastName,
        email,
        passwordHash,
        phoneNumber,
        role
    );

    // Optional but recommended: generate token here too
    const token = jwt.sign(
        {
            userId: newUser.user_id,
            role: newUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: newUser
    };
};

// Login User
const loginUser = async (email, password) => {
    // Find user
    const user = await User.findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = jwt.sign(
        {
            userId: user.user_id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
        }
    };
};

module.exports = {
    registerUser,
    loginUser
};