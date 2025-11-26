import { useState, useRef, useImperativeHandle, forwardRef } from "react";

const TinderCard = forwardRef(
  ({ children, onSwipe, onCardLeftScreen, className }, ref) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const cardRef = useRef(null);

    useImperativeHandle(ref, () => ({
      async swipe(dir: string) {
        setIsAnimating(true);
        const targetX = dir === "left" ? -1000 : 1000;
        setOffset({ x: targetX, y: 0 });

        // Wait for animation to finish before triggering callback
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

    const handlePointerDown = (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;

      isDragging.current = true;
      setIsAnimating(false);
      startPos.current = { x: e.clientX, y: e.clientY };

      e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
      if (!isDragging.current) return;

      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      setOffset({ x: dx, y: dy });
    };

    const handlePointerUp = (e) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      e.target.releasePointerCapture(e.pointerId);

      const SWIPE_THRESHOLD = 100;

      if (Math.abs(offset.x) > SWIPE_THRESHOLD) {
        // Swiped far enough
        const dir = offset.x > 0 ? "right" : "left";
        setIsAnimating(true);
        setOffset({ x: dir === "right" ? 1000 : -1000, y: offset.y });

        setTimeout(() => {
          onSwipe(dir);
          onCardLeftScreen(dir);
        }, 300);
      } else {
        // Snap back
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
        onPointerCancel={handlePointerUp} // Handle interruption
        className={`${className} touch-none select-none`}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
          transition: isAnimating ? "transform 0.3s ease-out" : "none",
          zIndex: 100,
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
      >
        {children}
      </div>
    );
  }
);

export default TinderCard;
