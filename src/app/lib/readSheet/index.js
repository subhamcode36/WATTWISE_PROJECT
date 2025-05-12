import { google } from 'googleapis';

export const getSheetsData = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  })

  const sheets = google.sheets({ version: "v4", auth: await auth.getClient() })
  const range = "DATA!A:Z"

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range
    })
    return response.data.values
  } catch (error) {
    console.error(error)
    return []
  }
}