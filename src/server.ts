import express, { Express, Request, Response } from "express";
import "dotenv/config";
import prisma from "./prismadb";

const app: Express = express();
const PORT = process.env.PORT || 4000;


app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!!");
});

app.get("/identity", async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany();
  res.send(`Hi there! We have ${contacts.length} contacts in our database.`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});