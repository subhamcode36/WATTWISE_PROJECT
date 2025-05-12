import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { historicalData } = await request.json();

    // Extract the last few months of data for context
    const lastThreeMonths = historicalData.slice(-3);
    
    // Create a prompt that includes the historical context and patterns
    const prompt = `
      Analyze this energy consumption data for the last 3 months and predict the next 3 months following the same patterns and trends.
      Historical data: ${JSON.stringify(lastThreeMonths)}
      
      Consider these factors:
      1. Seasonal patterns in energy consumption
      2. Growth trends in solar usage
      3. Historical consumption patterns
      
      Return ONLY an array of 3 predicted data points in exactly the same format as the input data, with dates continuing from the last historical date.
      Each prediction should include all the same fields as the input data.
      Format the response as valid JSON.
    `;

    // Generate prediction using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Parse and validate the prediction
    let predictions = [];
    try {
      predictions = JSON.parse(response.text());
      
      // Ensure predictions follow the same data structure
      predictions = predictions.map(pred => ({
        ...pred,
        consumption: parseFloat(pred.consumption),
        solar: parseFloat(pred.solar),
        otherSources: parseFloat(pred.otherSources),
        savings: parseFloat(pred.savings),
        solarPercentage: parseFloat(pred.solarPercentage),
        totalSavings: parseFloat(pred.totalSavings)
      }));
    } catch (error) {
      console.error('Error parsing predictions:', error);
      throw new Error('Invalid prediction format');
    }

    return new Response(JSON.stringify(predictions), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate predictions' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
} 