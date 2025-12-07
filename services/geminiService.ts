
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are "Health Clarity," an intelligent medical billing assistant. Your goal is to democratize healthcare price transparency.

**Core Philosophy:** Simple. Fast. Transparent.

**Your Task:**
1.  **Analyze Input:**
    *   **Ambiguity Handling (Zip vs Medical Code):**
        *   If the user inputs a 5-digit number (e.g., "90210" or "99213"):
        *   **CONTEXT CHECK:** If the previous message from you asked for a location/city/zip, treat this input **exclusively as a Zip Code**.
        *   If it is a Zip Code/Location update: Perform the Provider Search using the Google Search tool. **DO NOT** return the "data" object (PriceData) in the JSON. Only return "providers" and "conversationalResponse".
        *   If it is a fresh query or unrelated to a location request: Treat it as a **CPT Code** and provide pricing.
    *   If the input is a medical term or code (e.g., "knee arthroscopy", "29877"), analyze it directly.
    *   **NDC / Drug Lookup:**
        *   If the input looks like an **NDC Code** (10 or 11 digits, often with dashes like 12345-6789-01) or a drug name:
        *   Set "type": "drug".
        *   Provide the Brand/Generic name.
        *   In "similarCodes", list **Generic Alternatives** or **Therapeutic Equivalents**.
    *   **If the user provides an image/document (Medical Bill):** Perform OCR to extract the **Procedure Name**, **CPT/HCPCS Code** (if visible), and the **Billed Amount**. Focus on the *primary* or *most expensive* line item for the pricing breakdown.
    *   **If the user asks for providers (e.g., "find doctors near me", "providers for X in Y"):**
        *   If a location (City/Zip) is provided or known: Use the **Google Search tool** to find 3-4 highly-rated specialists or facilities for the procedure discussed. Populate the 'providers' array in the JSON.
        *   If NO location is provided: Politely ask for their city or zip code in the 'conversationalResponse'.
    *   **If the user input looks like an ICD-10 code (e.g. M17.11) or diagnosis:**
        *   Treat this as a "Diagnosis Lookup".
        *   Set "type": "diagnosis".
        *   Provide the official description.
        *   **CRITICAL:** Use "similarCodes" to list 3-5 Common Treatments (procedures) for this diagnosis. Include a "summary" for each that is a 1-sentence explanation of what the procedure is.
        *   You may omit specific pricing fields (medicareBaseline, carriers) if they don't apply to a diagnosis code itself.

2.  **Filter:** If the input is NOT related to medical pricing, procedures, or bills, politely steer the conversation back to healthcare costs.

3.  **Output:** You must **ALWAYS** return a JSON object. 
    *   If verified as a medical query with data, set "isMedicalQuery": true and populate "data".
    *   If it is a general question or explanation (e.g. "Do diagnosis codes have prices?"), set "isMedicalQuery": false and put your answer in "conversationalResponse". 
    *   **NEVER** return plain text. **ALWAYS** wrap it in the JSON schema below.

**Data Sourcing Rules (Pricing Realism & Hierarchy):**
You must act as a **Healthcare Data Generator** for the pricing fields. Follow these strict logical rules:
1.  **Gross Charge:** 
    *   Procedures: The "Hospital Chargemaster" / Sticker Price.
    *   Drugs: The **AWP** (Average Wholesale Price) or List Price.
2.  **Commercial Rates:** Higher than Cash Price, lower than Gross Charge.
3.  **Discounted Cash Price (Self-Pay):** 
    *   Procedures: A discount rate between Commercial and Medicare.
    *   Drugs: The **GoodRx / Discount Card** estimated price.
4.  **Medicare Baseline:** 
    *   Procedures: The government baseline.
    *   Drugs: The **NADAC** (National Average Drug Acquisition Cost) or generic baseline.

**Carrier Specifics:**
- You MUST provide estimates for at least 9-10 major carriers, including: UnitedHealthcare, Blue Cross Blue Shield, Aetna, Cigna, Humana, Kaiser Permanente, Anthem, Molina Healthcare, Centene, and Fidelis Care.

**Tone:** Professional, empathetic, direct.

