"use client";

import React, { useEffect, useRef, useState, useId } from "react";

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  cornerRadius?: number;
}

export function LiquidGlass({
  children,
  className = "",
  intensity = 28,
  cornerRadius = 24,
  style = {},
  ...props
}: LiquidGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const filterId = `liquid-glass-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [dataUrl, setDataUrl] = useState<string>("");
  const [scale, setScale] = useState<number>(intensity);

  useEffect(() => {
    // Generate displacement map using Shu Ding's roundedRectSDF & smoothStep shader
    const w = 260;
    const h = 70;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function smoothStep(a: number, b: number, t: number) {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    }

    function length(x: number, y: number) {
      return Math.sqrt(x * x + y * y);
    }

    function roundedRectSDF(
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) {
      const qx = Math.abs(x) - width + radius;
      const qy = Math.abs(y) - height + radius;
      return (
        Math.min(Math.max(qx, qy), 0) +
        length(Math.max(qx, 0), Math.max(qy, 0)) -
        radius
      );
    }

    const data = new Uint8ClampedArray(w * h * 4);
    let maxScale = 0;
    const rawValues: number[] = [];

    const aspect = w / h;
    const halfWidth = 0.5 * aspect;
    const halfHeight = 0.5;
    const normRadius = Math.min(cornerRadius / h, 0.48);

    for (let i = 0; i < data.length; i += 4) {
      const px = (i / 4) % w;
      const py = Math.floor(i / 4 / w);

      const uvX = px / w;
      const uvY = py / h;

      const ix = (uvX - 0.5) * aspect;
      const iy = uvY - 0.5;

      const distanceToEdge = roundedRectSDF(
        ix,
        iy,
        halfWidth - 0.04,
        halfHeight - 0.04,
        normRadius
      );

      const displacement = smoothStep(0.12, -0.06, distanceToEdge);
      const scaled = smoothStep(0, 1, displacement);

      const targetX = (ix * scaled) / aspect + 0.5;
      const targetY = iy * scaled + 0.5;

      const dx = (targetX - uvX) * w;
      const dy = (targetY - uvY) * h;

      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }

    maxScale = Math.max(maxScale * 0.5, 0.001);

    let index = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = (rawValues[index++] / maxScale) * 0.5 + 0.5;
      const g = (rawValues[index++] / maxScale) * 0.5 + 0.5;
      data[i] = Math.round(r * 255);
      data[i + 1] = Math.round(g * 255);
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    ctx.putImageData(new ImageData(data, w, h), 0, 0);
    setDataUrl(canvas.toDataURL());
    setScale(Math.min(maxScale * (intensity / 20), 45));
  }, [intensity, cornerRadius]);

  return (
    <>
      {/* Offscreen SVG Filter Definition */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -top-9999px -left-9999px w-0 h-0"
        style={{ position: "fixed", top: 0, left: 0, width: 0, height: 0 }}
      >
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="100%"
            height="100%"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            {dataUrl && (
              <feImage
                href={dataUrl}
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                result="displacementMap"
              />
            )}
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Liquid Glass Container */}
      <div
        ref={containerRef}
        className={`relative ${className}`}
        style={{
          backdropFilter: dataUrl
            ? `url(#${filterId}) blur(0.75px) contrast(1.15) brightness(1.05) saturate(1.15)`
            : "blur(20px) contrast(1.1) brightness(1.03) saturate(1.1)",
          WebkitBackdropFilter: dataUrl
            ? `url(#${filterId}) blur(0.75px) contrast(1.15) brightness(1.05) saturate(1.15)`
            : "blur(20px) contrast(1.1) brightness(1.03) saturate(1.1)",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </>
  );
}