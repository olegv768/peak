import { useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** наибольший наклон, градусы */
  max?: number;
  /** блик, который бежит за курсором */
  glare?: boolean;
  className?: string;
  /** скругление блика под форму карточки */
  radius?: string;
}

/** 3D-наклон за курсором. Дочерние элементы с translateZ выступают вперёд (preserve-3d). */
export function Tilt({ children, max = 10, glare, className = "", radius = "18px" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg)`;
    if (glareRef.current) {
      glareRef.current.style.opacity = "1";
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgb(255 255 255 / 0.28), transparent 55%)`;
    }
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <div className={`[perspective:1000px] ${className}`} onPointerMove={move} onPointerLeave={leave}>
      <div ref={ref} className="relative transition-transform duration-200 ease-out [transform-style:preserve-3d] motion-reduce:transition-none">
        {children}
        {glare && (
          <div
            ref={glareRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300"
            style={{ borderRadius: radius }}
          />
        )}
      </div>
    </div>
  );
}
