// Loader.jsx
import { useEffect } from 'react';

// ── Styles (injected once) ──
let stylesInjected = false;
const STYLE_ID = 'sg-loader-styles';

function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) {
    stylesInjected = true;
    return;
  }
  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = `
    .sg-loader {
      width: 64px;
      height: 64px;
      position: relative;
      display: inline-block;
    }
    .sg-loader__svg {
      display: block;
      width: 100%;
      height: 100%;
      fill: none;
      stroke: #000;
      stroke-width: 8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .sg-loader__dot {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #fff;
      top: 37px;
      left: 19px;
      transform: translate(-16px, -16px);
      animation: sg-DotRect 3s cubic-bezier(0.7, 0.13, 0.15, 0.8) infinite;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
      pointer-events: none;
    }
    .sg-loader--triangle .sg-loader__dot {
      left: 21px;
      transform: translate(-10px, -18px);
      animation: sg-DotTriangle 3s cubic-bezier(0.7, 0.13, 0.15, 0.8) infinite;
    }
    .sg-shape-polygon {
      stroke-dashoffset: 0;
      stroke-dasharray: 145 76 145 76;
      animation: sg-animateTriangle 3s cubic-bezier(0.7, 0.13, 0.15, 0.8) infinite;
    }
    .sg-shape-rect {
      stroke-dashoffset: 0;
      stroke-dasharray: 192 64 192 64;
      animation: sg-animateRect 3s cubic-bezier(0.7, 0.13, 0.15, 0.8) infinite;
    }
    .sg-shape-circle {
      stroke-dashoffset: 75;
      stroke-dasharray: 150 50 150 50;
      animation: sg-animateCircle 3s cubic-bezier(0.7, 0.13, 0.15, 0.8) infinite;
    }
    @keyframes sg-animateTriangle {
      33%  { stroke-dashoffset: 74; }
      66%  { stroke-dashoffset: 147; }
      100% { stroke-dashoffset: 221; }
    }
    @keyframes sg-animateCircle {
      25%  { stroke-dashoffset: 125; }
      50%  { stroke-dashoffset: 175; }
      75%  { stroke-dashoffset: 225; }
      100% { stroke-dashoffset: 275; }
    }
    @keyframes sg-animateRect {
      0%   { stroke-dashoffset: 0; }
      25%  { stroke-dashoffset: 64; }
      50%  { stroke-dashoffset: 128; }
      75%  { stroke-dashoffset: 192; }
      100% { stroke-dashoffset: 256; }
    }
    @keyframes sg-DotTriangle {
      33%  { transform: translate(0, 0); }
      66%  { transform: translate(10px, -18px); }
      100% { transform: translate(-10px, -18px); }
    }
    @keyframes sg-DotRect {
      25%  { transform: translate(0, 0); }
      50%  { transform: translate(18px, -18px); }
      75%  { transform: translate(0, -36px); }
      100% { transform: translate(-18px, -18px); }
    }
    .sg-page-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .sg-page-loader__label {
      font-family: 'Barlow', sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      font-size: 14px;
      color: #fff;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
      animation: sg-labelPulse 2.4s ease-in-out infinite;
      margin: 0;
    }
    @keyframes sg-labelPulse {
      0%, 100% { opacity: 0.7; }
      50%      { opacity: 1; }
    }
  `;
  document.head.appendChild(styleEl);
  stylesInjected = true;
}

// ── Single loader (circle / triangle / square) ──
export function Loader({ shape = 'square', size = 64, className = '' }) {
  useEffect(() => { injectStyles(); }, []);

  const scale = size / 64;
  const viewBox = shape === 'triangle' ? '0 0 86 80' : '0 0 80 80';
  const triangleClass = shape === 'triangle' ? ' sg-loader--triangle' : '';

  let svgShape;
  switch (shape) {
    case 'circle':
      svgShape = <circle className="sg-shape-circle" cx="40" cy="40" r="32" />;
      break;
    case 'triangle':
      svgShape = <polygon className="sg-shape-polygon" points="43 8 79 72 7 72" />;
      break;
    case 'square':
    default:
      svgShape = <rect className="sg-shape-rect" x="8" y="8" width="64" height="64" />;
      break;
  }

  return (
    <span
      className={`sg-loader${triangleClass} ${className}`.trim()}
      style={{ display: 'inline-block', width: size, height: size, position: 'relative' }}
    >
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 64,
          height: 64,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          display: 'block',
        }}
      >
        <svg className="sg-loader__svg" viewBox={viewBox}>
          {svgShape}
        </svg>
        <span className="sg-loader__dot" />
      </span>
    </span>
  );
}

// ── All three shapes at once ──
export function LoaderGroup({ size = 64, gap = 32, className = '' }) {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: `${gap}px`,
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Loader shape="circle" size={size} />
      <Loader shape="triangle" size={size} />
      <Loader shape="square" size={size} />
    </div>
  );
}

// ── Page loader with label ──
export function PageLoader({ label = 'Loading…', size = 48, className = '' }) {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div className={`sg-page-loader ${className}`.trim()}>
      <Loader shape="square" size={size} />
      <p className="sg-page-loader__label">{label}</p>
    </div>
  );
}