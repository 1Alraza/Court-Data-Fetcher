import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    // log : ["query"],  //this will log the queries in terminal
});

export default prisma;