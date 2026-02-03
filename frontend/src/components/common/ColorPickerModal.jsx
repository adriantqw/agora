import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { X, Check } from 'lucide-react';

// --- Utils ---

const hexToHsv = (hex) => {
  let r = 0, g = 0, b = 0;
  // Remove #
  hex = hex.replace('#', '');
  
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;

  let d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToHex = (h, s, v) => {
  let r, g, b;
  let i;
  let f, p, q, t;

  h = Math.max(0, Math.min(360, h));
  s = Math.max(0, Math.min(100, s));
  v = Math.max(0, Math.min(100, v));

  s /= 100;
  v /= 100;

  if(s === 0) {
    // Achromatic (grey)
    r = g = b = v;
    return "#" + (Math.round(r * 255)).toString(16).padStart(2,'0') + 
                 (Math.round(g * 255)).toString(16).padStart(2,'0') + 
                 (Math.round(b * 255)).toString(16).padStart(2,'0');
  }

  h /= 60; // sector 0 to 5
  i = Math.floor(h);
  f = h - i; // factorial part of h
  p = v * (1 - s);
  q = v * (1 - s * f);
  t = v * (1 - s * (1 - f));

  switch(i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    default: r = v; g = p; b = q;
  }

  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return "#" + toHex(r) + toHex(g) + toHex(b).toUpperCase();
};

const ColorPickerModal = ({ isOpen, onClose, onSelect, title = "Select a Color" }) => {
  const colors = useThemeColors();
  
  // HSV State: Hue (0-360), Saturation (0-100), Value (0-100)
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
  const [hexInput, setHexInput] = useState('#000000');
  
  const planeRef = useRef(null);
  const hueRef = useRef(null);
  const [isDraggingPlane, setIsDraggingPlane] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  // Initialization
  useEffect(() => {
    if (isOpen) {
      setHsv({ h: 0, s: 0, v: 0 }); // Default black
      setHexInput('#000000');
    }
  }, [isOpen]);

  // Update Hex Input when HSV changes (but not if user is typing hex)
  useEffect(() => {
    if (!isDraggingPlane && !isDraggingHue) return; // Optional optimization
    // We update hex input on drag
    const newHex = hsvToHex(hsv.h, hsv.s, hsv.v);
    setHexInput(newHex);
  }, [hsv, isDraggingPlane, isDraggingHue]);

  // --- Handlers for 2D Plane (Sat/Val) ---
  const handlePlaneMove = useCallback((e) => {
    if (!planeRef.current) return;
    const rect = planeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Clamp
    const xClamped = Math.max(0, Math.min(x, rect.width));
    const yClamped = Math.max(0, Math.min(y, rect.height));

    const s = (xClamped / rect.width) * 100;
    const v = 100 - ((yClamped / rect.height) * 100);

    setHsv(prev => ({ ...prev, s, v }));
  }, []);

  const onPlaneMouseDown = (e) => {
    setIsDraggingPlane(true);
    handlePlaneMove(e);
  };

  // --- Handlers for Hue Slider ---
  const handleHueMove = useCallback((e) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    const xClamped = Math.max(0, Math.min(x, rect.width));
    const h = (xClamped / rect.width) * 360;

    setHsv(prev => ({ ...prev, h }));
  }, []);

  const onHueMouseDown = (e) => {
    setIsDraggingHue(true);
    handleHueMove(e);
  };

  // --- Global Mouse Events ---
  useEffect(() => {
    const handleUp = () => {
      setIsDraggingPlane(false);
      setIsDraggingHue(false);
    };

    const handleMove = (e) => {
      if (isDraggingPlane) handlePlaneMove(e);
      if (isDraggingHue) handleHueMove(e);
    };

    if (isDraggingPlane || isDraggingHue) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingPlane, isDraggingHue, handlePlaneMove, handleHueMove]);

  // --- Text Input Handler ---
  const handleHexChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(val)) {
       const formatted = val.startsWith('#') ? val : '#' + val;
       if (formatted.length === 4 || formatted.length === 7) {
         setHsv(hexToHsl(formatted)); // Wait, reusing logic? No, need separate parser.
         // Actually hexToHsv we defined handles it.
         setHsv(hexToHsv(formatted));
       }
    }
  };

  const handleConfirm = () => {
    let finalHex = hexInput;
    // Validate final
    if (!/^#?([0-9A-F]{6})$/i.test(finalHex)) {
      finalHex = hsvToHex(hsv.h, hsv.s, hsv.v);
    }
    if (!finalHex.startsWith('#')) finalHex = '#' + finalHex;
    onSelect(finalHex);
    onClose();
  };

  if (!isOpen) return null;

  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: colors.card.background,
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: colors.shadow.lg,
        border: `1px solid ${colors.border.subtle}`
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.text.secondary }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', alignItems: 'flex-start' }}>
          
          {/* Left: Preview */}
          <div style={{ flex: '0 0 140px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', marginBottom: '8px' }}>Preview</div>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '24px',
              background: currentHex,
              border: `1px solid ${colors.border.light}`,
              boxShadow: colors.shadow.md
            }} />
          </div>

          {/* Right: 2D Plane + Hue + Input */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
             
             {/* 2D Plane (Sat/Val) */}
             <div 
                ref={planeRef}
                onMouseDown={onPlaneMouseDown}
                style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: '12px',
                  position: 'relative',
                  background: `hsl(${hsv.h}, 100%, 50%)`,
                  cursor: 'crosshair',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                }}
             >
                <div style={{ 
                  position: 'absolute', inset: 0, 
                  background: 'linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%)' 
                }} />
                <div style={{ 
                  position: 'absolute', inset: 0, 
                  background: 'linear-gradient(to bottom, transparent 0%, #000 100%)' 
                }} />
                
                {/* Thumb */}
                <div style={{
                  position: 'absolute',
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none'
                }} />
             </div>

             {/* Hue Slider */}
             <div 
                ref={hueRef}
                onMouseDown={onHueMouseDown}
                style={{
                  width: '100%',
                  height: '16px',
                  borderRadius: '99px',
                  position: 'relative',
                  background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                  cursor: 'pointer'
                }}
             >
               {/* Hue Thumb */}
               <div style={{
                 position: 'absolute',
                 left: `${(hsv.h / 360) * 100}%`,
                 top: '50%',
                 width: '18px',
                 height: '18px',
                 borderRadius: '50%',
                 background: 'white',
                 border: '1px solid rgba(0,0,0,0.1)',
                 boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                 transform: 'translate(-50%, -50%)',
                 pointerEvents: 'none'
               }} />
             </div>

             {/* Hex Input */}
             <div>
               <label style={{ fontSize: '12px', fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Hex Code</label>
               <input 
                type="text" 
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#000000"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border.light}`,
                  background: colors.card.backgroundAlt,
                  color: colors.text.primary,
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
              />
             </div>

          </div>
        </div>

        {/* Bottom: Confirm Button */}
        <button 
          onClick={handleConfirm}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            background: colors.gradient.start,
            color: 'white',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: `0 4px 12px ${colors.gradient.start}66`
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Check size={20} />
          Confirm Color
        </button>

      </div>
    </div>
  );
};

export default ColorPickerModal;
