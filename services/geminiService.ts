import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview'; // Updated to valid model name

export const identifyParties = async (fileData: FileData): Promise<string[]> => {
  try {
    const prompt = `
      Analyze the attached contract document. 
      Identify the full legal names of the two primary contracting parties.
      Check if each party has a defined term or alias (e.g., "Provider", "Customer", "Company", "Consultant") assigned to them in the preamble or introductory paragraph.
      
      Return a JSON list of strings where each string follows this format:
      "Full Legal Name ('Defined Term')"
      
      If a defined term is not explicitly stated, just return the Full Legal Name.
      
      Example:
      ["Acme Inc. ('Provider')", "Martian Enterprises LLC ('Company')"]
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            parties: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const result = JSON.parse(response.text || '{ "parties": [] }');
    return result.parties || [];
  } catch (error) {
    console.error("Error identifying parties:", error);
    throw new Error("Failed to identify parties from the document.");
  }
};

export const analyzeContract = async (
  fileData: FileData,
  representedParty: string,
  counterParty: string
): Promise<AnalysisResult> => {
  try {
    const systemInstruction = `
      You are an expert commercial attorney AI called "tl;dr LoL". 
      Your task is to analyze legal agreements for a non-legal executive audience (Sales VPs, CEOs).
      You must be accurate, concise, and structured.
      
      Context:
      - User Represents: "${representedParty}"
      - Counterparty: "${counterParty}"

      Task:
      1. Analyze INDEMNIFICATION clauses.
         - Check for mutuality. If obligations are substantially identical, treat as "Mutual".
         - Identify Claim Type (Third Party, First Party, or Both).
         - List Scope items (IP, negligence, data breach, death/injury, etc.). IMPORTANT: Sort these items alphabetically or by logical category to allow for easy side-by-side comparison between parties.
         - Suggest Improvements (Additions/Removals) based on market standards for the Represented Party.
         - Cite sections.

      2. Analyze LIMITATION OF LIABILITY (LoL) clauses.
         - Check for mutuality.
         - Consequential Damages Waiver: PASS if present, FAIL if absent. List exclusions.
         - Liability Cap: Describe the cap (Fixed, multiple of fees, etc.). List exclusions.
         - Cite sections where these terms are found.

      Return the output as a strict JSON object matching the schema provided.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME, // Use the same valid model constant
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64,
            },
          },
          { text: "Perform the legal analysis as instructed." },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            indemnity: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  partyName: { type: Type.STRING, description: "Name of the party or 'Mutual'" },
                  claimType: { type: Type.STRING, enum: ["Third Party", "First Party", "Third Party and First Party", "Unknown"] },
                  scope: { type: Type.ARRAY, items: { type: Type.STRING } },
                  additions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  removals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  citations: { type: Type.STRING },
                },
              },
            },
            lol: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  partyName: { type: Type.STRING, description: "Name of the party or 'Mutual'" },
                  consequentialDamagesStatus: { type: Type.STRING, enum: ["PASS", "FAIL"] },
                  consequentialDamagesExclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  capDescription: { type: Type.STRING },
                  capExclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  citations: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const rawResult = JSON.parse(response.text || '{}');
    const result: AnalysisResult = {
      indemnity: rawResult.indemnity || [],
      lol: rawResult.lol || []
    };
    return result;
  } catch (error) {
    console.error("Error analyzing contract:", error);
    throw new Error("Failed to analyze the contract.");
  }
};