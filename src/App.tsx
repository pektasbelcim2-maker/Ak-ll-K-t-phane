/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Library, Sparkles, BookOpen, Clock, Heart, Search, Star, X, ArrowRight, ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import { INITIAL_BOOKS } from "./constants";
import { Book } from "./types";
import { BookCard } from "./components/BookCard";
import { GenreSelector } from "./components/GenreSelector";
import { BookCover } from "./components/BookCover";
import { LoginModal } from "./components/LoginModal";
import { UserMenu } from "./components/UserMenu";
import { AddBookModal } from "./components/AddBookModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { getPersonalizedRecommendations } from "./services/geminiService";

export default function App() {
  const [books] = useState<Book[]>(INITIAL_BOOKS);
  const [selectedGenre, setSelectedGenre] = useState("Tümü");
  const [readingHistory, setReadingHistory] = useState<string[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"explore" | "library" | "history">("explore");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  // Auth State
  const [user, setUser] = useState<{ name: string; schoolNumber: string; isAdmin?: boolean } | null>(() => {
    const savedUser = localStorage.getItem("librium_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [addedBooks, setAddedBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem("librium_added_books");
    return saved ? JSON.parse(saved) : [];
  });

  const allBooks = useMemo(() => [...INITIAL_BOOKS, ...addedBooks], [addedBooks]);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // New: Handle User Profiles Persistence
  const getUserProfile = (schoolNumber: string) => {
    const savedProfiles = localStorage.getItem("librium_profiles");
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      return profiles[schoolNumber] || null;
    }
    return null;
  };

  const saveUserProfile = (schoolNumber: string, name: string) => {
    const savedProfiles = localStorage.getItem("librium_profiles");
    const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
    profiles[schoolNumber] = name;
    localStorage.setItem("librium_profiles", JSON.stringify(profiles));
  };

  const handleLogin = (data: { 
    schoolNumber: string; 
    password: string; 
    name?: string; 
    isRegistering: boolean;
    isAdmin?: boolean;
    adminCode?: string;
  }) => {
    const savedProfiles = localStorage.getItem("librium_profiles");
    const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
    
    const savedAccounts = localStorage.getItem("librium_accounts");
    const accounts = savedAccounts ? JSON.parse(savedAccounts) : {};
    
    // Special Admin Handling
    if (data.isAdmin) {
      if (data.adminCode !== "haal2026") {
        return "Geçersiz yönetici kodu.";
      }
      // Admins don't strictly need to register, but we save their profile if they log in for the first time
      if (!profiles[data.schoolNumber]) {
        profiles[data.schoolNumber] = data.name || "Yönetici";
        localStorage.setItem("librium_profiles", JSON.stringify(profiles));
      }
      
      setUser({
        schoolNumber: data.schoolNumber,
        name: data.name || profiles[data.schoolNumber] || "Yönetici",
        isAdmin: true
      });
      return null;
    }

    if (data.isRegistering) {
      if (accounts[data.schoolNumber]) {
        return "Bu okul numarası zaten kayıtlı.";
      }
      accounts[data.schoolNumber] = data.password;
      profiles[data.schoolNumber] = data.name || data.schoolNumber;
      localStorage.setItem("librium_accounts", JSON.stringify(accounts));
      localStorage.setItem("librium_profiles", JSON.stringify(profiles));
    } else {
      if (!accounts[data.schoolNumber]) {
        return "Hesap bulunamadı.";
      }
      if (accounts[data.schoolNumber] !== data.password) {
        return "Hatalı şifre.";
      }
    }

    setUser({
      schoolNumber: data.schoolNumber,
      name: profiles[data.schoolNumber] || data.schoolNumber,
      isAdmin: false
    });
    return null;
  };

  const handleDeleteProfile = () => {
    if (!user) return;
    
    const schoolNumber = user.schoolNumber;
    
    // Remove from accounts
    const savedAccounts = localStorage.getItem("librium_accounts");
    if (savedAccounts) {
      const accounts = JSON.parse(savedAccounts);
      delete accounts[schoolNumber];
      localStorage.setItem("librium_accounts", JSON.stringify(accounts));
    }
    
    // Remove from profiles
    const savedProfiles = localStorage.getItem("librium_profiles");
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      delete profiles[schoolNumber];
      localStorage.setItem("librium_profiles", JSON.stringify(profiles));
    }
    
    // Remove reading history
    localStorage.removeItem(`reading_history_${schoolNumber}`);
    
    // Logout
    setUser(null);
    setShowUserMenu(false);
  };

  const handleAddBook = (bookData: Omit<Book, "id" | "rating">) => {
    const newBook: Book = {
      ...bookData,
      id: `custom_${Date.now()}`,
      rating: 5.0
    };
    const updated = [...addedBooks, newBook];
    setAddedBooks(updated);
    localStorage.setItem("librium_added_books", JSON.stringify(updated));
  };

  const handleUpdateName = (newName: string) => {
    if (user) {
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      saveUserProfile(user.schoolNumber, newName);
    }
  };

  // Persist user session
  useEffect(() => {
    if (user) {
      localStorage.setItem("librium_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("librium_user");
    }
  }, [user]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset pagination on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination on genre change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, activeView]);

  // Load history and ratings from local storage when user changes
  useEffect(() => {
    if (!user) {
      setReadingHistory([]);
      setUserRatings({});
      return;
    }

    const historyKey = `reading_history_${user.schoolNumber}`;
    const ratingsKey = `user_ratings_${user.schoolNumber}`;
    
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      try {
        setReadingHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
        setReadingHistory([]);
      }
    } else {
      setReadingHistory([]);
    }

    const savedRatings = localStorage.getItem(ratingsKey);
    if (savedRatings) {
      try {
        setUserRatings(JSON.parse(savedRatings));
      } catch (e) {
        console.error("Failed to parse ratings", e);
        setUserRatings({});
      }
    } else {
      setUserRatings({});
    }
  }, [user]);

  // Save history to local storage whenever it changes (only for logged in users)
  useEffect(() => {
    if (user) {
      const storageKey = `reading_history_${user.schoolNumber}`;
      localStorage.setItem(storageKey, JSON.stringify(readingHistory));
    }
  }, [readingHistory, user]);

  // Save ratings to local storage whenever they change
  useEffect(() => {
    if (user) {
      const storageKey = `user_ratings_${user.schoolNumber}`;
      localStorage.setItem(storageKey, JSON.stringify(userRatings));
    }
  }, [userRatings, user]);

  const toggleRead = useCallback((id: string) => {
    setReadingHistory((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleRateBook = useCallback((bookId: string, rating: number) => {
    if (!user) return;
    setUserRatings((prev) => ({
      ...prev,
      [bookId]: rating
    }));
  }, [user]);

  const filteredBooks = useMemo(() => {
    let baseBooks = allBooks;
    if (activeView === "history") {
      baseBooks = allBooks.filter((b) => readingHistory.includes(b.id));
    }
    
    return baseBooks.filter((book) => {
      const matchesGenre = selectedGenre === "Tümü" || book.genre === selectedGenre;
      const matchesSearch =
        book.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [allBooks, selectedGenre, debouncedSearchQuery, activeView, readingHistory]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchAiRecommendations = async () => {
    const readBooks = books.filter((b) => readingHistory.includes(b.id));
    
    setIsAiLoading(true);
    try {
      // Pass the current selected genre to help AI focus if possible
      const recIds = await getPersonalizedRecommendations(readBooks, books, selectedGenre);
      
      // Shuffle or rotate to make sure we don't always show the same first recommendation
      const recBooks = books.filter((b) => recIds.includes(b.id));
      
      // If we have existing recommendations, we might want to offset or shuffle
      const shuffledRecs = [...recBooks].sort(() => Math.random() - 0.5);
      
      setRecommendations(shuffledRecs);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0D8D0] font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111111] border-right border-white/5 p-8 flex flex-col gap-10 hidden lg:flex">
        <div className="font-serif text-2xl tracking-tighter text-[#C5A059]">Librium.</div>
        
        <nav className="flex flex-col gap-6">
          <button 
            onClick={() => setActiveView("explore")}
            className={`flex items-center gap-3 text-xs uppercase tracking-[0.2em] transition-colors ${activeView === "explore" ? "text-[#C5A059]" : "text-white/50 hover:text-white"}`}
          >
            <Library size={16} /> Keşfet
          </button>
          <button 
            onClick={() => setActiveView("library")}
            className={`flex items-center gap-3 text-xs uppercase tracking-[0.2em] transition-colors ${activeView === "library" ? "text-[#C5A059]" : "text-white/50 hover:text-white"}`}
          >
            <BookOpen size={16} /> Kütüphanem
          </button>
          <button 
            onClick={() => setActiveView("history")}
            className={`flex items-center gap-3 text-xs uppercase tracking-[0.2em] transition-colors ${activeView === "history" ? "text-[#C5A059]" : "text-white/50 hover:text-white"}`}
          >
            <Clock size={16} /> Geçmiş
          </button>

          {user?.isAdmin && (
            <>
              <button 
                onClick={() => setShowAddBookModal(true)}
                className="mt-6 flex items-center gap-3 px-4 py-4 rounded-xl bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 hover:bg-[#C5A059] hover:text-black transition-all group"
              >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Kitap Ekle</span>
              </button>
              <button 
                onClick={() => setShowAdminDashboard(true)}
                className="mt-2 flex items-center gap-3 px-4 py-4 rounded-xl bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white transition-all group"
              >
                <Users size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Öğrenci Yönetimi</span>
              </button>
            </>
          )}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Koleksiyon</span>
          <span className="text-xl font-serif text-[#C5A059]">{readingHistory.length}</span>
          <span className="text-[10px] uppercase text-white/30 tracking-tight">Okunan Kitap</span>
        </div>
      </aside>

      <main className="flex-1 min-h-screen p-8 lg:p-12 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-serif font-medium text-white tracking-tight capitalize">
              {activeView === "explore" ? "Keşfet" : activeView === "library" ? "Kütüphane Arşivi" : "Okuma Geçmişi"}
            </h1>
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold flex items-center gap-2">
              <Clock size={14} className="text-[#C5A059]" /> {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} • {user?.isAdmin ? "Yönetici" : (user ? "Öğrenci" : "Ziyaretçi")}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type="text"
                placeholder="ARA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161616] border border-white/5 rounded-md py-2 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#C5A059]/40 outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-4 border-l border-white/10 pl-6 cursor-pointer group relative" onClick={() => !user ? setShowLoginModal(true) : setShowUserMenu(!showUserMenu)}>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white tracking-wide group-hover:text-[#C5A059] transition-colors">
                  {user ? user.name : "Giriş Yap"}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  {user ? (user.isAdmin ? "Yönetici" : "Öğrenci") : "Ziyaretçi"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#333] border border-white/20 flex items-center justify-center text-[#C5A059] font-serif text-lg group-hover:border-[#C5A059]/50 transition-all overflow-hidden shadow-lg">
                {user ? user.name[0].toUpperCase() : <Library size={18} className="opacity-40" />}
              </div>
              
              {user && (
                <UserMenu 
                  isOpen={showUserMenu} 
                  onClose={() => setShowUserMenu(false)} 
                  user={user} 
                  onLogout={() => {
                    setUser(null);
                    setShowLoginModal(true);
                  }}
                  onUpdateName={handleUpdateName}
                  onDeleteProfile={handleDeleteProfile}
                />
              )}
            </div>
          </div>
        </header>

        <AddBookModal 
          isOpen={showAddBookModal} 
          onClose={() => setShowAddBookModal(false)} 
          onAdd={handleAddBook} 
        />

        {/* Hero / Recommendation - Only show in Explore */}
        <AnimatePresence mode="wait">
          {activeView === "explore" && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 bg-[#161616] border border-white/5 rounded-3xl p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
                
                <div className="relative z-10">
                  <div className="inline-block px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-full text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-6">
                    Senin İçin Seçtik
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {recommendations.length > 0 ? (
                      <motion.div
                        key="rec-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col md:flex-row gap-8 items-center"
                      >
                        <BookCard
                          book={recommendations[0]}
                          isRead={readingHistory.includes(recommendations[0].id)}
                          onToggleRead={toggleRead}
                          userRating={userRatings[recommendations[0].id]}
                        />
                        <div className="flex-1">
                          <h2 className="text-5xl font-serif text-white mb-4 leading-[1.1] tracking-tighter">
                            {recommendations[0].title}
                          </h2>
                          <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
                            {readingHistory.length > 0 
                              ? "Okuma geçmişindeki ilgi alanlarına dayanarak, bu başyapıtı keşfetmek isteyebilirsin."
                              : selectedGenre !== "Tümü" 
                                ? `${selectedGenre} kategorisinde senin için seçtiğimiz bu eseri mutlaka incelemelisin.`
                                : "Kütüphanemizdeki en değerli eserlerden birini senin için seçtik."}
                          </p>
                          <button
                            onClick={fetchAiRecommendations}
                            disabled={isAiLoading}
                            className="bg-[#C5A059] text-[#0A0A0A] font-bold uppercase tracking-widest text-[11px] px-8 py-3 rounded-md hover:bg-[#D5B069] transition-all flex items-center gap-3 disabled:opacity-50"
                          >
                            {isAiLoading ? <Clock size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            Daha Fazla Öner
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="py-10">
                        <h2 className="text-4xl font-serif text-white mb-4 tracking-tighter">
                          Yeni Dünyalar Keşfet
                        </h2>
                        <p className="text-white/50 text-sm mb-8 max-w-sm">
                          Okuma alışkanlıklarını analiz ederek sana en uygun eserleri seçmemize izin ver.
                        </p>
                        <button
                          onClick={fetchAiRecommendations}
                          disabled={isAiLoading}
                          className="bg-[#C5A059] text-[#0A0A0A] font-bold uppercase tracking-widest text-[11px] px-8 py-3 rounded-md hover:bg-[#D5B069] transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                          {isAiLoading ? <Clock size={16} className="animate-spin" /> : <Sparkles size={16} />}
                          Önerileri Başlat
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                <div className="p-6 bg-[#161616] rounded-3xl border border-white/5 flex-1">
                  <h3 className="font-serif text-xl border-b border-white/5 pb-4 mb-6 text-white tracking-tight">Kategoriler</h3>
                  <GenreSelector selected={selectedGenre} onSelect={setSelectedGenre} />
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Collection Grid */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-serif text-white tracking-tight">
              {activeView === "explore" ? "Öne Çıkanlar" : activeView === "library" ? "Tüm Arşiv" : "Okuduklarım"}
            </h2>
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{filteredBooks.length} ESER</span>
          </div>

          {filteredBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 book-grid">
                <AnimatePresence mode="popLayout">
                  {paginatedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      isRead={readingHistory.includes(book.id)}
                      onToggleRead={toggleRead}
                      onClick={() => setSelectedBook(book)}
                      userRating={userRatings[book.id]}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-16 mb-24">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-[#C5A059]/10 hover:text-[#C5A059] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Only show first, last, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[40px] h-[40px] rounded-lg font-bold text-xs transition-all ${
                            currentPage === page
                              ? "bg-[#C5A059] text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]"
                              : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="text-white/20 px-1">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-[#C5A059]/10 hover:text-[#C5A059] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <Search size={40} className="mx-auto mb-4 text-white/10" />
              <p className="text-sm uppercase tracking-widest font-bold text-white/30">Bulunamadı</p>
            </div>
          )}
        </section>
      </main>

      {/* Book Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#161616] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="aspect-[3/4] bg-[#222]">
                  {selectedBook.coverImage && selectedBook.coverImage !== "" && !selectedBook.coverImage.includes("placeholder") ? (
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <BookCover title={selectedBook.title} author={selectedBook.author} genre={selectedBook.genre} />
                  )}
                </div>
                <div className="p-8 md:p-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-[#C5A059] text-[#C5A059]" />
                      <span className="text-sm font-medium text-[#C5A059]">{selectedBook.rating}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest px-3 py-1 bg-[#C5A059]/10 rounded-full">
                      {selectedBook.genre}
                    </span>
                  </div>

                  <h2 className="text-3xl font-serif text-white mb-2 leading-tight tracking-tighter">
                    {selectedBook.title}
                  </h2>
                  <p className="text-base text-white/40 mb-6 font-medium italic">
                    {selectedBook.author}
                  </p>

                  <div className="flex-1 overflow-y-auto mb-8 pr-2 max-h-[300px]">
                    <p className="text-sm text-white/60 leading-relaxed mb-6">
                      {selectedBook.description}
                    </p>

                    {user ? (
                      readingHistory.includes(selectedBook.id) && (
                        <div className="border-t border-white/5 pt-6 animate-in fade-in slide-in-from-bottom-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-4">
                            KİTAP PUANIN
                          </p>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateBook(selectedBook.id, star)}
                                className="transition-transform active:scale-95 group"
                              >
                                <Star 
                                  size={24} 
                                  className={`transition-colors ${
                                    star <= (userRatings[selectedBook.id] || 0)
                                      ? "fill-[#C5A059] text-[#C5A059]"
                                      : "text-white/10 group-hover:text-white/30"
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm font-medium text-white/40">
                              {userRatings[selectedBook.id] ? `${userRatings[selectedBook.id]}.0 / 5.0` : "Puan Ver"}
                            </span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="border-t border-white/5 pt-6">
                        <p className="text-xs text-white/30 italic">
                          Puan vermek ve okuma geçmişinizi kaydetmek için lütfen giriş yapın.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRead(selectedBook.id);
                      }}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        readingHistory.includes(selectedBook.id)
                          ? "bg-white/5 text-white/40 hover:bg-white/10"
                          : "bg-[#C5A059] text-[#0A0A0A] hover:bg-[#D5B069]"
                      }`}
                    >
                      {readingHistory.includes(selectedBook.id) ? "OKUNDU" : "OKUDUM"}
                    </button>
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="py-3 bg-white/5 text-white/40 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#161616]/90 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-10 shadow-2xl z-50">
        <Library size={20} className={activeView === "explore" ? "text-[#C5A059]" : "text-white/40"} onClick={() => setActiveView("explore")} />
        <BookOpen size={20} className={activeView === "library" ? "text-[#C5A059]" : "text-white/40"} onClick={() => setActiveView("library")} />
        <Clock size={20} className={activeView === "history" ? "text-[#C5A059]" : "text-white/40"} onClick={() => setActiveView("history")} />
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLogin} 
      />

      <AdminDashboard 
        isOpen={showAdminDashboard} 
        onClose={() => setShowAdminDashboard(false)} 
      />
    </div>
  );
}
