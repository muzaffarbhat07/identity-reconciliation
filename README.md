# Identity Reconciliation Service

## Overview

- The Identity Reconciliation Service is designed to identify and keep track of a user's identity across multiple requests with different contact information.
- This service ensures linking different requests made with different contact information to the same person.
- It is particularly useful in environments where user tries to use different contact information for each request.

<!--
## Features

- **Automated Reconciliation**: Automatically identifies and reconciles discrepancies in user identity data across requests.
- **Flexible Integration**: Designed to easily integrate with existing databases and identity management systems using a RESTful API.
-->

## Problem Statement:

A customer is making multiple purchases from an online store using different email addresses and phone numbers to avoid drawing attention to himself and his secret project. The online store is committed to providing a personalized customer experience and tracking and rewarding loyal customers. However, they face a challenge in identifying and linking orders made by the same customer, given his use of multiple contact details.

## Objective:

The goal is to develop a solution that accurately identifies and keeps track of a customer's identity across multiple purchases, even when different contact information is used.

It is given that orders on the online store will always have either an email or phone number, or both, in the checkout event. The system should keep track of the collected contact information in a relational database table named Contact.

```
{
  id               Int
  phoneNumber      String?
  email            String?
  linkedId         Int? // the ID of another Contact linked to this one
  linkPrecedence   "secondary"|"primary" // "primary" if it's the first Contact in the chain, otherwise "secondary"
  createdAt        DateTime
  updatedAt        DateTime
  deletedAt        DateTime?
}
```

One customer can have multiple Contact rows in the database. All of these rows are linked together, with the oldest one being treated as "primary" and the rest as "secondary."

Contact rows are linked if they have either the same email or phone number.

## Key Features:

1. **Consistent Customer Identification:** Ensure that all purchases made by the same individual, even with different contact information, are recognized and linked together.

2. **Data Linking:** Use common attributes (email or phone number) to link different contact entries, designating the oldest entry as "primary" and others as "secondary."

3. **Database Integrity:** Maintain the relational database integrity, ensuring accurate linking and updating of the Contact table entries.

4. **Scalability:** The solution should be scalable to handle a large number of transactions and customer profiles without performance degradation.

By achieving these objectives, the online store can enhance its customer experience strategy, rewarding loyal customers while maintaining a unified view of their interactions.

#### For example:

If a customer placed an order with
```
email=muzaffar@hillvale.edu
phoneNumber=123456
```
and later came back to place another order with
```
email=naeem@hillvale.edu
phoneNumber=123456
```
database will have the following rows:
```sql
{
  id                    1
  phoneNumber           "123456"
  email                 "muzaffar@hillvale.edu"
  linkedId              null
  linkPrecedence        "primary"
  createdAt             2024-04-01 00:00:00.374+00
  updatedAt             2024-04-01 00:00:00.374+00
  deletedAt             null
},
{
  id                    23
  phoneNumber           "123456"
  email                 "naeem@hillvale.edu"
  linkedId              1
  linkPrecedence        "secondary"
  createdAt             2024-04-20 05:30:00.11+00
  updatedAt             2024-04-20 05:30:00.11+00
  deletedAt             null
}
```

## Usage

The service can be accessed at https://identity-reconcillation.vercel.app/

The end point ```/identity``` receives the HTTP POST requests with JSON body of the following format:
```
{
  "email"?: string,
  "phoneNumber"?: number
}
```

If successful, the web service returns an HTTP 200 response with a JSON payload containing the consolidated contact.
The response is in this format:
```
{
  "contact":{
    "primaryContatctId": number,
    "emails": string[], // first element being email of primary contact
    "phoneNumbers": string[], // first element being phoneNumber of primary conta
    "secondaryContactIds": number[] // Array of all Contact IDs that are "seconda
  }
}
```
### Extending the previous example:

Request:
```
{
  "email": "naeem@hillvale.edu",
  "phoneNumber": "123456"
}
```
will give the following response
```
{
  "contact":{
    "primaryContatctId": 1,
    "emails": ["muzaffar@hillvale.edu","naeem@hillvale.edu"]
    "phoneNumbers": ["123456"]
    "secondaryContactIds": [23]
  }
}
```
##### In fact, all of the following requests will return the above response
```
{
  "phoneNumber":"123456"
}
```

```
{
  "email": "muzaffar@hillvale.edu",
}
```

```
{
  "email": "naeem@hillvale.edu",
}
```

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- A PostgreSQL database
- Prisma CLI (for database migrations)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/muzaffarbhat07/identity-reconcillation.git
cd identity-reconcillation
```

2. Install dependencies:
```bash
npm install
```
3. Set up .env file by referring to .env.example file.
4. Set up your database connection by editing the .env file with your database credentials.
5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the service:
```bash
npm start
```

The service will be running on http://localhost:4000.
