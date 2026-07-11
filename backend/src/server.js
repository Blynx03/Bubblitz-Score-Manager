import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"

const app = express();
const PORT = 5001;

config();
connectDB();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Bubblitz Score Manager API is running"});
})

app.use("/api/scores", scoreRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`)
});

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection: ", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    })
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception: ", err);
    await disconnectDB();
    process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    })
})

