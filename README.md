# Identity Reconcillation Service

## Overview

The Identity Reconciliation Service is designed to identify and keep track of a user's identity across multiple requests with different contact information, thus linking different requests made with different contact information to the same person.
This service ensures linking different requests made with different contact information to the same person.
It is particularly useful in environments where tries to use different contact information for each request.

## Features

- **Automated Reconciliation**: Automatically identifies and reconciles discrepancies in user identity data across requests.
- **Flexible Integration**: Designed to easily integrate with existing databases and identity management systems using a RESTful API.

## Usage

The service can be accessed at <deployed_link>

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