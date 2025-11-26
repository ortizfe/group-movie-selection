import React from "react";
import "./TerminalLoader.css";

interface JellySpinnerProps {
  size?: number;
  color?: string;
  marginTop?: number;
}

export const JellySpinner: React.FC<JellySpinnerProps> = ({
  size = 100,
  color = "#0c92d1", // Default Tailwind Blue 500
  marginTop = 100,
}) => {
  return (
    <div
      className="jelly-box"
      style={
        {
          "--uib-size": `${size}px`,
          "--uib-color": color,
          marginTop: marginTop,
        } as React.CSSProperties
      }
    />
  );
};
