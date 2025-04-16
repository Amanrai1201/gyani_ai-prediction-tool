import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_FUN_FACT_API!);

interface FunFactResponse {
  fact: string;
  factType: 'fun' | 'educational' | 'interesting';
}

export async function generateFunFact(value: string): Promise<FunFactResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Generate a fun fact about ${value}. Return the response in JSON format with two fields: 'fact' (containing the actual fact) and 'factType' (which should be either 'fun', 'educational', or 'interesting'). Only return the JSON object, nothing else.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    try {
      // Attempt to parse the JSON response
      const jsonResponse = JSON.parse(text);
      // Extract only the fact value if available, otherwise use the full response
      const factValue = jsonResponse.fact || jsonResponse;
      return {
        fact: typeof factValue === 'string' ? factValue : text,
        factType: jsonResponse.factType || 'interesting'
      };
    } catch (jsonError) {
      // If JSON parsing fails, use the raw text as the fact
      return {
        fact: text,
        factType: 'interesting'
      };
    }
  } catch (error) {
    console.error('Error generating fun fact:', error);
    return {
      fact: 'Unable to generate a fun fact at the moment',
      factType: 'interesting'
    };
  }
}