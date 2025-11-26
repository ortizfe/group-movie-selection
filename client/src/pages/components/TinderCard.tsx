import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

// Define strict types for directions to prevent string typos
export type Direction = "left" | "right";

export interface TinderCardRef {
  swipe: (dir: Direction) => Promise<void>;
  restoreCard: () => Promise<void>;
}

export interface TinderCardProps {
  children?: React.ReactNode;
  onSwipe: (dir: Direction) => void;
  onCardLeftScreen: (dir: Direction) => void;
  className?: string;
}

const TinderCard = forwardRef<TinderCardRef, TinderCardProps>(
  ({ children, onSwipe, onCardLeftScreen, className }, ref) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);

    // New state to handle the visual cursor change
    const [isActive, setIsActive] = useState(false);

    // Keep ref for logic to track movement without triggering excessive re-renders during drag
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      async swipe(dir: Direction) {
        setIsAnimating(true);
        const targetX = dir === "left" ? -1000 : 1000;
        setOffset({ x: targetX, y: 0 });

        setTimeout(() => {
          onSwipe(dir);
          onCardLeftScreen(dir);
        }, 300);
      },
      async restoreCard() {
        setIsAnimating(true);
        setOffset({ x: 0, y: 0 });
        setTimeout(() => setIsAnimating(false), 300);
      },
    }));

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;

      isDragging.current = true;
      setIsActive(true); // Trigger re-render to update cursor
      setIsAnimating(false);
      startPos.current = { x: e.clientX, y: e.clientY };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;

      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      setOffset({ x: dx, y: dy });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsActive(false); // Reset cursor

      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

      const SWIPE_THRESHOLD = 100;

      if (Math.abs(offset.x) > SWIPE_THRESHOLD) {
        const dir: Direction = offset.x > 0 ? "right" : "left";
        setIsAnimating(true);
        setOffset({ x: dir === "right" ? 1000 : -1000, y: offset.y });

        setTimeout(() => {
          onSwipe(dir);
          onCardLeftScreen(dir);
        }, 300);
      } else {
        setIsAnimating(true);
        setOffset({ x: 0, y: 0 });
        setTimeout(() => setIsAnimating(false), 300);
      }
    };

    const rotation = offset.x * 0.05;

    return (
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`${className || ""} touch-none select-none`}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
          transition: isAnimating ? "transform 0.3s ease-out" : "none",
          zIndex: 100,
          cursor: isActive ? "grabbing" : "grab",
        }}
      >
        {children}
      </div>
    );
  }
);

// Display name is useful for debugging in React DevTools
TinderCard.displayName = "TinderCard";

export default TinderCard;
