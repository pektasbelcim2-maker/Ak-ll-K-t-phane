import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, User, Check, Edit2, X, Trash2, Users } from "lucide-react";

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; schoolNumber: string; isAdmin?: boolean };
  onLogout: () => void;
  onUpdateName: (newName: string) => void;
  onDeleteProfile: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose, user, onLogout, onUpdateName, onDeleteProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state with prop
  useEffect(() => {
    setNewName(user.name);
  }, [user.name]);

  // Handle focus when editing starts
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isEditing]);

  const handleUpdate = () => {
    if (newName.trim() && newName.trim() !== user.name) {
      onUpdateName(newName.trim());
    }
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-[150]" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-20 right-8 w-64 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl z-[160] overflow-hidden backdrop-blur-xl"
          >
            <div 
              className={`p-6 border-b border-white/5 bg-gradient-to-br from-[#1A1A1A] to-transparent transition-colors ${!isEditing ? "hover:bg-white/5 cursor-pointer" : "cursor-default"}`}
              onClick={() => !isEditing && setIsEditing(true)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest">Profil Bilgileri</span>
                  <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter bg-white/10 text-white/40">
                    {user.isAdmin ? "YÖNETİCİ" : "ÖĞRENCİ"}
                  </span>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate();
                        if (e.key === "Escape") setIsEditing(false);
                      }}
                      className="bg-[#0A0A0A] border border-[#C5A059]/30 rounded px-2 py-1 text-xs text-white outline-none w-full"
                    />
                    <button onClick={handleUpdate} className="text-[#C5A059] hover:text-white shrink-0">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="text-white/20 hover:text-white shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
                    <Edit2 size={12} className="text-white/20" />
                  </div>
                )}
                <p className="text-[10px] text-white/30 truncate mt-0.5">No: {user.schoolNumber}</p>
              </div>
            </div>

            <div className="p-2">
              <button
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-white/60 hover:bg-white/5 hover:text-white`}
                onClick={() => setIsEditing(true)}
              >
                <div className="flex items-center gap-3">
                  <User size={14} className="text-[#C5A059]" /> 
                  Kullanıcı Adı Değiştir
                </div>
              </button>
              
              <div className="h-[1px] bg-white/5 my-1 mx-2" />
              
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#C5A059] hover:bg-[#C5A059]/10 transition-all font-bold"
              >
                <Users size={14} /> Profili Değiştir
              </button>

              {!user.isAdmin && (
                <button
                  onClick={() => {
                    if (confirm("Profilinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
                      onDeleteProfile();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500/30 hover:bg-red-500/10 hover:text-red-500 transition-all mt-1"
                >
                  <Trash2 size={14} /> Profili Sil
                </button>
              )}
            </div>
            
            <div className="bg-[#0D0D0D] p-3 text-center">
              <span className="text-[8px] text-white/20 font-bold uppercase tracking-[0.3em]">Librium Arşiv</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
