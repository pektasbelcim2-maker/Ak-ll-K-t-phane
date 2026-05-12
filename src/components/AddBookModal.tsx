import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, BookOpen, AlignLeft, Image as ImageIcon, Tag, Save } from "lucide-react";
import { Book } from "../types";
import { GENRES } from "../constants";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (book: Omit<Book, "id" | "rating">) => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState(GENRES[1]); // Default to first real genre
  const [coverImage, setCoverImage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      author,
      description,
      genre,
      coverImage: coverImage || `https://picsum.photos/seed/${Math.random()}/400/600`
    });
    // Reset form
    setTitle("");
    setAuthor("");
    setDescription("");
    setGenre(GENRES[1]);
    setCoverImage("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                  <Plus className="text-[#C5A059]" /> Yeni Kitap Ekle
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-bold">Kütüphane Yönetim Paneli</p>
              </div>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input
                    type="text"
                    placeholder="KİTAP ADI"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-all placeholder:text-white/10"
                  />
                </div>
                <div className="relative">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input
                    type="text"
                    placeholder="YAZAR"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-all appearance-none cursor-pointer"
                >
                  {GENRES.filter(g => g !== "Tümü").map(g => (
                    <option key={g} value={g} className="bg-[#111]">{g}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  type="url"
                  placeholder="KAPAK GÖRSELİ URL (BOŞ BIRAKILIRSA RASTGELE ATANIR)"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-all placeholder:text-white/10"
                />
              </div>

              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-white/20" size={16} />
                <textarea
                  placeholder="KİTAP AÇIKLAMASI"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-all placeholder:text-white/10 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A059] text-black py-5 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#D5B069] transition-all flex items-center justify-center gap-3 group mt-4 shadow-[0_10px_30px_rgba(197,160,89,0.2)]"
              >
                KİTABI ARŞİVE EKLE <Save size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
