import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, BookOpen, Clock, X, Search, ChevronRight, User } from "lucide-react";
import { INITIAL_BOOKS } from "../constants";
import { Book } from "../types";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StudentProfile {
  schoolNumber: string;
  name: string;
  history: string[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedProfiles = localStorage.getItem("librium_profiles");
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        const studentList: StudentProfile[] = Object.keys(profiles).map(schoolNumber => {
          const historyKey = `reading_history_${schoolNumber}`;
          const savedHistory = localStorage.getItem(historyKey);
          return {
            schoolNumber,
            name: profiles[schoolNumber],
            history: savedHistory ? JSON.parse(savedHistory) : []
          };
        });
        setStudents(studentList.filter(s => !s.schoolNumber.startsWith("ADMIN_")));
      }
    }
  }, [isOpen]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.schoolNumber.includes(searchTerm)
  );

  const getBookTitle = (id: string) => {
    const customBooksRaw = localStorage.getItem("librium_added_books");
    const customBooks: Book[] = customBooksRaw ? JSON.parse(customBooksRaw) : [];
    const all = [...INITIAL_BOOKS, ...customBooks];
    return all.find(b => b.id === id)?.title || "Bilinmeyen Kitap";
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
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl h-[80vh] bg-[#111] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                  <Users className="text-[#C5A059]" /> Öğrenci Yönetimi
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-bold">Tüm Kayıtlı Öğrenciler ve Okuma Geçmişleri</p>
              </div>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Student List */}
              <div className="w-1/3 border-r border-white/5 flex flex-col">
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input
                      type="text"
                      placeholder="ÖĞRENCİ ARA..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#161616] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                  {filteredStudents.map(student => (
                    <button
                      key={student.schoolNumber}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${selectedStudent?.schoolNumber === student.schoolNumber ? "bg-[#C5A059] border-[#C5A059] text-black" : "bg-[#161616] border-white/5 text-white/60 hover:border-white/20"}`}
                    >
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-tight">{student.name}</div>
                        <div className={`text-[9px] font-bold mt-0.5 ${selectedStudent?.schoolNumber === student.schoolNumber ? "text-black/60" : "text-white/20"}`}>NO: {student.schoolNumber}</div>
                      </div>
                      <ChevronRight size={16} className={selectedStudent?.schoolNumber === student.schoolNumber ? "text-black" : "text-white/10 group-hover:text-white/40"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Detail */}
              <div className="flex-1 bg-[#0D0D0D] p-8 overflow-y-auto">
                {selectedStudent ? (
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-6 mb-12">
                      <div className="w-20 h-20 rounded-3xl bg-[#161616] border border-white/10 flex items-center justify-center text-[#C5A059] text-3xl font-serif">
                        {selectedStudent.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-3xl font-serif text-white">{selectedStudent.name}</h3>
                        <p className="text-xs text-[#C5A059] font-bold uppercase tracking-widest mt-1">OKUL NO: {selectedStudent.schoolNumber}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-12">
                      <div className="bg-[#161616] border border-white/5 rounded-3xl p-6">
                        <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1">OKUNAN KİTAP</div>
                        <div className="text-3xl font-serif text-[#C5A059]">{selectedStudent.history.length}</div>
                      </div>
                      <div className="bg-[#161616] border border-white/5 rounded-3xl p-6">
                        <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1">HESAP DURUMU</div>
                        <div className="text-sm font-bold text-green-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                          <User size={14} /> AKTİF ÖĞRENCİ
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                      <Clock size={16} className="text-[#C5A059]" /> Okuma Geçmişi
                    </h4>
                    
                    {selectedStudent.history.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {selectedStudent.history.map(bookId => (
                          <div key={bookId} className="bg-[#161616] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{getBookTitle(bookId)}</span>
                            <BookOpen size={14} className="text-[#C5A059]/40" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl text-white/20 text-[10px] font-bold uppercase tracking-widest">
                        Henüz kitap okunmamış
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/10 italic">
                    <Users size={64} className="mb-4 opacity-5" />
                    <p>Detayları görmek için bir öğrenci seçin</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
