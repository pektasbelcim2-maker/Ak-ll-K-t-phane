import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, Github, Chrome, ArrowRight, Sparkles, Hash, User as UserIcon, ShieldCheck } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (data: { 
    schoolNumber: string; 
    password: string; 
    name?: string; 
    isRegistering: boolean; 
    isAdmin?: boolean; 
    adminCode?: string;
  }) => string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [schoolNumber, setSchoolNumber] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loginError = onLogin({ 
      schoolNumber: isAdminMode ? `ADMIN_${name.replace(/\s/g, '')}` : schoolNumber.trim(), 
      password: password.trim(), 
      name: (isRegistering || isAdminMode) ? name.trim() : undefined,
      isRegistering,
      isAdmin: isAdminMode,
      adminCode: isAdminMode ? adminCode.trim() : undefined
    });

    if (loginError) {
      setError(loginError);
    } else {
      setError(null);
      onClose();
      setSchoolNumber("");
      setName("");
      setPassword("");
      setAdminCode("");
      setIsAdminMode(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(197,160,89,0.1)]"
          >
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C5A059]/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-8 md:p-10 relative z-10">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <div className="text-[#C5A059] font-serif text-3xl tracking-tighter mb-2">Librium.</div>
                <h2 className="text-xl font-medium text-white tracking-tight">
                  {isAdminMode ? "Yöneticiler İçin Arşiv Paneli" : (isRegistering ? "Yeni Bir Dünya Kur" : "Kaldığın Yerden Devam Et")}
                </h2>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-2 font-bold flex items-center gap-2">
                  {isAdminMode ? <ShieldCheck size={14} className="text-[#C5A059]" /> : <Sparkles size={14} className="text-[#C5A059]" />} 
                  {isAdminMode ? "Sistem Denetimi" : (isRegistering ? "Kütüphanene Katıl" : "Arşivine Eriş")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {(isRegistering || isAdminMode) && (
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      type="text"
                      placeholder="İSİM SOYİSİM"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#161616] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                )}
                
                {!isAdminMode && (
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      type="text"
                      placeholder="OKUL NUMARASI"
                      required
                      value={schoolNumber}
                      onChange={(e) => setSchoolNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#161616] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                )}

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input
                    type="password"
                    placeholder="ŞİFRE"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-all placeholder:text-white/10"
                  />
                </div>

                {isAdminMode && (
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]/40" size={16} />
                    <input
                      type="password"
                      placeholder="YÖNETİCİ ÖZEL KODU"
                      required
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="w-full bg-[#161616] border border-[#C5A059]/30 rounded-xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059] outline-none transition-all placeholder:text-[#C5A059]/20 text-[#C5A059]"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest px-2">{error}</p>
                )}

                {!isRegistering && !isAdminMode && (
                  <button type="button" className="text-[9px] uppercase tracking-widest font-bold text-white/20 hover:text-white transition-colors text-right px-2">
                    Şifremi Unuttum?
                  </button>
                )}

                <button
                  type="submit"
                  className="bg-[#C5A059] text-black py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D5B069] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isAdminMode ? "YÖNETİCİ GİRİŞİ YAP" : (isRegistering ? "KAYIT OL" : "GİRİŞ YAP")} <ArrowRight size={14} />
                </button>

                {!isRegistering && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMode(!isAdminMode);
                      setError(null);
                    }}
                    className={`w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border shadow-lg ${isAdminMode ? "bg-white/5 text-white/40 border-white/10 hover:text-white" : "bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/10 hover:bg-[#C5A059] hover:text-black"}`}
                  >
                    <ShieldCheck size={14} /> {isAdminMode ? "ÖĞRENCİ PORTALINA DÖN" : "YÖNETİCİ PORTALI"}
                  </button>
                )}
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-bold">
                  <span className="bg-[#111] px-4 text-white/20">Veya Bunlarla Bağlan</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 py-3 bg-[#161616] border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/5 transition-all">
                  <Chrome size={14} /> Google
                </button>
                <button className="flex items-center justify-center gap-3 py-3 bg-[#161616] border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/5 transition-all">
                  <Github size={14} /> Github
                </button>
              </div>

              <div className="mt-10 text-center">
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-[#C5A059] transition-all"
                >
                  {isRegistering ? "Zaten Üye misin? Giriş Yap" : "Hesabın Yok mu? Üye Ol"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
