/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { GENRES } from "../constants";

export interface GenreSelectorProps {
  selected: string;
  onSelect: (genre: string) => void;
}

export const GenreSelector: React.FC<GenreSelectorProps> = React.memo(({ selected, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {GENRES.map((genre) => (
        <button
          key={genre}
          onClick={() => onSelect(genre)}
          className={`px-4 py-2 rounded-md font-sans text-[10px] font-bold transition-all duration-200 border uppercase tracking-[0.15em] ${
            selected === genre
              ? "bg-[#C5A059] text-[#0A0A0A] border-[#C5A059]"
              : "bg-[#1A1A1A] text-[#E0D8D0]/40 border-white/5 hover:border-[#C5A059]/30 hover:text-[#E0D8D0]"
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
});
