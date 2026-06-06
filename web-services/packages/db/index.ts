import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for Prisma initialization");
}

const pool = new Pool({
  connectionString,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
