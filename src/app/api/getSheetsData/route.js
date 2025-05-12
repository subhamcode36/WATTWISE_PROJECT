import { google } from 'googleapis';

export async function GET(req, res) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });
  const range = "Total Energy Consumtion!A:Z";

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range
    });
    return new Response(JSON.stringify(response.data.values), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data from Google Sheets' }), { status: 500 });
  }
}