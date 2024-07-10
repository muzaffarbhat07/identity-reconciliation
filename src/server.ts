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
    //create a new contact as primary contact
    const contact = await prisma.contact.create({
      data: {
        email: email as string,
        phoneNumber: phoneNumber as string,
        linkPrecedence: "primary",
      },
    });

    console.log(contact);

    return res.json({
      contact: {
        primaryContactId: contact.id,
        emails: contact.email ? [contact.email] : [],
        phoneNumbers: contact.phoneNumber ? [contact.phoneNumber] : [],
        secondaryContactIds: [],
      }
    });
  }

  let primaryContactId: number | null = null;
  
  // Find primary contact id
  contacts.forEach(async (contact) => {
    if(contact.linkPrecedence === "primary") {
      if(!primaryContactId) primaryContactId = contact.id;
    }
  });

  // If no primary contact found(means all found contacts are secondary contacts), get the primary contact id from the first(or any) contact
  if(!primaryContactId) {
    primaryContactId = contacts[0].linkedId;
  }

  let primaryContact = null;
  // Get the primary contact details along with all its secondary contacts
  if(primaryContactId) {
    primaryContact = await prisma.contact.findUnique({
      where: {
        id: primaryContactId
      },
      include: {
        linkedFrom: true
      }
    });
  }

  if(primaryContact) {

    // Form the response object
    let emails: string[] = primaryContact.email ? [primaryContact.email] : [];
    let phoneNumbers: string[] = primaryContact.phoneNumber ? [primaryContact.phoneNumber] : [];
    let secondaryContactIds: number[] = [];
    primaryContact.linkedFrom.forEach((contact) => {
      if(contact.email) emails.push(contact.email);
      if(contact.phoneNumber) phoneNumbers.push(contact.phoneNumber);
      secondaryContactIds.push(contact.id);
    });

    return res.json({
      contact: {
        primaryContactId,
        emails,
        phoneNumbers,
        secondaryContactIds
      }
    });
  }

  return res.status(500).send("Something went wrong");


});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});