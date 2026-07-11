import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            console.error("Name, email and password are required");
            return res.status(400).json({ error: "Name, email, and password are required" })
        }

        const existingAdmin = await prisma.adminUser.findUnique({
            where: { email },
        });

        if (existingAdmin) {
            return res.status(409).json({ error: "An Admin user with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newAdmin = await prisma.adminUser.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "ADMIN"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
        });

        console.log("granted admin rights")
        return res.status(201).json({ message: "granted admin rights.", adminUser: newAdmin });

    } catch (err) {
        console.error("Error creating Admin User ", err);
        return res.status(500).json({ error: "Error creating admin user"});
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const targetUser = await prisma.adminUser.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isProtected: true,
            },
        });

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        if (targetUser.isProtected) {
            return res.status(403).json({ error: "This administrator account cannot be deleted" });
        }

        if (req.user.id === targetUser.id) {
            return res.status(400).json({ error: "You cannot delete your own account" });
        }

        const deletedUser = await prisma.adminUser.delete({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return res.status(200).json({ message: "User deleted successfully", deletedUser })

    } catch (err) {
     
        console.error("Error deleting user");
        return res.status(500).json({ message: "Error deleting user" });
    }
}