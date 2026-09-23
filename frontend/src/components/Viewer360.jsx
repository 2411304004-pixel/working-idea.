import React, { useState, useRef, useEffect } from 'react';

export default function Viewer360({ imageUrl, hotspots = [] }) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [panOffset, setPanOffset] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const containerRef = useRef(null);

  // Default hotspots inside the vintage cafe caravan if none provided
  const defaultHotspots = [
    {
      id: 'hotspot-1',
      xPercent: 28,
      yPercent: 46,
      title: 'La Marzocco Linea PB Bar',
      description: 'Dual-group custom copper finish espresso machine powered by silent lithium batteries.'
    },
    {
      id: 'hotspot-2',
      xPercent: 54,
      yPercent: 62,
      title: 'Live-Edge Cedar Service Counter',
      description: 'Reclaimed Himalayan cedar serving slab with integrated drainage and pour-over scales.'
    },
    {
      id: 'hotspot-3',
      xPercent: 72,
      yPercent: 28,
      title: 'Festoon Edison Ceiling Lights',
      description: 'Warm 2200K ambient dimmable filament lighting strung across vintage curved caravan ribs.'
    },
    {
      id: 'hotspot-4',
      xPercent: 88,
      yPercent: 55,
      title: 'Acoustic Soundstage & Vinyl Nook',
      description: 'Audiophile Bluetooth & belt-drive turntable for intimate sunset background jazz and acoustic sets.'
    }
  ];

  const activeSpots = hotspots.length > 0 ? hotspots : defaultHotspots;

  // Auto rotate effect
  useEffect(() => {
    let interval;
    if (autoRotate && !isDragging) {
      interval = setInterval(() => {
        setPanOffset(prev => (prev + 0.15) % 100);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setAutoRotate(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setStartX(e.clientX);
    setPanOffset(prev => (prev - deltaX * 0.08 + 100) % 100);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartX(e.touches[0].clientX);
      setAutoRotate(false);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - startX;
    setStartX(e.touches[0].clientX);
    setPanOffset(prev => (prev - deltaX * 0.1 + 100) % 100);
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(1.8, Math.max(0.8, prev + delta)));
  };

  const bgImage = imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDKZRPX0oFFQrB4LkYTwB18pZDgfcTdQW_PD5D44LVDaV8BvJTQRp8z9YVch_Eg01CbMZMP48VfGOMUrG1c646Zq9VNniXNVkFNF_D2VDauYjwPxYL4DEa8WAZWxL3srGPYcgkLjm5ebFClR4Iz01RMttSnPsfBU8VN6Va9DquUYyUkngiV4mHeS15k30CPnr4mfLssDM9k9G5uew0q7Pm5lkwKDwhkYA_wkfxsjNK6aKBxc3EPJbmj";

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-inverse-surface shadow-xl border border-outline-variant/30 select-none">
      
      {/* 360 Badge & Coordinates */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md font-bold text-xs text-on-surface shadow-sm flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary animate-spin">360</span>
          <span>Interactive 360° Interior Panorama</span>
        </span>
        <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-inverse-surface/80 backdrop-blur-md text-[11px] text-surface-container-high">
          Bearing: {Math.round(panOffset * 3.6)}°
        </span>
      </div>

      {/* Panoramic Viewport Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className="w-full h-[420px] sm:h-[500px] cursor-grab active:cursor-grabbing relative overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: `${panOffset}% 50%`,
          backgroundSize: `${240 * zoomLevel}% cover`,
          backgroundRepeat: 'repeat-x',
          transition: isDragging ? 'none' : 'background-position 0.1s ease-out'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent pointer-events-none"></div>

        {/* Hotspots Overlay */}
        {activeSpots.map((spot) => {
          // Adjust hotspot relative position based on 360 pan offset
          const adjustedX = ((spot.xPercent - panOffset + 100) % 100);
          return (
            <div
              key={spot.id}
              style={{
                left: `${adjustedX}%`,
                top: `${spot.yPercent}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute z-10 group"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(activeHotspot?.id === spot.id ? null : spot);
                }}
                className="w-8 h-8 rounded-full bg-primary/90 text-on-primary shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform animate-pulse"
                title={spot.title}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          );
        })}

        {/* Hotspot Modal / Popover */}
        {activeHotspot && (
          <div className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xs z-30 bg-surface-container-lowest/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-outline-variant/40 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{activeHotspot.title}</span>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-tertiary hover:text-on-surface text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {activeHotspot.description}
            </p>
          </div>
        )}
      </div>

      {/* Floating Viewport Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-surface/90 backdrop-blur-md p-1.5 rounded-full shadow-md">
        <button
          onClick={() => handleZoom(0.15)}
          className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface text-sm font-bold transition-colors"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface text-sm font-bold transition-colors"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>
        <div className="w-[1px] h-4 bg-outline-variant"></div>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${
            autoRotate
              ? 'bg-primary text-on-primary'
              : 'hover:bg-surface-container-high text-on-surface'
          }`}
          title="Toggle 360° Auto-Rotate"
        >
          <span className="material-symbols-outlined text-[14px]">sync</span>
          <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>
      </div>

      {/* Instruction hint */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-1.5 text-surface-container-lowest text-xs bg-inverse-surface/60 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="material-symbols-outlined text-[14px]">pan_tool</span>
        <span>Click & drag horizontally to inspect interior</span>
      </div>
    </div>
  );
}
