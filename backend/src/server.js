require("dotenv").config();

const app = require("./app");
const db = require("./db/connection");

const PORT = process.env.PORT || 5000;

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// DB CHECK
(async () => {
    try {
        await db.query("SELECT NOW()");
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
})();