/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverImage: string;
  rating: number;
}

export interface ReadingHistoryItem {
  id: string;
  bookId: string;
  dateRead: string;
  note?: string;
}

export type Genre = "Tümü" | "Macera" | "Fantastik" | "Romantik" | "Komedi" | "Polisiye" | "Bilim Kurgu" | "Tarih" | "Psikoloji" | "Felsefe" | "Korku" | "Biyografi" | "Roman";
