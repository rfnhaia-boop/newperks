"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { 
  Clock, 
  User, 
  Phone, 
  ShoppingCart, 
  ArrowLeft,
  CheckCircle2,
  Plus,
  Minus,
  Search,
  Package,
  Trash2,
  Image as ImageIcon,
  Wallpaper,
  X
} from 'lucide-react';
import Link from 'next/link';

// === Tipos (Mock) ===
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  commissionRate: number;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Pomada Efeito Matte', price: 45.0, stock: 12, commissionRate: 0.1, imageUrl: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=300&q=80" },
  { id: '2', name: 'Óleo Hidratante Barba', price: 35.0, stock: 8, commissionRate: 0.15, imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80" },
  { id: '3', name: 'Shampoo Ice Fresh', price: 50.0, stock: 5, commissionRate: 0.1, imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=300&q=80" },
  { id: '4', name: 'Balm Pós Barba', price: 40.0, stock: 3, commissionRate: 0.15, imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=300&q=80" },
  { id: '5', name: 'Cerveja Artesanal', price: 15.0, stock: 20, commissionRate: 0.05, imageUrl: "https://images.unsplash.com/photo-1575037614876-c38db0200ca2?auto=format&fit=crop&w=300&q=80" },
  { id: '6', name: 'Refrigerante Lata', price: 8.0, stock: 15, commissionRate: 0, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80" },
];

const clientGallery = [
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80"
];

const backgroundOptions = [
  "/bg/street.png",   // Estilo urbano neon/graffiti
  "/bg/classic.png",  // Estilo vintage/clássico com madeira e couro
  "/bg/modern.png",   // Estilo moderno/minimalista high-tech
  "" // Sem fundo (escuro sólido)
];

// === Hook de Tela de Descanso (Idle Mode) ===
const useIdleTimer = (timeoutMs = 15000) => {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsIdle(true), timeoutMs);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('mousedown', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('scroll', resetIdle);

    resetIdle();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('mousedown', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('scroll', resetIdle);
      clearTimeout(timeoutId);
    };
  }, [timeoutMs]);

  return isIdle;
};

// Hook de Sequenciador do Modo Descanso
const useIdleSequence = (isIdle: boolean) => {
  const [phase, setPhase] = useState<'timer' | 'products' | 'photos'>('timer');

  useEffect(() => {
    if (!isIdle) {
      setPhase('timer');
      return;
    }

    let timeout: NodeJS.Timeout;
    
    const runSequence = (currentPhase: 'timer' | 'products' | 'photos') => {
      setPhase(currentPhase);
      
      if (currentPhase === 'timer') {
        timeout = setTimeout(() => runSequence('products'), 5000);
      } else if (currentPhase === 'products') {
        timeout = setTimeout(() => runSequence('photos'), 15000);
      } else if (currentPhase === 'photos') {
        timeout = setTimeout(() => runSequence('timer'), 15000);
      }
    };

    runSequence('timer');

    return () => clearTimeout(timeout);
  }, [isIdle]);

  return phase;
};

// === Componente Marquee (Letreiro/Esteira Infinita) ===
const InfiniteMarquee = ({ children, speed = 20, reverse = false, vertical = false, className = "" }: { children: React.ReactNode, speed?: number, reverse?: boolean, vertical?: boolean, className?: string }) => {
  if (vertical) {
    return (
      <div className={`overflow-hidden flex flex-col h-full w-full mask-image-vertical ${className}`}>
        <motion.div
          className="flex flex-col shrink-0 items-center gap-6 pb-6"
          animate={{ y: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: speed, repeat: Infinity }}
        >
          <div className="flex flex-col shrink-0 items-center gap-6">{children}</div>
          <div className="flex flex-col shrink-0 items-center gap-6">{children}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden whitespace-nowrap flex w-full mask-image-horizontal ${className}`}>
      <motion.div
        className="flex shrink-0 items-center"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: speed, repeat: Infinity }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center">{children}</div>
      </motion.div>
    </div>
  );
};

// === Componentes Base ===
const TiltGlassCard = ({ children, className = '', isIdle = false }: { children: React.ReactNode, className?: string, isIdle?: boolean }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isIdle) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -3;
    const rotateYValue = ((x - centerX) / centerX) * 3;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: isIdle ? 0 : rotateX, rotateY: isIdle ? 0 : rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.5 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className="relative group"
    >
      <div 
        className={`bg-[#111113]/80 border border-white/5 backdrop-blur-md rounded-[20px] p-5 md:p-6 transition-colors duration-1000 relative z-10 ${isIdle ? '' : 'animate-glow-pulse'} ${className}`}
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div style={{ transform: "translateZ(20px)", height: "100%", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

const SectionLabel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <h2 className={`font-semibold text-xs text-white/60 mb-4 flex items-center gap-2 ${className}`}>
    {children}
  </h2>
);

// === Partículas Flutuantes ===
const FloatingParticle = ({ x, y, text }: { x: number, y: number, text: string }) => (
  <motion.div
    initial={{ opacity: 1, y, x, scale: 0.5 }}
    animate={{ opacity: 0, y: y - 60, scale: 1.2 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="fixed pointer-events-none z-[9999] font-black text-[#22c55e] text-sm drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
    style={{ left: x, top: y }}
  >
    {text}
  </motion.div>
);

// === Hook do Cronômetro ===
const useTimer = (startedAt: Date) => {
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    const updateElapsed = () => setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);
  
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  
  return {
    formatted: `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  };
};

export default function AtendimentoCockpit() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startedAt] = useState(() => new Date());
  const timer = useTimer(startedAt); 
  const [particles, setParticles] = useState<{id: number, x: number, y: number, text: string}[]>([]);
  
  // Controle de Fundo de Tela
  const [currentBg, setCurrentBg] = useState(backgroundOptions[0]);
  const [showBgPicker, setShowBgPicker] = useState(false);
  
  // Modal de Galeria
  const [showGallery, setShowGallery] = useState(false);

  // Modo Ocioso (Screensaver) -> 10 segundos para testar
  const isIdle = useIdleTimer(10000);
  const idlePhase = useIdleSequence(isIdle);
  
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleAddWithEffect = (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newParticle = {
      id: Date.now() + Math.random(),
      x: rect.left + rect.width / 2 - 20,
      y: rect.top - 10,
      text: `+R$${product.price}`
    };
    
    setParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 800);

    addToCart(product);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0));
  };

  const servicePrice = 60.0;
  const totalProducts = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalCommission = cart.reduce((acc, item) => acc + (item.price * item.commissionRate) * item.quantity, 0);
  const grandTotal = servicePrice + totalProducts;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const idleTransition: Transition = { duration: 1, ease: "easeInOut" };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-[#3b82f6]/30 perspective-1000 relative overflow-x-hidden">
      
      {/* Estilos Globais para a Tela (Glow e Fontes) */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        
        .font-signature { 
          font-family: 'Great Vibes', cursive; 
        }

        .mask-image-horizontal {
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        .mask-image-vertical {
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }

        @keyframes glow-pulse {
          0% { box-shadow: 0 0 15px rgba(59,130,246,0.05), inset 0 0 10px rgba(59,130,246,0.02); border-color: rgba(255,255,255,0.05); }
          50% { box-shadow: 0 0 30px rgba(59,130,246,0.2), inset 0 0 20px rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.3); }
          100% { box-shadow: 0 0 15px rgba(59,130,246,0.05), inset 0 0 10px rgba(59,130,246,0.02); border-color: rgba(255,255,255,0.05); }
        }
        .animate-glow-pulse {
          animation: glow-pulse 3s infinite ease-in-out;
        }
      `}} />

      {/* Background Global Dinâmico */}
      <div 
        className="fixed inset-0 z-[-1] transition-all duration-1000 ease-in-out bg-[#0a0a0a]"
        style={{
          backgroundImage: currentBg ? `url(${currentBg})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: currentBg ? `brightness(${isIdle ? 0.8 : 0.4})` : 'none'
        }}
      />

      {/* OVERLAY DO MODO DESCANSO (SCREENSAVER DIGITAL SIGNAGE) */}
      <AnimatePresence>
        {isIdle && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[10] pointer-events-none flex flex-col justify-center overflow-hidden"
          >
            {/* Letreiro Gigante Fundo */}
            <div className="absolute inset-0 flex flex-col justify-center gap-10 opacity-[0.03]">
              <InfiniteMarquee speed={100}>
                <span className="text-[12vw] font-black uppercase tracking-tighter text-white pr-16 whitespace-nowrap">FLOW BARBERSHOP</span>
                <span className="text-[12vw] font-black uppercase tracking-tighter text-white pr-16 whitespace-nowrap">FLOW BARBERSHOP</span>
              </InfiniteMarquee>
              <InfiniteMarquee speed={120} reverse>
                <span className="text-[12vw] font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:2px_white] pr-16 whitespace-nowrap">CONTROLE ABSOLUTO</span>
                <span className="text-[12vw] font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:2px_white] pr-16 whitespace-nowrap">CONTROLE ABSOLUTO</span>
              </InfiniteMarquee>
              <InfiniteMarquee speed={90}>
                <span className="text-[12vw] font-black uppercase tracking-tighter text-white pr-16 whitespace-nowrap">FLOW BARBERSHOP</span>
                <span className="text-[12vw] font-black uppercase tracking-tighter text-white pr-16 whitespace-nowrap">FLOW BARBERSHOP</span>
              </InfiniteMarquee>
            </div>

            <AnimatePresence mode="wait">
              {/* Fase 1: Produtos */}
              {idlePhase === 'products' && (
                <motion.div 
                  key="products-phase"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.8 }}
                  className="absolute bottom-[8vh] left-0 right-0 z-20"
                >
                  <p className="text-center text-white/50 text-xs font-bold uppercase tracking-widest mb-6">Leve com você hoje</p>
                  <InfiniteMarquee speed={35}>
                    {mockProducts.map((p, i) => (
                      <div key={i} className="w-56 h-72 mx-4 bg-[#111113]/80 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 flex flex-col items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0 overflow-hidden relative">
                        {p.imageUrl ? (
                          <div className="absolute inset-0 opacity-20 bg-cover bg-center z-0" style={{ backgroundImage: `url(${p.imageUrl})` }} />
                        ) : null}
                         <div className="w-24 h-24 rounded-full border border-white/10 bg-[#18181b]/80 backdrop-blur-sm flex items-center justify-center mb-2 shadow-inner z-10 overflow-hidden">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={40} className="text-[#3b82f6]" />
                            )}
                         </div>
                         <h3 className="text-lg font-bold text-center whitespace-normal leading-tight text-white z-10">{p.name}</h3>
                         <span className="text-xl font-black text-[#22c55e] z-10">R$ {p.price.toFixed(2)}</span>
                      </div>
                    ))}
                    {mockProducts.map((p, i) => (
                      <div key={`dup-${i}`} className="w-56 h-72 mx-4 bg-[#111113]/80 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 flex flex-col items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0 overflow-hidden relative">
                         {p.imageUrl ? (
                          <div className="absolute inset-0 opacity-20 bg-cover bg-center z-0" style={{ backgroundImage: `url(${p.imageUrl})` }} />
                        ) : null}
                         <div className="w-24 h-24 rounded-full border border-white/10 bg-[#18181b]/80 backdrop-blur-sm flex items-center justify-center mb-2 shadow-inner z-10 overflow-hidden">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={40} className="text-[#3b82f6]" />
                            )}
                         </div>
                         <h3 className="text-lg font-bold text-center whitespace-normal leading-tight text-white z-10">{p.name}</h3>
                         <span className="text-xl font-black text-[#22c55e] z-10">R$ {p.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </InfiniteMarquee>
                </motion.div>
              )}

              {/* Fase 2: Fotos + Assinatura Personalizada Virada */}
              {idlePhase === 'photos' && (
                <motion.div
                  key="photos-phase"
                  className="absolute inset-0 z-20 flex"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.8 }}
                    className="absolute top-0 bottom-0 left-[5vw] lg:left-[10vw] w-[140px] md:w-[260px] py-12 md:py-24 flex flex-col"
                  >
                    <p className="text-center text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">Referências do Cliente</p>
                    <InfiniteMarquee speed={25} vertical reverse>
                      {clientGallery.map((url, i) => (
                        <div key={i} className="w-full h-36 md:h-72 rounded-[20px] md:rounded-[30px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0">
                          <img src={url} alt={`Ref ${i}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {clientGallery.map((url, i) => (
                        <div key={`dup-${i}`} className="w-full h-36 md:h-72 rounded-[20px] md:rounded-[30px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0">
                          <img src={url} alt={`Ref dup ${i}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </InfiniteMarquee>
                  </motion.div>

                  {/* Assinatura Dinâmica na Direita */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 50 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute right-[5vw] lg:right-[10vw] bottom-[10vh] md:bottom-[15vh] flex flex-col items-end"
                  >
                    <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase mb-2">Arte por</span>
                    <div className="font-signature text-4xl md:text-7xl text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] leading-none">
                      Thiago Neves
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-3 py-4 md:p-6 lg:p-8">
        <AnimatePresence>
          {particles.map(p => (
            <FloatingParticle key={p.id} x={p.x} y={p.y} text={p.text} />
          ))}
        </AnimatePresence>

        <motion.div 
          className="max-w-7xl mx-auto pb-6 lg:pb-0 relative"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div 
            animate={{ y: isIdle ? -50 : 0, opacity: isIdle ? 0 : 1 }}
            transition={idleTransition}
            style={{ pointerEvents: isIdle ? 'none' : 'auto' }}
            className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-4 md:mb-8"
          >
            <Link href="/painel/agenda" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/10 bg-[#18181b]/80 backdrop-blur-md">
              <ArrowLeft size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider hidden sm:block">Dashboard</span>
            </Link>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowBgPicker(!showBgPicker)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-full transition-colors backdrop-blur-md"
                >
                  <Wallpaper size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wide hidden sm:block">Fundo</span>
                </button>
                
                <AnimatePresence>
                  {showBgPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute right-0 top-full mt-2 bg-[#111113]/95 border border-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-2xl z-50 flex gap-2 w-max"
                    >
                      {backgroundOptions.map((bg, idx) => (
                        <div 
                          key={idx}
                          onClick={() => { setCurrentBg(bg); setShowBgPicker(false); }}
                          className={`w-12 h-12 rounded-xl cursor-pointer border-2 transition-all overflow-hidden ${currentBg === bg ? 'border-[#3b82f6] scale-110' : 'border-transparent hover:border-white/30'}`}
                        >
                          {bg ? (
                            <img src={bg} alt={`Fundo ${idx}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#0a0a0a]" />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 bg-[#3b82f6] text-white px-3 sm:px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">Em Atendimento</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 relative">
            
            {/* COLUNA ESQUERDA */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 md:gap-6">
              
              {/* 1. Timer - Destaque quando idle */}
              <motion.div 
                animate={{ 
                  scale: isIdle ? 1.05 : 1,
                  y: isIdle ? '10vh' : 0,
                  x: isIdle ? (idlePhase === 'photos' ? '15vw' : '15vw') : 0,
                  zIndex: 100
                }}
                transition={idleTransition}
                className="relative"
              >
                <TiltGlassCard isIdle={isIdle} className={`flex flex-col items-center justify-center py-12 ${isIdle ? 'bg-black/60 border-white/0 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl' : ''}`}>
                  <motion.div animate={{ opacity: isIdle ? 0 : 1 }} transition={idleTransition}>
                    <SectionLabel><Clock size={14} /> Tempo Decorrido</SectionLabel>
                  </motion.div>
                  
                  <motion.div 
                    className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums drop-shadow-lg"
                    key={timer.formatted}
                    initial={{ opacity: 0.8, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    {timer.formatted}
                  </motion.div>
                </TiltGlassCard>
              </motion.div>

              {/* 2 e 3. Info do Cliente e Galeria - Somem pro lado quando idle */}
              <motion.div 
                animate={{ x: isIdle ? -50 : 0, opacity: isIdle ? 0 : 1 }}
                transition={idleTransition}
                style={{ pointerEvents: isIdle ? 'none' : 'auto' }}
                className="flex flex-col gap-4 md:gap-6"
              >
                <TiltGlassCard>
                  <SectionLabel><User size={14} /> Detalhes do Agendamento</SectionLabel>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                      <User size={24} className="text-white/60" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Thiago Neves</h3>
                      <p className="text-white/60 flex items-center gap-1 text-xs mt-1">
                        <Phone size={10} /> (11) 98765-4321
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#18181b]/50 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-white/60">Serviço Principal</span>
                      <span className="text-xs text-white/60">15:00</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-sm">Corte Degradê + Barba</span>
                      <span className="font-bold text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">R$ 60,00</span>
                    </div>
                    
                    {/* Botão de Add Serviço Rápido (Sobrancelha, etc) */}
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/20 text-xs font-semibold text-white/60 hover:text-white hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 transition-colors active:scale-[0.98]">
                      <Plus size={12} /> Adicionar Serviço Rápido
                    </button>
                  </div>
                </TiltGlassCard>

                <TiltGlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <SectionLabel className="!mb-0"><ImageIcon size={14} /> Referências Anteriores</SectionLabel>
                    <button 
                      onClick={() => setShowGallery(true)} 
                      className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 active:scale-95"
                    >
                      Ver Galeria
                    </button>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {clientGallery.map((url, idx) => (
                      <motion.div 
                        key={idx}
                        onClick={() => setShowGallery(true)}
                        whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2, zIndex: 10 }}
                        whileTap={{ scale: 0.95 }}
                        className="min-w-[100px] h-[100px] rounded-2xl overflow-hidden shrink-0 snap-center border border-white/10 relative cursor-pointer group shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow"
                      >
                        <img src={url} alt={`Referência ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ampliar</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/40 mt-2 text-center">Arraste ou clique para abrir a galeria inteira</p>
                </TiltGlassCard>
              </motion.div>

            </div>

            {/* COLUNA DIREITA - Some pro outro lado quando idle */}
            <motion.div 
              animate={{ x: isIdle ? 100 : 0, opacity: isIdle ? 0 : 1 }}
              transition={idleTransition}
              style={{ pointerEvents: isIdle ? 'none' : 'auto' }}
              className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 h-full"
            >
              
              {/* 4. PDV Rápido */}
              <TiltGlassCard className="flex-1 flex flex-col min-h-[500px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <SectionLabel className="!mb-0"><ShoppingCart size={14} /> Produtos</SectionLabel>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Buscar produto..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#18181b] border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#3b82f6] transition-all w-full sm:w-48 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    />
                  </div>
                </div>
                
                {/* Grid de Produtos no PDV Normal - Agora com Efeito Neon Pulsante no Hover */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6 overflow-y-auto pr-2 max-h-[50vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {mockProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => {
                    const inCart = cart.find(item => item.id === product.id)?.quantity || 0;
                    return (
                      <div 
                        key={product.id} 
                        className="bg-[#18181b]/80 border border-white/5 rounded-[20px] p-3 flex flex-col group relative overflow-hidden transition-all duration-500 hover:border-[#3b82f6]/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:-translate-y-1"
                      >
                        {/* Brilho interno no hover */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="w-full h-20 md:h-28 rounded-xl border border-white/5 bg-[#111113] flex items-center justify-center mb-2 md:mb-3 relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.03] shadow-inner">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <Package size={24} className="text-white/20 group-hover:text-[#3b82f6] transition-colors" />
                          )}
                          <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                            <span className="text-[8px] font-semibold bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-white/90 border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                              EST: {product.stock}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col flex-1 relative z-10">
                          <h4 className="font-semibold text-xs md:text-sm leading-tight text-white mb-1 group-hover:text-[#3b82f6] transition-colors line-clamp-2">{product.name}</h4>
                          <span className="font-bold text-sm text-[#3b82f6] drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] mt-auto">R$ {product.price.toFixed(2)}</span>
                          
                          <button 
                            onClick={(e) => handleAddWithEffect(e, product)}
                            className="mt-3 md:mt-4 w-full py-2.5 md:py-2 rounded-full border border-white/10 text-[10px] md:text-xs font-semibold text-white/80 hover:bg-[#3b82f6] hover:border-[#3b82f6] hover:text-white transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                          >
                            ADICIONAR {inCart > 0 && `(${inCart})`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Carrinho */}
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 pt-5 mt-auto"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <SectionLabel className="!mb-0">Carrinho ({cart.reduce((a,b) => a+b.quantity, 0)})</SectionLabel>
                        <button onClick={() => setCart([])} className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1 hover:text-red-400">
                          <Trash2 size={12} /> Limpar
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {cart.map(item => (
                          <motion.div 
                            layout
                            key={item.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center justify-between bg-[#18181b]/80 p-3 rounded-xl border border-white/5 hover:border-[#3b82f6]/30 transition-colors group"
                          >
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="font-semibold text-sm truncate group-hover:text-[#3b82f6] transition-colors">{item.name}</p>
                              {item.commissionRate > 0 && (
                                <p className="text-[10px] text-[#22c55e] mt-0.5">
                                  + R$ {(item.price * item.commissionRate * item.quantity).toFixed(2)} comissão
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="font-bold text-sm text-[#3b82f6] drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">R$ {(item.price * item.quantity).toFixed(2)}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/30 transition-colors active:scale-95"><Minus size={12} className="md:w-[10px]" /></button>
                                <span className="text-xs font-semibold w-3 text-center">{item.quantity}</span>
                                <button onClick={() => addToCart(item)} className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#3b82f6] hover:text-white transition-colors active:scale-95"><Plus size={12} className="md:w-[10px]" /></button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Finalização Integrada ao PDV */}
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10">
                  <div className="flex flex-col xl:flex-row items-center justify-between gap-4 bg-[#18181b]/60 border border-white/5 rounded-2xl p-3 md:p-4 transition-colors hover:border-[#3b82f6]/30 shadow-lg">
                    <div className="w-full xl:w-auto flex justify-between xl:flex-col items-center xl:items-start">
                      <p className="text-white/60 text-xs font-semibold mb-0 xl:mb-1">Total do Atendimento</p>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">R$ {grandTotal.toFixed(2)}</h2>
                        {totalCommission > 0 && (
                            <span className="text-[#22c55e] font-semibold text-[10px] bg-[#22c55e]/10 px-2 py-1 rounded-md">
                              + R$ {totalCommission.toFixed(2)}
                            </span>
                        )}
                      </div>
                    </div>
                    
                    <button className="w-full xl:w-auto bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <CheckCircle2 size={18} />
                      FINALIZAR
                    </button>
                  </div>
                </div>

              </TiltGlassCard>
            </motion.div>
            
          </div>

        </motion.div>
      </div>

      {/* POP-UP (MODAL) DA GALERIA DO CLIENTE */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#111113] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#18181b]/50">
                <h2 className="text-xl font-bold flex items-center gap-2"><ImageIcon className="text-[#3b82f6]" size={20}/> Galeria de Thiago Neves</h2>
                <button onClick={() => setShowGallery(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X size={16} className="text-white/80" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[...clientGallery, ...clientGallery, ...clientGallery].map((url, i) => (
                   <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 relative group cursor-pointer">
                     <img src={url} alt={`Galeria ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <Search size={24} className="text-white" />
                     </div>
                   </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
