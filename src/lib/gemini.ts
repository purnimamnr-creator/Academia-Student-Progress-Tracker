import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAcademicInsights(scores: any[], goals: any[]) {
  const prompt = `
    As an academic advisor, analyze the following student data and provide insights:
    Scores: ${JSON.stringify(scores)}
    Goals: ${JSON.stringify(goals)}
    
    Provide:
    1. Areas needing improvement.
    2. Strengths.
    3. Actionable study tips.
    4. A motivational message.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          motivation: { type: Type.STRING }
        },
        required: ["improvements", "strengths", "tips", "motivation"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateStudyResources(subject: string) {
  const prompt = `Provide 5 high-quality study resources and 3 learning tips for the subject: ${subject}.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resources: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
}
