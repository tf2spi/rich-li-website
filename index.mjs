import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(\+\d{1,2}[\s.-])?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
const ZIP_REGEX = /^[0-9]{5}(-[0-9]{4})?/;

const signup = async (emailarg, phonearg, ziparg) => {
  const email = String(emailarg || '');
  const zip = String(ziparg || '');
  const phone = String(phonearg || '');

  if (email && !email.match(EMAIL_REGEX)) {
    return {statusCode: 400, message: 'E-mail does not match format (i.e. user@email.com)'};
  } else if (phone && !phone.match(PHONE_REGEX)) {
    return {statusCode: 400, message: 'Phone number does not match format (i.e. 123-456-7890)'};
  } else if (zip && !zip.match(ZIP_REGEX)) {
    return {statusCode: 400, message: 'ZIP code does not match format (i.e. 12345)'};
  }
  if (email) {
    await docClient.send(new PutCommand({
      TableName: "richli-signups-email",
      Item: {
        email,
        zip,
        phone
      },
    }));
  }
  if (phone) {
    await docClient.send(new PutCommand({
      TableName: "richli-signups-phone",
      Item: {
        phone,
      },
    }));
  }
};

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  switch (event.routeKey) {
    case "OPTIONS /signup": {
      return {
        statusCode: 200,
        headers
      };
    }
    case "POST /signup": {
      const reqParams = JSON.parse(event.body);
      await signup(reqParams.email, reqParams.phone, reqParams.zip);
    }
  }

  const statusCode = 200;
  return {
    statusCode,
    body: JSON.stringify({statusCode, message: "Success!"}),
    headers
  };
};
