import { registerAs } from "@nestjs/config";
export default registerAs('database', () => ({
    dialect: process.env.DATABASE_DIALECT,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    resetOnBoot: process.env.DATABASE_RESET_ON_BOOT === 'true',
}));