/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Book } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getPersonalizedRecommendations(
  readingHistory: Book[],
  allBooks: Book[],
  preferredGenre?: string
): Promise<string[]> {
  const historyTitles = readingHistory.map(b => b.title).join(", ");
  const allTitles = allBooks.map(b => b.id + ":" + b.title + " (" + b.genre + ")").join(", ");

  const prompt = `
    Kullanıcının okuma geçmişi: ${historyTitles || "Henüz kitap okumadı (yeni kullanıcı)."}
    ${preferredGenre && preferredGenre !== "Tümü" ? `Kullanıcı şu an "${preferredGenre}" türüne ilgi duyuyor.` : ""}
    Mevcut kütüphane kitapları (ID:Başlık (Tür) formatında): ${allTitles}
    
    Lütfen kullanıcı için en uygun 3 kitap ID'sini seç. 
    Eğer kullanıcının geçmişi varsa ilgi alanlarına göre seç. 
    Geçmişi yoksa, kütüphanedeki en dikkat çekici ve popüler olabilecek ${preferredGenre && preferredGenre !== "Tümü" ? `özellikle "${preferredGenre}" türündeki` : ""} eserleri öner.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "Sen profesyonel bir kütüphanecisin. Kullanıcıların okuma geçmişine göre sadece mevcut kütüphanedeki kitaplardan en uygun olanların ID'lerini JSON formatında döndürürsün.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reasoning: {
              type: Type.STRING,
              description: "Neden bu kitapları önerdiğinin kısa bir açıklaması."
            }
          },
          required: ["recommendedIds", "reasoning"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.recommendedIds;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    return [];
  }
}

export async function generateBookCoverStyle(title: string, genre: string) {
  const prompt = `
    Kitap Başlığı: "${title}"
    Tür: "${genre}"
    
    Bu kitap için estetik bir kapak tasarımı parametreleri belirle. 
    Lütfen şu formatta bir JSON döndür:
    {
      "primaryColor": "hex kod",
      "secondaryColor": "hex kod",
      "textColor": "hex kod",
      "patternType": "geometric" | "abstract" | "minimal" | "ornamental",
      "accentColor": "hex kod",
      "mood": "kısa bir açıklama"
    }
    Renkler kitabın türüne ve ismine uygun, premium ve şık olmalı.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "Sen profesyonel bir kitap kapak tasarımcısısın. Sadece istenen JSON formatında yanıt verirsin.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            textColor: { type: Type.STRING },
            patternType: { type: Type.STRING, enum: ["geometric", "abstract", "minimal", "ornamental"] },
            accentColor: { type: Type.STRING },
            mood: { type: Type.STRING }
          },
          required: ["primaryColor", "secondaryColor", "textColor", "patternType", "accentColor"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Cover Design Error:", error);
    return {
      primaryColor: "#1a1a1a",
      secondaryColor: "#C5A059",
      textColor: "#E0D8D0",
      patternType: "minimal",
      accentColor: "#C5A059"
    };
  }
}
