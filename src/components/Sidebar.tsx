"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, Sparkles, Plus, Trash2, Upload, Tag, Wand2, Download, Check, FolderPlus } from "lucide-react";
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, loadCategories, type CategoryMeta, type Product } from "@/lib/products";

export interface UserProduct {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price?: string;
  addedAt: number;
  isDefault?: boolean;
}

interface SidebarProps {
  onSelectProduct: (product: UserProduct) => void;
  onMultiSelect: (products: UserProduct[]) => void;
  onStylePick: (products: UserProduct[]) => void;
  selectedProducts: UserProduct[];
  isLoading: boolean;
  generatedImage: string | null;
}

const WARDROBE_KEY = "ainek_wardrobe";
const CATEGORIES_KEY = "ainek_categories";

function loadWardrobe(): UserProduct[] {
  try { return JSON.parse(localStorage.getItem(WARDROBE_KEY) || "[]"); }
  catch { return []; }
}
function saveWardrobe(items: UserProduct[]) {
  try { localStorage.setItem(WARDROBE_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

export default function Sidebar({ onSelectProduct, onMultiSelect, onStylePick, selectedProducts, isLoading, generatedImage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryMeta[]>(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState("hat");
  const [wardrobe, setWardrobe] = useState<UserProduct[]>([]);
  const [multiMode, setMultiMode] = useState(false);
  const [multiSelected, setMultiSelected] = useState<UserProduct[]>([]);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("hat");
  const [newPrice, setNewPrice] = useState("");
  const [newImageBase64, setNewImageBase64] = useState<string | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasteHint, setPasteHint] = useState(false);

  // New category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("👔");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    const userWardrobe = loadWardrobe();
    const defaultAsUser: UserProduct[] = DEFAULT_PRODUCTS.map(p => ({
      id: p.id, name: p.name, category: p.category,
      imageUrl: p.imageUrl, addedAt: 0, isDefault: true,
    }));
    // Merge: user items first, then defaults not already overridden
    const userIds = new Set(userWardrobe.map(p => p.id));
    const merged = [...userWardrobe, ...defaultAsUser.filter(p => !userIds.has(p.id))];
    setWardrobe(merged);

    // Load custom categories
    try {
      const custom = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || "[]");
      setCategories([...DEFAULT_CATEGORIES, ...custom]);
    } catch { setCategories(DEFAULT_CATEGORIES); }
  }, []);

  // Paste image support (desktop)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!showAddModal) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFileChange(file);
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [showAddModal]);

  const filteredItems = wardrobe.filter(p => p.category === activeCategory);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const r = e.target?.result as string;
      setNewImageBase64(r); setNewImagePreview(r);
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = () => {
    if (!newName.trim() || !newImageBase64) return;
    const item: UserProduct = {
      id: `item_${Date.now()}`, name: newName.trim(), category: newCategory,
      imageUrl: newImageBase64, price: newPrice.trim() || undefined, addedAt: Date.now(),
    };
    const userItems = wardrobe.filter(p => !p.isDefault);
    const updated = [item, ...userItems];
    saveWardrobe(updated);
    setWardrobe([item, ...wardrobe]);
    resetAddModal();
    setActiveCategory(item.category);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = wardrobe.filter(p => p.id !== id);
    setWardrobe(updated);
    saveWardrobe(updated.filter(p => !p.isDefault));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const cat: CategoryMeta = {
      id: `cat_${Date.now()}`, label: newCatName, labelRu: newCatName,
      icon: newCatIcon, isCustom: true,
    };
    const newCats = [...categories, cat];
    setCategories(newCats);
    const custom = newCats.filter(c => c.isCustom);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(custom));
    setNewCatName(""); setNewCatIcon("👔"); setShowCatModal(false);
    setActiveCategory(cat.id);
  };

  // Multi-select toggle
  const toggleMultiSelect = (product: UserProduct) => {
    setMultiSelected(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
    });
  };

  const handleItemClick = (product: UserProduct) => {
    if (isLoading) return;
    if (multiMode) {
      toggleMultiSelect(product);
    } else {
      onSelectProduct(product);
      setIsOpen(false);
    }
  };

  const handleMultiTryOn = () => {
    if (multiSelected.length === 0) return;
    onMultiSelect(multiSelected);
    setMultiSelected([]);
    setMultiMode(false);
    setIsOpen(false);
  };

  const handleStylePick = () => {
    onStylePick(wardrobe);
    setIsOpen(false);
  };

  // Download generated image
  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = `ainek_tryon_${Date.now()}.jpg`;
    a.click();
  };

  const resetAddModal = () => {
    setNewName(""); setNewCategory("hat"); setNewPrice("");
    setNewImageBase64(null); setNewImagePreview(null); setShowAddModal(false);
  };

  const EMOJI_OPTIONS = ["👔","👗","👖","👟","🧢","🕶️","🧥","👜","⌚","🥋","💍","🎽"];

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-white font-semibold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
            Гардероб
          </span>
          <span className="text-white/30 text-xs">({wardrobe.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          {generatedImage && (
            <button onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs"
              style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <Download size={11} /> Скачать
            </button>
          )}
          <button onClick={() => { setMultiMode(!multiMode); setMultiSelected([]); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs"
            style={{
              background: multiMode ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)",
              border: multiMode ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
            }}>
            {multiMode ? <><Check size={11} /> Мульти</> : "Мульти"}
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(59,130,246,0.8))" }}>
            <Plus size={11} /> Добавить
          </button>
        </div>
      </div>

      {/* AI Style Picker */}
      <button onClick={handleStylePick}
        className="mx-4 mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-medium transition-all flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))",
          border: "1px solid rgba(139,92,246,0.4)",
        }}>
        <Wand2 size={14} className="text-violet-300" />
        ✨ AI подберёт образ
      </button>

      {/* Categories */}
      <div className="flex px-3 pt-3 gap-1 flex-wrap flex-shrink-0">
        {categories.map(cat => {
          const count = wardrobe.filter(p => p.category === cat.id).length;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat.id
                  ? "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(59,130,246,0.8))"
                  : "rgba(255,255,255,0.05)",
                color: activeCategory === cat.id ? "#fff" : "rgba(255,255,255,0.4)",
                border: activeCategory === cat.id ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.06)",
              }}>
              {cat.icon} {cat.labelRu}
              {count > 0 && <span className="ml-0.5 px-1 rounded-full text-[9px]"
                style={{ background: "rgba(255,255,255,0.15)" }}>{count}</span>}
            </button>
          );
        })}
        {/* Add category button */}
        <button onClick={() => setShowCatModal(true)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.3)" }}>
          <FolderPlus size={11} /> Новая
        </button>
      </div>

      {/* Multi-select bar */}
      {multiMode && (
        <div className="mx-3 mt-2 flex items-center justify-between px-3 py-2 rounded-xl flex-shrink-0"
          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <span className="text-violet-300 text-xs">
            {multiSelected.length === 0 ? "Выберите одежду" : `Выбрано: ${multiSelected.length}`}
          </span>
          {multiSelected.length > 0 && (
            <button onClick={handleMultiTryOn}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
              <Sparkles size={11} /> Примерить всё
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px dashed rgba(139,92,246,0.3)" }}>
              <Upload size={18} className="text-violet-400/60" />
            </div>
            <p className="text-white/40 text-xs">Нет вещей</p>
            <button onClick={() => setShowAddModal(true)} className="text-violet-400 text-xs underline">
              Добавить первую
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.map(product => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              const isMultiPicked = multiSelected.some(p => p.id === product.id);
              return (
                <button key={product.id} onClick={() => handleItemClick(product)} disabled={isLoading}
                  className="relative group rounded-xl overflow-hidden text-left transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: isMultiPicked ? "2px solid #8b5cf6"
                      : isSelected ? "1.5px solid rgba(139,92,246,0.8)"
                      : "1.5px solid rgba(255,255,255,0.06)",
                    boxShadow: isMultiPicked ? "0 0 16px rgba(139,92,246,0.5)"
                      : isSelected ? "0 0 12px rgba(139,92,246,0.3)" : "none",
                  }}>
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image src={product.imageUrl} alt={product.name} fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="160px" unoptimized />
                    {(isSelected || isMultiPicked) && (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "rgba(139,92,246,0.25)" }}>
                        <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      </div>
                    )}
                    {!product.isDefault && (
                      <div role="button" onClick={(e) => handleDelete(product.id, e)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full items-center justify-center hidden group-hover:flex cursor-pointer"
                        style={{ background: "rgba(239,68,68,0.85)" }}>
                        <Trash2 size={10} className="text-white" />
                      </div>
                    )}
                    {product.isDefault && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] text-white/70"
                        style={{ background: "rgba(0,0,0,0.5)" }}>AINEK</div>
                    )}
                  </div>
                  <div className="p-1.5">
                    <p className="text-white/80 text-[10px] font-medium leading-tight line-clamp-1">{product.name}</p>
                    {product.price && <p className="text-violet-400 text-[9px] mt-0.5">{product.price}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ══ DESKTOP ══ */}
      <div className="hidden md:block">
        <button onClick={() => setIsOpen(!isOpen)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-3 py-6 rounded-l-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(59,130,246,0.9))",
            backdropFilter: "blur(12px)",
            boxShadow: isOpen ? "none" : "-4px 0 24px rgba(139,92,246,0.5)",
          }}>
          <span className="text-white text-xs font-medium tracking-widest uppercase"
            style={{ writingMode: "vertical-rl" }}>Гардероб</span>
          <span className="text-white text-xs">{isOpen ? "›" : "‹"}</span>
        </button>
        <aside className="fixed right-0 top-0 h-full z-40 flex flex-col transition-transform duration-500 ease-out"
          style={{
            width: "360px",
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            background: "rgba(8,8,18,0.97)", backdropFilter: "blur(24px)",
            borderLeft: "1px solid rgba(139,92,246,0.2)",
          }}>
          {panelContent}
        </aside>
        {isOpen && <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setIsOpen(false)}
          style={{ background: "rgba(0,0,0,0.4)" }} />}
      </div>

      {/* ══ MOBILE bottom sheet ══ */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center px-10 py-2.5 rounded-t-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.95), rgba(59,130,246,0.95))",
            backdropFilter: "blur(12px)",
            boxShadow: "0 -4px 20px rgba(139,92,246,0.4)",
          }}>
          <div className="w-8 h-1 rounded-full bg-white/30 mb-1" />
          <span className="text-white text-xs font-medium tracking-widest uppercase">
            {isOpen ? "Закрыть" : "👗 Гардероб"}
          </span>
        </button>
        <aside className="fixed bottom-0 left-0 right-0 z-40 flex flex-col transition-transform duration-500 ease-out"
          style={{
            height: "75vh",
            transform: isOpen ? "translateY(0)" : "translateY(100%)",
            background: "rgba(8,8,18,0.98)", backdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "20px 20px 0 0",
          }}>
          <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>
          {panelContent}
        </aside>
        {isOpen && <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}
          style={{ background: "rgba(0,0,0,0.5)" }} />}
      </div>

      {/* ══ ADD MODAL ══ */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
          <div className="w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-y-auto"
            style={{ background: "rgba(12,12,24,0.99)", border: "1px solid rgba(139,92,246,0.3)", maxHeight: "92vh" }}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="text-white font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Добавить вещь
              </h3>
              <button onClick={resetAddModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Upload area */}
              <div
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center"
                style={{
                  aspectRatio: "4/3",
                  background: newImagePreview ? "transparent" : "rgba(139,92,246,0.05)",
                  border: dragOver ? "2px solid #8b5cf6" : "2px dashed rgba(139,92,246,0.3)",
                }}>
                {newImagePreview
                  ? <Image src={newImagePreview} alt="Preview" fill className="object-cover" sizes="350px" unoptimized />
                  : <div className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(139,92,246,0.15)" }}>
                        <Upload size={24} className="text-violet-400" />
                      </div>
                      <p className="text-white/60 text-sm">Нажмите, перетащите или вставьте (Ctrl+V)</p>
                      <p className="text-white/25 text-xs">JPG, PNG, WEBP</p>
                    </div>
                }
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
              </div>

              {/* Camera input for mobile back camera */}
              <div className="flex gap-2">
                <button onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 py-2.5 rounded-xl text-white/60 text-xs flex items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  📷 Камера (задняя)
                </button>
                <button onClick={() => { setPasteHint(true); setTimeout(() => setPasteHint(false), 2000); }}
                  className="flex-1 py-2.5 rounded-xl text-white/60 text-xs flex items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {pasteHint ? "✅ Ctrl+V чтобы вставить" : "📋 Вставить из буфера"}
                </button>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
              </div>

              {/* Name */}
              <div>
                <label className="text-white/50 text-xs tracking-wider uppercase mb-2 flex items-center gap-1">
                  <Tag size={10} /> Название
                </label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Nike Jordan белый"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>

              {/* Category */}
              <div>
                <label className="text-white/50 text-xs tracking-wider uppercase mb-2 block">Категория</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setNewCategory(cat.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: newCategory === cat.id
                          ? "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(59,130,246,0.8))"
                          : "rgba(255,255,255,0.05)",
                        color: newCategory === cat.id ? "#fff" : "rgba(255,255,255,0.4)",
                        border: newCategory === cat.id ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.06)",
                      }}>
                      {cat.icon} {cat.labelRu}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-white/50 text-xs tracking-wider uppercase mb-2 block">
                  Цена <span className="text-white/20 normal-case">(необязательно)</span>
                </label>
                <input type="text" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  placeholder="15 000 сом"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>

              <button onClick={handleAddItem} disabled={!newName.trim() || !newImageBase64}
                className="w-full py-4 rounded-xl text-white font-semibold text-sm"
                style={{
                  background: newName.trim() && newImageBase64
                    ? "linear-gradient(135deg, #8b5cf6, #3b82f6)" : "rgba(255,255,255,0.05)",
                  color: newName.trim() && newImageBase64 ? "#fff" : "rgba(255,255,255,0.2)",
                  boxShadow: newName.trim() && newImageBase64 ? "0 4px 20px rgba(139,92,246,0.4)" : "none",
                }}>
                Добавить в гардероб
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ NEW CATEGORY MODAL ══ */}
      {showCatModal && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
          <div className="w-full md:max-w-xs rounded-t-3xl md:rounded-3xl overflow-hidden"
            style={{ background: "rgba(12,12,24,0.99)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="text-white font-semibold text-sm">Новая категория</h3>
              <button onClick={() => setShowCatModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/40"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                placeholder="Название категории"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <div>
                <p className="text-white/50 text-xs mb-2">Иконка</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button key={emoji} onClick={() => setNewCatIcon(emoji)}
                      className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                      style={{
                        background: newCatIcon === emoji ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.05)",
                        border: newCatIcon === emoji ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
                      }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddCategory} disabled={!newCatName.trim()}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm"
                style={{
                  background: newCatName.trim() ? "linear-gradient(135deg, #8b5cf6, #3b82f6)" : "rgba(255,255,255,0.05)",
                  color: newCatName.trim() ? "#fff" : "rgba(255,255,255,0.2)",
                }}>
                Создать категорию
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}