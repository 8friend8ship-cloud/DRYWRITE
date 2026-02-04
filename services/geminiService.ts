
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set");
    }
    return new GoogleGenAI({ apiKey });
};

export async function generateTitle(content: string): Promise<string> {
    const ai = getAIClient();
    const truncatedContent = content.substring(0, 2000);
    const prompt = `Based on the following text, suggest a compelling and short title for an e-book. Return only the title text, with no extra formatting, labels, or quotation marks. The title should be concise and captivating.

    TEXT:
    ---
    ${truncatedContent}
    ---
    
    TITLE:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        // FIX: Safely access and trim the response text to avoid errors if it's undefined.
        return (response.text ?? '').trim();
    } catch (error) {
        console.error("Error generating title:", error);
        throw new Error("Failed to generate title from Gemini API.");
    }
}

export async function generateCoverImage(title: string, content: string): Promise<string> {
    const ai = getAIClient();
    const introText = content.substring(0, 500); // Use the first 500 characters as the intro
    const prompt = `Create a cover image for an e-book. The image should be in a simple infographic style, using clean lines, simple shapes, and a limited color palette to visually represent the key concepts from the provided title and introductory text. Do not include any text, letters, or words in the image. The style should be modern, symbolic, and clean.

TITLE: "${title}"

INTRODUCTORY TEXT:
---
${introText}
---
`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4",
                },
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
        throw new Error("No image data found in Gemini API response.");

    } catch (error) {
        console.error("Error generating cover image:", error);
        throw new Error("Failed to generate cover image from Gemini API.");
    }
}


export function createChat(bookContent: string): Chat {
    const ai = getAIClient();
    const truncatedContent = bookContent.substring(0, 20000); 
    const systemInstruction = `You are an intelligent assistant for an e-book. Your role is to answer questions and discuss topics based *only* on the provided content of the book. Do not use external knowledge. If the answer is not in the text, say that you cannot find the information in the provided document.

    Here is the book's content:
    ---
    ${truncatedContent}
    ---
    `;

    const chat: Chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction,
        },
    });
    return chat;
}

export async function sendMessage(chat: Chat, message: string): Promise<GenerateContentResponse> {
    try {
        const response = await chat.sendMessage({ message });
        return response;
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw new Error("Failed to get chat response from Gemini API.");
    }
}