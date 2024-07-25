"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
    <div style="color:purple;display:flex;flex-direction:column;width:100%;max-width:1200px;margin:70px auto;padding:20px;">
      <h1>Welcome to the Identity Reconciliation API service!</h1>
      <h2 style="margin-bottom:0;">Overview</h2>
      <ul style="list-decoration:none">
        <li>The Identity Reconciliation Service is designed to identify and keep track of a user's identity across multiple requests with different contact information.</li>
        <li>This service ensures linking different requests made with different contact information to the same person.</li>
        <li>It is particularly useful in environments where user tries to use different contact information for each request.</li>
        <p>You can access the detailed problem statement and solution doc <a href="https://docs.google.com/document/d/1JSyNP3WfG9_5AmmdufHu48E83_Hy3Jxo_YJBdY_bbqU/edit?usp=sharing" target="_blank" style="color:green;">here</a>.</p>
      </ul>
      
      <h2 style="margin-bottom:0;">Usage</h2>
      <ul>
        <li>The end point <code style="font-weight:bold;background-color:#f1f1f1;color:red;padding:5px;border-radius:3px;">/identity</code> receives the HTTP POST requests with JSON body of the following format:
          <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
{
  "email"?: string,
  "phoneNumber"?: number
}
          </pre>
        </li>
        <li>If successful, the web service returns an HTTP 200 response with a JSON payload containing the consolidated contact.</li>
        <li>The response is in this format:
          <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
{
  "contact":{
    "primaryContatctId": number,
    "emails": string[], // first element being email of primary contact
    "phoneNumbers": string[], // first element being phoneNumber of primary conta
    "secondaryContactIds": number[] // Array of all Contact IDs that are "seconda
  }
}
          </pre>
        </li>
      </ul>
      <h2 style="margin-bottom:0;">Working<span style="font-size:12px;"> (In case you didn't go through the doc above)</span></h2>
      <ul>
        <li>
          The system keeps track of the collected contact information in a relational database table named Contact.
          <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
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
          </pre>
        </li>
        <li>One customer can have multiple Contact rows in the database. All of these rows are linked together, with the oldest one being treated as "primary" and the rest as "secondary."</li>
        <li>Contact rows are linked if they have either the same email or phone number.</li>
        <h3 style="margin:0;margin-top:10px;">For Example</span></h3>
        <ul>
          <li>
            If a customer placed an order with
            <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
{
  "email": "muzaffar@hillvale.edu"
  "phoneNumber": "123456"
}
            </pre>
            and later came back to place another order with
            <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
{
  "email": "naeem@hillvale.edu"
  "phoneNumber": "123456"
}
            </pre>
          </li>
          <li>
            The database will have the following rows:
            <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
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
            </pre>
          </li>
        </ul>
        <h3 style="margin:0;margin-top:10px;">Extending the previous example:</span></h3>
        <ul>
          <li>
            Now the request:
            <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
{
  "email": "naeem@hillvale.edu",
  "phoneNumber": "123456"
}
            </pre>
            will give the following response:
            <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
{
  "contact":{
    "primaryContatctId": 1,
    "emails": ["muzaffar@hillvale.edu","naeem@hillvale.edu"]
    "phoneNumbers": ["123456"]
    "secondaryContactIds": [23]
  }
}
            </pre>
          </li>
          <li>
            In fact, all of the following requests will return the above response
            <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
{
  "phoneNumber":"123456"
}
            </pre>
            <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
{
  "email": "muzaffar@hillvale.edu"
}
            </pre>
            <pre style="font-weight:bold;background-color:#f1f1f1;color:red;padding:8px;">
{
  "email": "naeem@hillvale.edu"
}
            </pre>
          </li>
        </ul>
      </ul>
    </div>
`;
