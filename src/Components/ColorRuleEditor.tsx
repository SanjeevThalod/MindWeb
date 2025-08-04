import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { updateColor } from '../store/colorRulesSlice';
import "./ColorRuleEditor.css";

const ColorRuleEditor = () => {
  const dispatch = useDispatch();
  const rules = useSelector((state: RootState) => state.colorRules);
  console.log("Rules in Editor:", rules);

  const handleChange = (index: number, color: string) => {
    console.log("updates sent", color);
    dispatch(updateColor({ index, color }));
  }
  return (
    <div className="color-rule-editor">
      <h3>Temperature Color Rules (5°C Intervals)</h3>
      {rules.map((rule, index) => (
        <div className="color-rule-row" key={index}>
          <label>
            {rule.min}°C – {rule.max}°C
          </label>
          <input
            type="color"
            value={rule.color}
            onChange={(e) => {
              console.log("Color changed at index", index, "to", e.target.value);
              handleChange(index, e.target.value);
            }}
          />
        </div>
      ))}
    </div>

  );
};

export default ColorRuleEditor;
