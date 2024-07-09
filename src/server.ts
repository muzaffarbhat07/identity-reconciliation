import express, { Express, Request, Response } from "express";
import "dotenv/config";
import prisma from "./prismadb";

const app: Express = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!!");
});


app.post("/identity", async (req: Request, res: Response) => {
  let { email, phoneNumber } = req.body;
  if(!email && !phoneNumber) return res.status(400).send("Please provide email and/or phoneNumber");

  console.log(email, phoneNumber);

  // Find contacts with the provided email and/or phoneNumber
  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        {
          email: {
            equals: email as string,
            not: null,
          },
        },
        {
          phoneNumber: {
            equals: phoneNumber as string,
            not: null,
          },
        },
      ],
    },
  });
  
  if (!contacts.length) {
    const contact = await prisma.contact.create({
      data: {
        email: email as string,
        phoneNumber: phoneNumber as string,
        linkPrecedence: "primary",
      },
    });

    return res.json({
      contact: {
        primaryContactId: contact.id,
        emails: contact.email ? [contact.email] : [],
        phoneNumbers: contact.phoneNumber ? [contact.phoneNumber] : [],
        secondaryContactIds: [],
      }
    });
  }

  res.json(contacts);

});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});