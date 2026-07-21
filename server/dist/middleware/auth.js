import User from "../models/User.js";
import { error } from "node:console";
import { getAuth } from "@clerk/express";
export const protect = async (req, res, next) => {
    try {
        const auth = getAuth(req);
        const userId = auth?.userId;
        console.log("Auth header:", req.headers.authorization);
        console.log("getAuth(req) userId:", userId);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }
        const user = await User.findOne({
            clerkId: userId,
        });
        if (!user) {
            console.error("Auth error:", error);
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
export const authorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "User role is not authorized to access this route",
            });
        }
        next();
    };
};
