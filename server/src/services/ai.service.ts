import OpenAI from 'openai';
import config from '../config/index.js';
import { ExtractedFinancialData } from '../types/index.js';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

const FINANCIAL_EXTRACTION_PROMPT = `You are a financial data extraction specialist. Analyze the provided financial document and extract structured financial data.

Extract the following information:
- Revenue (total income/sales)
- Expenses (total costs/expenditures)
- Net Profit (revenue minus expenses)
- Period (time period covered by the report, e.g., "Q1 2024", "July 2024", "2023")
- Period Start Date (ISO format YYYY-MM-DD)
- Period End Date (ISO format YYYY-MM-DD)

Return the data in strict JSON format:
{
  "revenue": number,
  "expenses": number,
  "netProfit": number,
  "period": "string",
  "periodStart": "YYYY-MM-DD",
  "periodEnd": "YYYY-MM-DD"
}

Rules:
- All monetary values should be positive numbers
- If a value is not explicitly stated but can be calculated, include it
- Use 0 for any value that cannot be determined
- The period string should be human-readable
- Dates should be in YYYY-MM-DD format. If only a month/year is provided, use the first/last day of that month
- Be precise and only extract data that is clearly stated or calculable from the document

Return ONLY the JSON object, no additional text or explanation.`;

export const extractFinancialDataFromText = async (
  text: string
): Promise<ExtractedFinancialData> => {
  try {
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: FINANCIAL_EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: `Extract financial data from this document:\n\n${text}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const cleanedContent = content.trim().replace(/^```json\n?|```$/g, '');
    const extractedData = JSON.parse(cleanedContent) as ExtractedFinancialData;

    // Validate the extracted data
    if (typeof extractedData.revenue !== 'number' || 
        typeof extractedData.expenses !== 'number' || 
        typeof extractedData.netProfit !== 'number') {
      throw new Error('Invalid extracted data format');
    }

    return extractedData;
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to extract financial data: ${error.message}` 
        : 'Failed to extract financial data from document'
    );
  }
};

export const extractFinancialDataFromBase64 = async (
  base64Image: string,
  mimeType: string = 'image/png'
): Promise<ExtractedFinancialData> => {
  try {
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: FINANCIAL_EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const cleanedContent = content.trim().replace(/^```json\n?|```$/g, '');
    const extractedData = JSON.parse(cleanedContent) as ExtractedFinancialData;

    // Validate the extracted data
    if (typeof extractedData.revenue !== 'number' || 
        typeof extractedData.expenses !== 'number' || 
        typeof extractedData.netProfit !== 'number') {
      throw new Error('Invalid extracted data format');
    }

    return extractedData;
  } catch (error) {
    console.error('OpenAI image extraction error:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to extract financial data from image: ${error.message}` 
        : 'Failed to extract financial data from image'
    );
  }
};

export const analyzeDocumentForCompleteness = async (
  text: string
): Promise<{ isComplete: boolean; missingFields: string[] }> => {
  try {
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: `You are a financial document analyst. Review the provided document and identify any missing or incomplete financial information.

Required fields:
- Revenue
- Expenses  
- Net Profit
- Period

Return a JSON object:
{
  "isComplete": boolean,
  "missingFields": string[]
}`,
        },
        {
          role: 'user',
          content: `Analyze this document for completeness:\n\n${text}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return { isComplete: false, missingFields: ['Unable to analyze document'] };
    }

    const cleanedContent = content.trim().replace(/^```json\n?|```$/g, '');
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('OpenAI completeness check error:', error);
    return { isComplete: false, missingFields: ['Error analyzing document'] };
  }
};
