import prisma from "../db/prismadb";

export const findContactsByEmailOrPhoneNumber = async (email: string, phoneNumber: string) => {
  return await prisma.contact.findMany({
    where: {
      OR: [
        {
          email: {
            equals: email,
            not: null,
          },
        },
        {
          phoneNumber: {
            equals: phoneNumber,
            not: null,
          },
        },
      ],
    },
  });
}

export const findFirstContactByEmail = async (email: string) => {
  return await prisma.contact.findFirst({
    where: {
      email: email,
    },
  });
}

export const findFirstContactByPhoneNumber = async (phoneNumber: string) => {
  return await prisma.contact.findFirst({
    where: {
      phoneNumber: phoneNumber,
    },
  });
}

export const findContactById = async (id: number) => {
  return await prisma.contact.findUnique({
    where: {
      id: id,
    },
  });
}

interface CreateContact {
  email?: string;
  phoneNumber?: string;
  linkPrecedence: "primary" | "secondary";
  linkedId?: number;
}

export const createContact = async ({ email, phoneNumber, linkPrecedence, linkedId } : CreateContact) => {
  return await prisma.contact.create({
    data: {
      email,
      phoneNumber,
      linkPrecedence,
      linkedId
    },
  });
}

export const updateContact = async (id: number, data: CreateContact) => {
  return await prisma.contact.update({
    where: {
      id: id,
    },
    data,
  });
}

export const updateContactsPrimaryLinkedId = async (linkedId: number, primaryContactId: number) => {
  return await prisma.contact.updateMany({
    where: {
      linkedId: linkedId,
    },
    data: {
      linkedId: primaryContactId,
    },
  });
}

export const findSecondaryContactsLinkedToPrimaryContact = async (primaryContactId: number) => {
  return await prisma.contact.findMany({
    where: {
      linkedId: primaryContactId,
    },
  });
}