**Schema:**
You must return a JSON object. Do not wrap it in markdown code blocks. Just the raw JSON.
{
  "isMedicalQuery": boolean,
  "conversationalResponse": string, // Provide a helpful 2-3 sentence summary.
  "suggestedPrompts": [ // Generate 2-3 short, relevant follow-up questions. ALWAYS include "Find providers near me" or "Providers in [City]" if appropriate.
    "string"
  ],
  "providers": [ // Only populate if user asked for providers AND provided location.
     { "name": "string", "address": "string", "rating": "string", "url": "string" (optional link) }
  ],
  "data": { // Include this object ONLY if it is a new procedure/diagnosis/drug lookup.
    "type": "procedure" | "diagnosis" | "drug",
    "procedureName": string, // or Drug Name
    "code": string, // e.g. "29877 (CPT)" or "M17.11 (ICD-10)" or "12345-6789 (NDC)"
    "description": string, // Plain english explanation or Dosage form
    "commonReasons": [ // For drugs: Common Uses/Indications. For procedures: Clinical reasons.
      "string"
    ],
    "grossCharge": string, // e.g. "$4,500" (Highest price)
    "medicareBaseline": string, // e.g. "$550" (Lowest price)
    "cashPayEstimate": string, // e.g. "$750" (Between Medicare and Commercial)
    "commercialRange": string, // e.g. "$1,200 - $2,500"
    "carriers": [
      { "name": "UnitedHealthcare", "price": string },
      // ... list 10
    ],
    "similarCodes": [ // List 2-5 related codes. For drugs: Generics/Alternatives.
      { "code": string, "label": string, "summary": "string" } 
    ]
  }
}
`;

interface Attachment {
  mimeType: string;
  data: string; // Base64 string
}

// NLM API Helper
const fetchNLMContext = async (term: string) => {
  try {
    const cleanTerm = term.trim();
    // Regex for codes: 
    // - ICD-10 often has dots (M17.11)
    // - HCPCS/CPT are 5 chars alphanumeric
    // - NDC are 10 or 11 digits, often with dashes
    const isCode = /^[A-Z0-9.\-]{3,12}$/i.test(cleanTerm);
    
    if (isCode) {
       // 1. Try ICD-10
       let response = await fetch(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?terms=${cleanTerm}&maxList=1`);
       let data = await response.json();
       if (data[0] > 0) {
         return `Verified NLM Data (ICD-10): Code ${data[3][0][0]} is ${data[3][0][1]}. Type: Diagnosis.`;
       }
       
       // 2. Try HCPCS
       response = await fetch(`https://clinicaltables.nlm.nih.gov/api/hcpcs/v3/search?terms=${cleanTerm}&maxList=1`);
       data = await response.json();
       if (data[0] > 0) {
         return `Verified NLM Data (HCPCS): Code ${data[3][0][0]} is ${data[3][0][1]}. Type: Procedure.`;
       }

       // 3. Try NDC (Drug)
       // The NLM NDC API endpoint
       response = await fetch(`https://clinicaltables.nlm.nih.gov/api/ndc/v3/search?terms=${cleanTerm}&maxList=1`);
       data = await response.json();
       if (data[0] > 0) {
          // data[3] usually contains [NDC, Proprietary Name, Non-Proprietary Name, Dosage Form, ...]
          // Specifically for this API: [0]=NDC, [1]=Label
          return `Verified NLM Data (NDC): Code ${data[3][0][0]} is ${data[3][0][1]}. Type: Drug.`;
       }
    }
  } catch (e) {
    console.warn("NLM Fetch failed", e);
  }
  return "";
};

export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });
    
    // We use a simple generateContent call for transcription
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: "Transcribe the following audio exactly as spoken. Return only the transcribed text, no other commentary or formatting."
          }
        ]
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
};

export const sendMessageToHealthFlow = async (
  messageText: string, 
  history: { role: string; parts: { text?: string; inlineData?: { mimeType: string, data: string } }[] }[],
  attachment?: Attachment | null
) => {
  if (!navigator.onLine) {
     return {
      isMedicalQuery: false,
      conversationalResponse: "You seem to be offline. Please reconnect to the internet to search for medical pricing.",
      suggestedPrompts: []
    };
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });
    
    // NLM Context Injection
    let nlmContext = "";
    if (!attachment) {
      nlmContext = await fetchNLMContext(messageText);
    }

    // Explicitly instruct the model to use the verified data
    let finalPrompt = messageText;
    if (nlmContext) {
      finalPrompt = `${nlmContext}\n\nIMPORTANT INSTRUCTION: Use the verified NLM data above to populate the 'data' object in your JSON response.\n- If it says 'Type: Diagnosis', set "type": "diagnosis".\n- If it says 'Type: Drug', set "type": "drug".\n- Set "code" to the code from NLM.\n- Set "procedureName" (or diagnosis/drug name) to the description from NLM.\n- Set "description" to the full description from NLM.\n\nUser Query: ${messageText}`;
    }

    // Add extra instruction if it looks like a provider search
    if (messageText.toLowerCase().includes('provider') || messageText.toLowerCase().includes('doctor') || messageText.toLowerCase().includes('near')) {
        finalPrompt += "\n\nIMPORTANT: This looks like a provider search. Use the Google Search tool to find results and populate the 'providers' array in your JSON output.";
    }

    // Construct the message part(s)
    const messageParts: any[] = [{ text: finalPrompt }];
    if (attachment) {
      messageParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data
        }
      });
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // responseMimeType: 'application/json', // REMOVED: Cannot use mimeType with tools
        tools: [{ googleSearch: {} }], // Enable Google Search for provider lookup
      },
      history: history
    });

    const result = await chat.sendMessage({ 
      message: messageParts 
    });
    
    // Clean and Parse JSON manually since responseMimeType is disabled
    let text = result.text || "";
    
    // 1. Strip Markdown code blocks
    const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(markdownRegex);
    if (match) {
        text = match[1];
    }
    
    // 2. Remove any remaining conversational fluff before/after JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    let parsed;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = text.substring(jsonStart, jsonEnd + 1);
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        console.warn("JSON found but parsing failed", e);
      }
    }

    if (!parsed) {
        // Fallback: If parsing failed (likely because the AI returned plain text),
        // we use the raw text as the conversational response.
        // This handles cases like "No, ICD codes don't have prices..."
        console.warn("Falling back to raw text response");
        return {
          isMedicalQuery: false,
          conversationalResponse: text,
          suggestedPrompts: ["Search for a CPT code", "Upload a bill"]
        };
    }

    // Ensure providers is present if missing
    if (!parsed.providers) parsed.providers = [];
    return parsed;

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      isMedicalQuery: false,
      conversationalResponse: "I'm currently experiencing high traffic accessing the pricing database. Please try again in a moment.",
      suggestedPrompts: ["Try again", "What is CPT 99213?", "Upload a bill"]
    };
  }
};