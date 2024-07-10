import express, { Express, NextFunction, Request, Response } from "express";
import "dotenv/config";
import prisma from "./db/prismadb";
import { AppError } from "./utils/appError";

const app: Express = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Identity Reconcillation API service!",
  });
});


app.post("/identity", async (req: Request, res: Response, next: NextFunction) => {
  try {

    let { email, phoneNumber } = req.body;

    if(!email && !phoneNumber) {
      throw new AppError(400, "Please provide either email or phoneNumber or both");
    }
  
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
    let contactByEmailPresent = false;
    let contactByPhoneNumberPresent = false;
  
    // Find primary contact id, check if contact(s) with the provided email and phoneNumber already present
    contacts.forEach(async (contact) => {
  
      if(contact.email === email) {
        contactByEmailPresent = true;
      }
      if(contact.phoneNumber === phoneNumber) {
        contactByPhoneNumberPresent = true;
      }
  
      if(contact.linkPrecedence === "primary") {
        if(!primaryContactId) primaryContactId = contact.id;
        else {
          // If multiple primary contacts found, update them to secondary contacts, except the first one
          
          //firstly, update all those secondary contacts linked to the current primary contact to the first primary contact
          await prisma.contact.updateMany({
            where: {
              linkedId: contact.id
            },
            data: {
              linkedId: primaryContactId
            }
          });
  
          // Now, update the current primary contact to secondary contact
          await prisma.contact.update({
            where: {
              id: contact.id
            },
            data: {
              linkPrecedence: "secondary",
              linkedId: primaryContactId
            }
          });
        }
      }
  
    });
  
    // If no primary contact found(means all found contacts are secondary contacts), get the primary contact id from the first(or any) contact
    if(!primaryContactId) {
      primaryContactId = contacts[0].linkedId;
    }
    
    // If we reach here it means incoming request has either of email or phoneNumber or both common to an existing contact and might contain new information
    // Create a new secondary contact with the provided email or phoneNumber if not already present
    if(email && !contactByEmailPresent) { // checks if email is the new information
      const contact = await prisma.contact.create({
        data: {
          email: email as string,
          phoneNumber: phoneNumber as string,
          linkPrecedence: "secondary",
          linkedId: primaryContactId
        },
      });
    }
    else if(phoneNumber && !contactByPhoneNumberPresent) { // checks if phoneNumber is the new information
      const contact = await prisma.contact.create({
        data: {
          email: email as string,
          phoneNumber: phoneNumber as string,
          linkPrecedence: "secondary",
          linkedId: primaryContactId
        },
      });
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
  
      // Get all the emails, phoneNumbers and secondary contact ids
      let emails: string[] = primaryContact.email ? [primaryContact.email] : [];
      let phoneNumbers: string[] = primaryContact.phoneNumber ? [primaryContact.phoneNumber] : [];
      let secondaryContactIds: number[] = [];
      primaryContact.linkedFrom.forEach((contact) => {
        if(contact.email) emails.push(contact.email);
        if(contact.phoneNumber) phoneNumbers.push(contact.phoneNumber);
        secondaryContactIds.push(contact.id);
      });
  
      // Remove duplicate emails and phoneNumbers
      emails = [...new Set(emails)];
      phoneNumbers = [...new Set(phoneNumbers)];
  
      return res.json({
        contact: {
          primaryContactId,
          emails,
          phoneNumbers,
          secondaryContactIds
        }
      });
    }
  
    throw new AppError(500, "Internal Server Error");
  } catch(err) {
    console.error(err);
    next(err);
  }

});

// Unhandled routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Can't ${req.method} ${req.originalUrl} on this server!`));
});

// Global error handler
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, status = "error", message = "Something went wrong." } = err;

  res.status(statusCode ).json({
    status: status,
    message: message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});