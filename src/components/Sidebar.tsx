"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Sparkles, Plus, Trash2, Upload, Tag } from "lucide-react";
import { CATEGORIES } from "@/lib/products";

interface UserProduct {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price?: string;
  addedAt: number;
}

interface SidebarProps {
  onSelectProduct: (product: UserProduct) => void;
  selectedProduct: UserProduct | null;
  isLoading: boolean;
}

const STORAGE_KEY = "ainek_wardrobe";

function loadWardrobe(): UserProduct[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveWardrobe(items: UserProduct[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* ignore */ }
}

export default function Sidebar({ onSelectProduct, selectedProduct, isLoading }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("trench");
  const [wardrobe, setWardrobe] = useState<UserProduct[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("trench");
  const [newPrice, setNewPrice] = useState("");
  const [newImageBase64, setNewImageBase64] = useState<string | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setWardrobe(loadWardrobe()); }, []);

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
    const updated = [item, ...wardrobe];
    setWardrobe(updated); saveWardrobe(updated);
    setNewName(""); setNewCategory("trench"); setNewPrice("");
    setNewImageBase64(null); setNewImagePreview(null); setShowAddModal(false);
    setActiveCategory(item.category);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = wardrobe.filter(p => p.id !== id);
    setWardrobe(updated); saveWardrobe(updated);
  };

  const handleSelect = (product: UserProduct) => {
    if (isLoading) return;
    onSelectProduct(product);
    setIsOpen(false); // close on mobile after select
  };

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-violet-400" />
          <span className="text-white font-semibold text-sm tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}>Мой гардероб</span>
          <span className="text-white/30 text-xs">({wardrobe.length})</span>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-medium"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(59,130,246,0.8))" }}>
          <Plus size={12} /> Добавить
        </button>
      </div>

      {/* Categories */}
      <div className="flex px-4 pt-3 gap-1 flex-wrap flex-shrink-0">
        {CATEGORIES.map(cat => {
          const count = wardrobe.filter(p => p.category === cat.id).length;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat.id
                  ? "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(59,130,246,0.8))"
                  : "rgba(255,255,255,0.05)",
                color: activeCategory === cat.id ? "#fff" : "rgba(255,255,255,0.4)",
                border: activeCategory === cat.id
                  ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.06)",
              }}>
              {cat.icon} {cat.labelRu}
              {count > 0 && <span className="ml-0.5 px-1 rounded-full text-[9px]"
                style={{ background: "rgba(255,255,255,0.15)" }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px dashed rgba(139,92,246,0.3)" }}>
              <Upload size={20} className="text-violet-400/60" />
            </div>
            <p className="text-white/40 text-xs text-center">Нет вещей</p>
            <button onClick={() => setShowAddModal(true)}
              className="text-violet-400 text-xs underline underline-offset-2">
              Добавить первую
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
            {filteredItems.map(product => {
              const isSelected = selectedProduct?.id === product.id;
              return (
                <button key={product.id} onClick={() => handleSelect(product)} disabled={isLoading}
                  className="relative group rounded-xl overflow-hidden text-left transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: isSelected ? "1.5px solid rgba(139,92,246,0.8)" : "1.5px solid rgba(255,255,255,0.06)",
                    boxShadow: isSelected ? "0 0 16px rgba(139,92,246,0.3)" : "none",
                  }}>
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image src={product.imageUrl} alt={product.name} fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="180px" unoptimized />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "rgba(139,92,246,0.25)" }}>
                        <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center">
                          <Sparkles size={12} className="text-white" />
                        </div>
                      </div>
                    )}
                    {/* Delete */}
                    <div
                      role="button"
                      onClick={(e) => handleDelete(product.id, e)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full items-center justify-center hidden group-hover:flex transition-opacity cursor-pointer"
                      style={{ background: "rgba(239,68,68,0.85)" }}>
                      <Trash2 size={10} className="text-white" />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-white/80 text-[11px] font-medium leading-tight line-clamp-1">{product.name}</p>
                    {product.price && <p className="text-violet-400 text-[10px] mt-0.5">{product.price}</p>}
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
      {/* ══ DESKTOP: right slide-out ══ */}
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

      {/* ══ MOBILE: bottom sheet ══ */}
      <div className="md:hidden">
        {/* Pull tab at bottom */}
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

        {/* Sheet */}
        <aside className="fixed bottom-0 left-0 right-0 z-40 flex flex-col transition-transform duration-500 ease-out"
          style={{
            height: "72vh",
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
            style={{
              background: "rgba(12,12,24,0.99)",
              border: "1px solid rgba(139,92,246,0.3)",
              maxHeight: "92vh",
            }}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="text-white font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Добавить вещь
              </h3>
              <button onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Upload */}
              <div
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f); }}
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
                      <p className="text-white/60 text-sm">Нажмите или перетащите фото</p>
                      <p className="text-white/25 text-xs">JPG, PNG, WEBP</p>
                    </div>
                }
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
              </div>

              {/* Name */}
              <div>
                <label className="text-white/50 text-xs tracking-wider uppercase mb-2 flex items-center gap-1">
                  <Tag size={10} /> Название
                </label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Например: Nike Jordan белый"
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>

              {/* Category */}
              <div>
                <label className="text-white/50 text-xs tracking-wider uppercase mb-2 block">Категория</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setNewCategory(cat.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all"
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
                  Цена <span className="text-white/20 normal-case ml-1">(необязательно)</span>
                </label>
                <input type="text" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  placeholder="15 000 сом"
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>

              {/* Submit */}
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
    </>
  );
}