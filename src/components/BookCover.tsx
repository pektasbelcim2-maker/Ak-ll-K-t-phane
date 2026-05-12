import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Book as BookIcon } from "lucide-react";
import { generateBookCoverStyle } from "../services/geminiService";

interface BookCoverProps {
  title: string;
  author: string;
  genre: string;
  className?: string;
}

interface Design {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  patternType: "geometric" | "abstract" | "minimal" | "ornamental";
  accentColor: string;
}

export const BookCover: React.FC<BookCoverProps> = ({ title, author, genre, className = "" }) => {
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDesign = async () => {
      try {
        const data = await generateBookCoverStyle(title, genre);
        if (mounted) {
          setDesign(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };

    fetchDesign();
    return () => { mounted = false; };
  }, [title, genre]);

  if (loading || !design) {
    return (
      <div className={`w-full h-full bg-[#1A1A1A] flex flex-col items-center justify-center gap-4 animate-pulse ${className}`}>
        <BookIcon size={40} className="text-white/10" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Kapak Tasarlanıyor...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        backgroundColor: design.primaryColor,
        color: design.textColor,
        position: "relative",
        overflow: "hidden" 
      }}
      className={`w-full h-full flex flex-col p-6 text-center justify-center items-center ${className}`}
    >
      {/* Decorative patterns based on type */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {design.patternType === "geometric" && (
           <div className="w-full h-full" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${design.accentColor} 1px, transparent 0)`, backgroundSize: "24px 24px" }} />
        )}
        {design.patternType === "abstract" && (
           <div className="w-full h-full overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 blur-3xl rounded-full" style={{ backgroundColor: design.secondaryColor, opacity: 0.3 }} />
              <div className="absolute bottom-0 right-0 w-64 h-64 blur-3xl rounded-full" style={{ backgroundColor: design.accentColor, opacity: 0.3 }} />
           </div>
        )}
        {design.patternType === "ornamental" && (
           <div className="w-full h-full border-[20px] border-double" style={{ borderColor: `${design.accentColor}22` }} />
        )}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8">
        <div className="w-12 h-[1px]" style={{ backgroundColor: design.accentColor }}></div>
        
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-2xl font-bold leading-tight tracking-tight px-2">
            {title}
          </h3>
          <div className="flex items-center justify-center gap-2">
             <div className="w-4 h-[1px] opacity-30" style={{ backgroundColor: design.textColor }}></div>
             <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 italic">
                {author}
             </p>
             <div className="w-4 h-[1px] opacity-30" style={{ backgroundColor: design.textColor }}></div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
           <div className="px-3 py-1 rounded-full text-[8px] uppercase font-bold tracking-[0.2em] border" 
                style={{ borderColor: `${design.accentColor}44`, backgroundColor: `${design.accentColor}11`, color: design.accentColor }}>
              {genre}
           </div>
           <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest font-bold opacity-30">
              <Sparkles size={10} /> AI Tasarımı
           </div>
        </div>
      </div>

      {/* Spine effect */}
      <div className="absolute top-0 left-0 bottom-0 w-4 bg-black/20 blur-[1px] border-r border-white/5"></div>
      <div className="absolute top-0 left-4 bottom-0 w-[1px] bg-white/5 opacity-50"></div>
    </motion.div>
  );
};
