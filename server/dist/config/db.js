"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI || '', { family: 4 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
};
exports.default = connectDB;
