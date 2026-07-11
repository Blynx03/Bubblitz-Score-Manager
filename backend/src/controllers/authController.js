import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await prisma.adminUser.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: "User already exist"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const adminUser = await prisma.adminUser.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "GUEST"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return res.status(201).json({
            message: "User registered successfully",
            adminUser,
        });

    } catch (err) {
        console.error("Error register user ", err);
        return res.status(500).json({ error: "Error registering user" });
    }
}

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminUser = await prisma.adminUser.findUnique({
            where: { email },
        });

        if (!adminUser) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const passwordMatches = await bcrypt.compare(password, adminUser.password);

        if (!passwordMatches) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            {
                id: adminUser.id,
                email: adminUser.email,
                role: adminUser.role,
            },
            process.env.JWT_SECRET, { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            adminUser: {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
            },
            token,
        });

    } catch (err) {
        console.error("Error logging in: ", err);
        return res.status(500).json({ error: "Error logging in" });
    }
}