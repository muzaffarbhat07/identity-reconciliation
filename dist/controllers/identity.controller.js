"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityController = void 0;
const appError_1 = require("../utils/appError");
const contact_service_1 = require("../services/contact.service");
const client_1 = require("@prisma/client");
const identityController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phoneNumber } = req.body;
        // Find first contact by email and phoneNumber
        const firstContactByEmail = email ? yield (0, contact_service_1.findFirstContactByEmail)(email) : null;
        const firstContactByPhoneNumber = phoneNumber ? yield (0, contact_service_1.findFirstContactByPhoneNumber)(phoneNumber) : null;
        console.log(firstContactByEmail, firstContactByPhoneNumber);
        // If no contact found with the provided email and phoneNumber, create a new contact
        if (!firstContactByEmail && !firstContactByPhoneNumber) {
            const contact = yield (0, contact_service_1.createContact)({
                email,
                phoneNumber,
                linkPrecedence: client_1.LinkPrecedence.primary,
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
        // Get the primary contact of the first contact found by email and phoneNumber
        const primaryContactOfEmail = firstContactByEmail ? yield getPrimaryContactOfGivenContact(firstContactByEmail) : null;
        const primaryContactOfPhoneNumber = firstContactByPhoneNumber ? yield getPrimaryContactOfGivenContact(firstContactByPhoneNumber) : null;
        // If both contacts are null(which should not be the case), throw error
        if (!primaryContactOfEmail && !primaryContactOfPhoneNumber) {
            throw new appError_1.AppError(500, "Internal Server Error");
        }
        // Lets make one of them as our primary contact
        // const primaryContact = primaryContactOfEmail ? primaryContactOfEmail : primaryContactOfPhoneNumber;
        const primaryContact = choosePrimaryContact(primaryContactOfEmail, primaryContactOfPhoneNumber);
        if (!primaryContact) {
            throw new appError_1.AppError(500, "Internal Server Error");
        }
        // If one of the contacts is null, which means incoming request has either of email or phoneNumber common to an existing contact and contains new information
        // Create a new secondary contact
        if (!primaryContactOfEmail || !primaryContactOfPhoneNumber) {
            const contact = yield (0, contact_service_1.createContact)({
                email,
                phoneNumber,
                linkPrecedence: client_1.LinkPrecedence.secondary,
                linkedId: primaryContact.id
            });
        }
        else { // means both contacts are not null
            // If contacts are different, means multiple primary contacts, update one of them to secondary contact
            if (primaryContactOfEmail.id !== primaryContactOfPhoneNumber.id) {
                // Determine which one to update to secondary contact based on the primaryContact we have chosen
                if (primaryContact.id === primaryContactOfEmail.id) {
                    updateContactFromPrimaryToSecondary(primaryContactOfPhoneNumber, primaryContactOfEmail);
                }
                else {
                    updateContactFromPrimaryToSecondary(primaryContactOfEmail, primaryContactOfPhoneNumber);
                }
            }
        }
        // Return the consolidated contact details
        const consolidatedContactDetails = yield getConsolidatedContactDetails(primaryContact);
        return res.json({
            contact: consolidatedContactDetails
        });
    }
    catch (err) {
        console.error(err);
        next(err);
    }
});
exports.identityController = identityController;
const getPrimaryContactOfGivenContact = (contact) => __awaiter(void 0, void 0, void 0, function* () {
    if (isPrimaryContact(contact)) {
        return contact;
    }
    else if (contact.linkedId) {
        return yield (0, contact_service_1.findContactById)(contact.linkedId);
    }
    return null;
});
const isPrimaryContact = (contact) => {
    return contact.linkPrecedence === client_1.LinkPrecedence.primary;
};
const choosePrimaryContact = (primaryContact1, primaryContact2) => {
    // If any one of the contact is null, return the other one
    if (!primaryContact1)
        return primaryContact2;
    if (!primaryContact2)
        return primaryContact1;
    // If both contacts not null, return the one with lower id
    return primaryContact1.id < primaryContact2.id ? primaryContact1 : primaryContact2;
    // @NOTE: We can have more complex logic to choose primary contact, like based on the number of secondary contacts linked to them
};
const updateContactFromPrimaryToSecondary = (contact, primaryContact) => __awaiter(void 0, void 0, void 0, function* () {
    // Firstly, update all those secondary contacts linked to the given contact to the primary contact
    yield (0, contact_service_1.updateContactsPrimaryLinkedId)(contact.id, primaryContact.id);
    // Now, update the given contact to secondary contact
    yield (0, contact_service_1.updateContact)(contact.id, {
        linkPrecedence: client_1.LinkPrecedence.secondary,
        linkedId: primaryContact.id
    });
});
const getConsolidatedContactDetails = (primaryContact) => __awaiter(void 0, void 0, void 0, function* () {
    let emails = primaryContact.email ? [primaryContact.email] : [];
    let phoneNumbers = primaryContact.phoneNumber ? [primaryContact.phoneNumber] : [];
    let secondaryContactIds = [];
    // Get all the secondary contacts linked to the primary contact
    const secondaryContacts = yield (0, contact_service_1.findSecondaryContactsLinkedToPrimaryContact)(primaryContact.id);
    secondaryContacts.forEach((contact) => {
        if (contact.email)
            emails.push(contact.email);
        if (contact.phoneNumber)
            phoneNumbers.push(contact.phoneNumber);
        secondaryContactIds.push(contact.id);
    });
    // Remove duplicate emails and phoneNumbers
    emails = [...new Set(emails)];
    phoneNumbers = [...new Set(phoneNumbers)];
    return {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds
    };
});
