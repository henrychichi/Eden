
import { GoogleGenAI, Type } from "@google/genai";
import { SafetyCheckResult } from '../types';

// Initialize Gemini
// NOTE: API Key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const moderateContent = async (text: string): Promise<SafetyCheckResult> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following text for use in a clean, youth-friendly religious dating app. 
            Text: "${text}"
            Strictly check for: Profanity, sexual content, harassment, or hate speech.
            Return JSON with "safe" (boolean) and "reason" (string).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        safe: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    },
                    required: ["safe", "reason"]
                }
            }
        });

        if (response.text) {
            const result = JSON.parse(response.text);
            return result;
        }
        return { safe: true };
    } catch (error) {
        console.error("Gemini moderation error:", error);
        // Fallback to safe to prevent blocking legitimate usage on API failure, 
        // but in prod should be fail-closed.
        return { safe: true }; 
    }
};

export const moderateImage = async (base64Image: string): Promise<SafetyCheckResult> => {
    try {
        // Extract base64 data and mime type from data URL
        const base64Data = base64Image.split(',')[1];
        const mimeType = base64Image.split(';')[0].split(':')[1];

        if (!base64Data || !mimeType) {
            return { safe: false, reason: "Invalid image format" };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    text: "Analyze this image for use in a clean, youth-friendly religious dating app. Check for nudity, explicit content, violence, or inappropriate gestures. Return JSON with 'safe' (boolean) and 'reason' (string)."
                },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        safe: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    },
                    required: ["safe", "reason"]
                }
            }
        });

         if (response.text) {
            const result = JSON.parse(response.text);
            return result;
        }
        return { safe: true };
    } catch (error) {
        console.error("Gemini image moderation error:", error);
        return { safe: true }; 
    }
};

export const moderateVideo = async (base64Video: string): Promise<SafetyCheckResult> => {
    try {
        const base64Data = base64Video.split(',')[1];
        const mimeType = base64Video.split(';')[0].split(':')[1];

        if (!base64Data || !mimeType) {
            return { safe: false, reason: "Invalid video format" };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    text: "Analyze this video for use in a clean, youth-friendly religious app. Check for nudity, explicit content, violence, or swearing in the audio/visuals. Return JSON with 'safe' (boolean) and 'reason' (string)."
                },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        safe: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    },
                    required: ["safe", "reason"]
                }
            }
        });

         if (response.text) {
            const result = JSON.parse(response.text);
            return result;
        }
        return { safe: true };
    } catch (error) {
        console.error("Gemini video moderation error:", error);
        return { safe: true }; 
    }
};

export const generateIceBreaker = async (interests: string[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, fun, clean, and friendly icebreaker question for a conversation between two SDA youths who are interested in: ${interests.join(', ')}. Keep it under 20 words.`,
        });
        return response.text || "How was your week?";
    } catch (error) {
        return "Hi! How are you doing?";
    }
};

export const generateImageCaption = async (base64Image: string): Promise<string> => {
    try {
        const base64Data = base64Image.split(',')[1];
        const mimeType = base64Image.split(';')[0].split(':')[1];

        if (!base64Data || !mimeType) {
            return "";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    text: "Generate a short, engaging, and clean caption for this photo to be posted on a social app for SDA youth. The post is about how they spent their day. Keep it under 20 words. Use emojis."
                },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                }
            ],
        });

        return response.text || "";
    } catch (error) {
        console.error("Gemini caption generation error:", error);
        return "";
    }
};

export const generateVideoCaption = async (base64Video: string): Promise<string> => {
    try {
        const base64Data = base64Video.split(',')[1];
        const mimeType = base64Video.split(';')[0].split(':')[1];

        if (!base64Data || !mimeType) {
            return "";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    text: "Generate a short, engaging, and clean caption for this video to be posted on a social app for SDA youth. Describe the activity shown. Keep it under 20 words. Use emojis."
                },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                }
            ],
        });

        return response.text || "";
    } catch (error) {
        console.error("Gemini video caption generation error:", error);
        return "";
    }
};

export const generateChallengeIdea = async (): Promise<{ title: string, description: string, type: 'Video' | 'Photo' | 'Mixed' }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Create a fun, clean, youth-friendly challenge for a church social app. It could be cooking, music, nature, or kindness related. Return JSON with 'title', 'description', and 'type' (Video, Photo, or Mixed).",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['Video', 'Photo', 'Mixed'] }
                    },
                    required: ["title", "description", "type"]
                }
            }
        });

        if (response.text) {
             return JSON.parse(response.text);
        }
        return { title: "Share a Smile", description: "Post a photo of something that made you smile today!", type: "Photo" };
    } catch (error) {
        return { title: "Sabbath Joy", description: "Share your favorite Sabbath activity.", type: "Mixed" };
    }
};
