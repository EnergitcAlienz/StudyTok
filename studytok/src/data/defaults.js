export const PALETTE = {
  concept: {
    bg: '#f5f0ff',
    grad: 'radial-gradient(ellipse 70% 55% at 75% 15%, rgba(221,214,254,0.95), #f5f0ff), radial-gradient(ellipse 50% 40% at 20% 85%, rgba(196,181,253,0.6), transparent)',
    blob1: 'rgba(221,214,254,0.9)', blob2: 'rgba(196,181,253,0.6)',
    stripe: 'linear-gradient(90deg, transparent, #c4b5fd 40%, #a78bfa 60%, transparent)',
    accent: '#7c3aed', title: '#4c1d95', body: '#5b21b6', muted: '#7c3aed',
    badge: 'rgba(124,58,237,0.12)', badgeBorder: 'rgba(124,58,237,0.35)', badgeText: '#6d28d9',
    flipFront: 'linear-gradient(135deg,rgba(196,181,253,0.5),rgba(167,139,250,0.25))',
    flipBorder: 'rgba(124,58,237,0.35)', flipText: '#4c1d95',
    optBg: 'rgba(124,58,237,0.07)', optBorder: 'rgba(124,58,237,0.22)',
  },
  quiz: {
    bg: '#fff0f7',
    grad: 'radial-gradient(ellipse 70% 55% at 25% 20%, rgba(251,207,232,0.95), #fff0f7), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(249,168,212,0.6), transparent)',
    blob1: 'rgba(251,207,232,0.95)', blob2: 'rgba(249,168,212,0.6)',
    stripe: 'linear-gradient(90deg, transparent, #f9a8d4 40%, #f472b6 60%, transparent)',
    accent: '#be185d', title: '#831843', body: '#9d174d', muted: '#be185d',
    badge: 'rgba(190,24,93,0.12)', badgeBorder: 'rgba(190,24,93,0.35)', badgeText: '#9d174d',
    flipFront: 'linear-gradient(135deg,rgba(249,168,212,0.5),rgba(244,114,182,0.25))',
    flipBorder: 'rgba(190,24,93,0.35)', flipText: '#831843',
    optBg: 'rgba(190,24,93,0.06)', optBorder: 'rgba(190,24,93,0.22)',
  },
  fact: {
    bg: '#f0fdf8',
    grad: 'radial-gradient(ellipse 70% 55% at 65% 10%, rgba(209,250,229,0.95), #f0fdf8), radial-gradient(ellipse 50% 40% at 15% 80%, rgba(167,243,208,0.6), transparent)',
    blob1: 'rgba(209,250,229,0.95)', blob2: 'rgba(167,243,208,0.6)',
    stripe: 'linear-gradient(90deg, transparent, #6ee7b7 40%, #34d399 60%, transparent)',
    accent: '#047857', title: '#064e3b', body: '#065f46', muted: '#047857',
    badge: 'rgba(4,120,87,0.12)', badgeBorder: 'rgba(4,120,87,0.35)', badgeText: '#065f46',
    flipFront: 'linear-gradient(135deg,rgba(167,243,208,0.5),rgba(110,231,183,0.25))',
    flipBorder: 'rgba(4,120,87,0.35)', flipText: '#064e3b',
    optBg: 'rgba(4,120,87,0.06)', optBorder: 'rgba(4,120,87,0.22)',
  },
  memory: {
    bg: '#fffbeb',
    grad: 'radial-gradient(ellipse 70% 55% at 50% 10%, rgba(254,243,199,0.95), #fffbeb), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(252,211,77,0.5), transparent)',
    blob1: 'rgba(254,243,199,0.98)', blob2: 'rgba(252,211,77,0.5)',
    stripe: 'linear-gradient(90deg, transparent, #fcd34d 40%, #fbbf24 60%, transparent)',
    accent: '#b45309', title: '#78350f', body: '#92400e', muted: '#b45309',
    badge: 'rgba(180,83,9,0.12)', badgeBorder: 'rgba(180,83,9,0.35)', badgeText: '#92400e',
    flipFront: 'linear-gradient(135deg,rgba(252,211,77,0.5),rgba(251,191,36,0.25))',
    flipBorder: 'rgba(180,83,9,0.35)', flipText: '#78350f',
    optBg: 'rgba(180,83,9,0.06)', optBorder: 'rgba(180,83,9,0.22)',
  },
}

export const TYPE_LABEL = {
  concept: '📖 Concepto',
  quiz:    '❓ Quiz',
  fact:    '⚡ Dato',
  memory:  '🃏 Memoria',
}

export const DEFAULT_CARDS = [
  { type:'concept', subject:'Derecho del Consumidor', title:'Idoneidad del producto', body:'La idoneidad es la correspondencia entre lo que el consumidor espera recibir y lo que efectivamente recibe. El proveedor responde si existe discordancia, salvo causa no imputable.' },
  { type:'quiz', subject:'Derecho del Consumidor', title:'Carga de la prueba en idoneidad', question:'Cuando un consumidor alega falta de idoneidad en INDECOPI, ¿quién debe probar?', options:[{text:'El consumidor prueba el defecto',correct:false},{text:'El proveedor prueba que actuó con diligencia',correct:true},{text:'Ambas partes tienen carga igual',correct:false},{text:'El juez decide sin pruebas',correct:false}], explanation:'Inversión de la carga probatoria: el proveedor está en mejor posición técnica (Art. 112 Código de Consumo).' },
  { type:'fact', subject:'Derecho Tributario', title:'📊 IR — no domiciliados', body:'Para no domiciliados la tasa del IR es flat: 30% sobre renta neta de fuente peruana. No aplican deducciones generales como las del domiciliado.' },
  { type:'memory', subject:'Derecho Tributario', front:'¿Cuáles son las 3 teorías de renta?', back:'① Renta-producto\n② Flujo de riqueza\n③ Consumo + incremento patrimonial' },
  { type:'quiz', subject:'Derecho Tributario', title:'Teoría aplicada en Perú', question:'¿Qué teoría aplica Perú para personas naturales domiciliadas?', options:[{text:'Solo renta-producto',correct:false},{text:'Solo flujo de riqueza',correct:false},{text:'Las tres teorías combinadas',correct:true},{text:'Flujo de riqueza + consumo',correct:false}], explanation:'Perú usa sistema mixto combinando las tres teorías según la categoría de renta (Art. 1° LIR).' },
  { type:'fact', subject:'Protección al Consumidor', title:'🏛️ Tori vs. Kouros', body:'INDECOPI: el silencio del proveedor ante una queja equivale a admisión de responsabilidad. Fundamento: asimetría informativa entre proveedor y consumidor.' },
]
