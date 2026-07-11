import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";

export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await prisma.scores.findMany({
            orderBy: [
                { level: "desc" },
                { value: "desc" },
                { time: "asc" }
            ],
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true
                    },
                },
            },
        });
        return res.status(200).json(leaderboard);
    } catch (err) {
        console.error(`Error getting leaderboard scores. Error: `, err);
        return res.status(500).json({ error: "Server Error" })
    }
};

// getScores uses query parameters from frontend filters: name, email, level, status
export const getScores = async (req, res) => {
    try {
        const { name, email,level, status } = req.query;
        const userScores = await prisma.scores.findMany({
            where: {
                ...(level && { level: Number(level) }),
                user: {
                    ...(email && { email }),
                    ...(name && { name: {
                        contains: name,
                        mode: "insensitive",
                    },
                 }),
                 ...(status && { status }),
                },
            },
            orderBy: [
                { level: "desc" },
                { value: "desc" },
                { time: "asc"},
            ],
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true,
                    },
                },
            },
        });
        return res.status(200).json(userScores);

    } catch (err) {
        console.error(`Error getting user scores: `, err);
        return res.status(500).json({error: "Error getting score. Server Error"});
    }
};

export const createScore = async (req, res) => {
    try {
        const { name, email, value, level, time } = req.body;

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name,
                status: "ACTIVE",
            },
            create: {
                name,
                email,
                status: "NEW"
            },
        });

        const newScore = await prisma.scores.create({
            data: {
                userId: user.id,
                value: Number(value),
                level: Number(level),
                time: time ? Number(time) : 0
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true
                    },
                },
            },
        });

        return res.status(201).json({message: "Score added successfully", newScore});

    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Error creating score. Server Error."});
        
    }
};

export const deleteScore = async (req, res) => {
    try {
        const recordId = parseInt(req.params.id, 10);
        if (Number.isNaN(recordId)) {
            return res.status(400).json({ error: "Invalid score ID" });
        }
        const deletedScore = await prisma.scores.delete({
            where: { id: recordId }
        });
        return res.status(200).json({ message: "Score deleted successfully", deletedScore })

    } catch (err) {
        if (err instanceof Prisma.PrismaClientKonwnRequestError && err.code === "P2025") {
                return res.status(404).json({ error: "Score not found",});
            }
        
        console.error("Error deleting score: ", err);
        return res.status(500).json({error: "Error deleting score"});
    }
};

export const updateScore = async (req, res) => {
    try {
        const { name, email, level, value, time } = req.body;
        const recordId = parseInt(req.params.id, 10);

        if (Number.isNaN(recordId)) {
            return res.status(400).json({ error: "Invalid score ID", });
        }

        const updatedScore = await prisma.scores.update({
            where: {
                id: recordId,
            },
            data: {
                ...(level !== undefined && { level: Number(level) }),
                ...(value !== undefined && { value: Number(value) }),
                ...(time !== undefined && { time: Number(time) }),

                ...((name !== undefined || email !== undefined) && {
                    user: {
                        update: {
                            ...(name !== undefined && { name }),
                            ...(email !== undefined && { email }),
                        },
                    },
                }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true
                    }, 
                },
            },
        });

        return res.status(200).json({ message: "Score updated successfully", updatedScore, });

    } catch (err) {
        if ( err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            return res.status(400).json({ error: "Score not found" });
        }

        console.error("Error updating score ", err);
        
        return res.status(500).json({ error: "Error updating score" });
    }
};