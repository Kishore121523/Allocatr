// app/api/categorize/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from "openai";

export async function POST(request: NextRequest) {
  try {
    const { input, categories } = await request.json();

    if (!input || !categories) {
      return NextResponse.json(
        { error: 'Missing input or categories' },
        { status: 400 }
      );
    }

    // Check if Azure OpenAI is configured
    const endpoint = process.env.AZURE_O3_MINI_ENDPOINT;
    const apiKey = process.env.AZURE_O3_MINI_KEY;
    const deployment = process.env.AZURE_O3_MINI_DEPLOYMENT_NAME;
    const apiVersion = process.env.AZURE_O3_MINI_API_VERSION || "2024-12-01-preview";

    if (!endpoint || !apiKey || !deployment) {
      return NextResponse.json(
        { error: 'Azure OpenAI not configured' },
        { status: 500 }
      );
    }

    // Initialize client
    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion,
      deployment,
    });

    // Get today's date for context (local timezone)
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Prepare the prompt with date parsing
    const prompt = `Extract expense information from the following text and categorize it.
    
Today's date is: ${today}

Text: "${input}"

Available categories: ${categories.join(', ')}

Instructions:
1. Extract the amount (number only, no currency symbol)
2. Create a brief, clear description
3. Select the most appropriate category from the available list
4. Parse any date references (tomorrow, next week, yesterday, specific dates, etc.)
   - If a date is mentioned, convert it to YYYY-MM-DD format
   - "tomorrow" means ${(() => { const d = new Date(now); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
   - "yesterday" means ${(() => { const d = new Date(now); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
   - If no date is mentioned, use today's date: ${today}

Respond in JSON format:
{
  "amount": number,
  "description": "string",
  "suggestedCategory": "string",
  "confidence": number between 0 and 1,
  "date": "YYYY-MM-DD string"
}`;

    try {
      const completion = await client.chat.completions.create({
        model: deployment, 
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts and categorizes expense information from natural language input. Always include a date field in your JSON response. Parse relative dates like "tomorrow", "yesterday", "next week" into specific dates. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_completion_tokens: 2000,
      });

      const contentText = completion.choices?.[0]?.message?.content;
      
      if (contentText) {
        const result = JSON.parse(contentText);
        
        // Ensure date is always present
        if (!result.date) {
          result.date = today;
        }
        
        return NextResponse.json({
          amount: Number(result.amount) || 0,
          description: result.description || 'Expense',
          suggestedCategory: result.suggestedCategory || categories[0] || 'Other',
          confidence: result.confidence || 0.9,
          date: result.date, // Include the date in response
        });
      }
    } catch (azureError: any) {
      console.error('Azure OpenAI error:', azureError);
      return NextResponse.json(
        { 
          error: 'AI categorization failed',
          details: azureError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Categorization error:', error);
    return NextResponse.json(
      { error: 'Failed to categorize expense' },
      { status: 500 }
    );
  }
}