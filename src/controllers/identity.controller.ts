import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { 
  createContact,
  findContactById,
  findFirstContactByEmail, 
  findFirstContactByPhoneNumber, 
  findSecondaryContactsLinkedToPrimaryContact, 
  updateContact,
  updateContactsPrimaryLinkedId
} from "../services/contact.service";


export const identityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phoneNumber } = req.body;
    if(!email && !phoneNumber) {
      throw new AppError(400, "Please provide either email or phoneNumber or both");
    }

    // Find first contact by email and phoneNumber
    const firstContactByEmail = await findFirstContactByEmail(email as string);
    const firstContactByPhoneNumber = await findFirstContactByPhoneNumber(phoneNumber as string);

    // If no contact found with the provided email and phoneNumber, create a new contact
    if(!firstContactByEmail && !firstContactByPhoneNumber) {
      const contact = await createContact({
        email: email as string,
        phoneNumber: phoneNumber as string,
        linkPrecedence: "primary"
      })

      return res.json({
        contact: {
          primaryContactId: contact.id,
          emails: contact.email ? [contact.email] : [],
          phoneNumbers: contact.phoneNumber ? [contact.phoneNumber] : [],
          secondaryContactIds: [],
        }
      });
    }

    // Get the primary contact of the first contact found by email and phoneNumber
    const primaryContactOfEmail = await getPrimaryContactOfGivenContact(firstContactByEmail);
    const primaryContactOfPhoneNumber = await getPrimaryContactOfGivenContact(firstContactByPhoneNumber);

    // If both contacts are null(which should not be the case), throw error
    if(!primaryContactOfEmail && !primaryContactOfPhoneNumber) {
      throw new AppError(500, "Internal Server Error");
    }

    // Lets make one of them as our primary contact
    // const primaryContact = primaryContactOfEmail ? primaryContactOfEmail : primaryContactOfPhoneNumber;
    const primaryContact = choosePrimaryContact(primaryContactOfEmail, primaryContactOfPhoneNumber);

    // If one of the contacts is null, which means incoming request has either of email or phoneNumber common to an existing contact and contains new information
    // Create a new secondary contact
    if(!primaryContactOfEmail || !primaryContactOfPhoneNumber) {
      const contact = await createContact({
        email: email as string,
        phoneNumber: phoneNumber as string,
        linkPrecedence: "secondary",
        linkedId: primaryContact.id
      });
    } else { // means both contacts are not null
      // If contacts are different, means multiple primary contacts, update one of them to secondary contact
      if(primaryContactOfEmail.id !== primaryContactOfPhoneNumber.id) {

        // Determine which one to update to secondary contact based on the primaryContact we have chosen
        if(primaryContact.id === primaryContactOfEmail.id) {
          updateContactFromPrimaryToSecondary(primaryContactOfPhoneNumber, primaryContactOfEmail);
        } else {
          updateContactFromPrimaryToSecondary(primaryContactOfEmail, primaryContactOfPhoneNumber);
        }

      }
    }

    // Return the consolidated contact details
    const consolidatedContactDetails = await getConsolidatedContactDetails(primaryContact);

    return res.json({
      contact: consolidatedContactDetails
    });

  } catch(err) {
    console.error(err);
    next(err);
  }
}

const getPrimaryContactOfGivenContact = async (contact: any) => {
  if(!contact) return null;

  if(isPrimaryContact(contact)) {
    return contact;
  } else {
    return await findContactById(contact.linkedId);
  }
};

const isPrimaryContact = (contact: any) => {
  return contact && contact.linkPrecedence === "primary";
}

const choosePrimaryContact = (primaryContact1: any, primaryContact2: any) => {
  // If any one of the contact is null, return the other one
  if(!primaryContact1) return primaryContact2;
  if(!primaryContact2) return primaryContact1;

  // If both contacts not null, return the one with lower id
  return primaryContact1.id < primaryContact2.id ? primaryContact1 : primaryContact2;

  // @NOTE: We can have more complex logic to choose primary contact, like based on the number of secondary contacts linked to them
};

const updateContactFromPrimaryToSecondary = async (contact: any, primaryContact: any) => {

  // Firstly, update all those secondary contacts linked to the given contact to the primary contact
  await updateContactsPrimaryLinkedId(contact.id, primaryContact.id);

  // Now, update the given contact to secondary contact
  await updateContact(contact.id, {
    linkPrecedence: "secondary",
    linkedId: primaryContact.id
  });
};

const getConsolidatedContactDetails = async (primaryContact: any) => {
  let emails: string[] = primaryContact.email ? [primaryContact.email] : [];
  let phoneNumbers: string[] = primaryContact.phoneNumber ? [primaryContact.phoneNumber] : [];
  let secondaryContactIds: number[] = [];

  // Get all the secondary contacts linked to the primary contact
  const secondaryContacts = await findSecondaryContactsLinkedToPrimaryContact(primaryContact.id);
  secondaryContacts.forEach((contact) => {
    if(contact.email) emails.push(contact.email);
    if(contact.phoneNumber) phoneNumbers.push(contact.phoneNumber);
    secondaryContactIds.push(contact.id);
  })

  // Remove duplicate emails and phoneNumbers
  emails = [...new Set(emails)];
  phoneNumbers = [...new Set(phoneNumbers)];

  return {
    primaryContactId: primaryContact.id,
    emails,
    phoneNumbers,
    secondaryContactIds
  };
};