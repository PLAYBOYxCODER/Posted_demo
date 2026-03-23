"use client";
import React from "react";
import "./SpeedingLoader.css";

export default function SpeedingLoader() {
  return (
    <div className="speeding-wrapper scale-100 sm:scale-125">
      <div className="loader">
        <span><span></span><span></span><span></span><span></span></span>
        <div className="base">
          <span></span>
          <div className="face"></div>
        </div>
      </div>
      <div className="longfazers">
        <span></span><span></span><span></span><span></span>
      </div>
    </div>
  );
}
