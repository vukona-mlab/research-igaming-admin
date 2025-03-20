import React, { useState } from "react";
import "./ToggleSwitch.css";

const ToggleSwitch = ({ value, handleSliderChange }) => {
  const onToggle = () => handleSliderChange(!value);
  return (
    <>
      <label className="ToggleSwitch">
        <input type="checkbox" checked={value} onChange={onToggle} />
        <span className="switch" />
      </label>
    </>
  );
};

export default ToggleSwitch;
