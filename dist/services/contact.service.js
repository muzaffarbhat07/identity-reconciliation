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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSecondaryContactsLinkedToPrimaryContact = exports.updateContactsPrimaryLinkedId = exports.updateContact = exports.createContact = exports.findContactById = exports.findFirstContactByPhoneNumber = exports.findFirstContactByEmail = exports.findContactsByEmailOrPhoneNumber = void 0;
const prismadb_1 = __importDefault(require("../db/prismadb"));
const findContactsByEmailOrPhoneNumber = (email, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismadb_1.default.contact.findMany({
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
});
exports.findContactsByEmailOrPhoneNumber = findContactsByEmailOrPhoneNumber;
const findFirstContactByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismadb_1.default.contact.findFirst({
        where: {
            email: email,
        },
    });
});
exports.findFirstContactByEmail = findFirstContactByEmail;
const findFirstContactByPhoneNumber = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismadb_1.default.contact.findFirst({
        where: {
            phoneNumber: phoneNumber,
        },
    });
});
exports.findFirstContactByPhoneNumber = findFirstContactByPhoneNumber;
const findContactById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismadb_1.default.contact.findUnique({
        where: {
            id: id,
        },
    });
});
exports.findContactById = findContactById;
const createContact = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, phoneNumber, linkPrecedence, linkedId }) {
    return yield prismadb_1.default.contact.create({
        data: {
            email,
            phoneNumber,
            linkPrecedence,
            linkedId
        },
    });
});
exports.createContact = createContact;
const updateContact = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismadb_1.default.contact.update({
        where: {
            id: id,
        },
        data,
    });
});
exports.updateContact = updateContact;
const updateContactsPrimaryLinkedId = (linkedId, primaryContactId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismadb_1.default.contact.updateMany({
        where: {
            linkedId: linkedId,
        },
        data: {
            linkedId: primaryContactId,
        },
    });
});
exports.updateContactsPrimaryLinkedId = updateContactsPrimaryLinkedId;
const findSecondaryContactsLinkedToPrimaryContact = (primaryContactId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismadb_1.default.contact.findMany({
        where: {
            linkedId: primaryContactId,
        },
    });
});
exports.findSecondaryContactsLinkedToPrimaryContact = findSecondaryContactsLinkedToPrimaryContact;
