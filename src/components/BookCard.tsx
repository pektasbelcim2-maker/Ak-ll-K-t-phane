/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Star, Plus, Check } from "lucide-react";
import { Book } from "../types";
import { BookCover } from "./BookCover";

export interface BookCardProps {
  book: Book;
  isRead: boolean;
  onToggleRead: (id: string) => void;
  onClick?: () => void;
  userRating?: number;
}

export const BookCard: React.FC<BookCardProps> = React.memo(({ book, isRead, onToggleRead, onClick, userRating }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <div 
      className="group perspective-1000 w-full h-full cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={onClick}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front Face */}
        <div className="backface-hidden w-full h-full bg-[#161616] rounded-xl overflow-hidden shadow-2xl border border-white/5 flex flex-col">
          <div className="aspect-[2/3] overflow-hidden relative bg-[#222]">
            {book.coverImage && book.coverImage !== "" && !book.coverImage.includes("placeholder") ? (
              <img
                src={book.coverImage}
                alt={book.title}
                loading="lazy"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <BookCover title={book.title} author={book.author} genre={book.genre} />
            )}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRead(book.id);
                }}
                className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                  isRead 
                    ? "bg-[#C5A059] text-[#0A0A0A]" 
                    : "bg-white/10 text-white hover:bg-white/20"
                } shadow-lg`}
              >
                {isRead ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </div>
            {isRead && (
              <div className="absolute top-3 left-3">
                <span className="bg-[#C5A059]/90 text-[#0A0A0A] text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded shadow-sm">
                  Okundu
                </span>
              </div>
            )}
          </div>
          
          <div className="p-4 flex-1">
            <div className="flex items-center gap-1 mb-1">
              <Star size={12} className={`transition-colors ${userRating ? "fill-[#C5A059] text-[#C5A059]" : "fill-[#C5A059]/30 text-[#C5A059]/30"}`} />
              <span className="text-[11px] font-medium text-[#C5A059]">{userRating ? `${userRating}.0` : book.rating}</span>
              <span className="mx-2 text-white/10 text-xs">|</span>
              <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">{book.genre}</span>
            </div>
            
            <h3 className="font-serif text-base font-bold text-[#E0D8D0] leading-tight mb-0.5 truncate tracking-tight">
              {book.title}
            </h3>
            <p className="text-xs text-[#E0D8D0]/50 font-medium truncate">{book.author}</p>
          </div>
        </div>

        {/* Back Face (The Summary) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl border border-[#C5A059]/30 p-6 flex flex-col items-center text-center justify-center">
          {/* Back Face Action Button */}
          <div className="absolute top-3 left-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleRead(book.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                isRead 
                  ? "bg-[#C5A059] text-[#0A0A0A]" 
                  : "bg-white/10 text-white hover:bg-white/20"
              } shadow-lg`}
            >
              {isRead ? <Check size={18} /> : <Plus size={18} />}
            </button>
          </div>

          <div className="mb-4">
            <div className="w-12 h-0.5 bg-[#C5A059]/30 mx-auto mb-1"></div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059]/60">
              {userRating ? `${userRating}.0 PUANIN` : "Özet"}
            </p>
            <div className="w-12 h-0.5 bg-[#C5A059]/30 mx-auto mt-1"></div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-white/70 leading-relaxed italic font-serif line-clamp-[8]">
               "{book.description}"
            </p>
          </div>

          <button 
            className="mt-4 px-4 py-1.5 rounded-full border border-[#C5A059]/30 text-[#C5A059] text-[10px] uppercase tracking-widest font-bold hover:bg-[#C5A059] hover:text-[#0A0A0A] transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Detaylı Bilgi
          </button>

          <div className="mt-4 pt-4 border-t border-white/5 w-full flex justify-between items-center">
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-tighter text-white/20 font-bold">ISBN</p>
              <p className="text-[9px] font-mono text-white/10">978-3-16-148410-0</p>
            </div>
            <div className="w-8 h-8 opacity-20 grayscale invert">
               <div className="w-full h-full bg-gradient-to-b from-white/40 to-transparent flex items-end">
                  <div className="w-full flex justify-around px-1 h-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="w-[1px] h-full bg-white"></div>)}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
