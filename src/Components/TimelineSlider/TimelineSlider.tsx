import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setSelectedTime } from '../../store/timelineSlice';
import './TimelineSlider.css';

const TimelineSlider: React.FC = () => {
  const dispatch = useDispatch();
  const { selected, mode } = useSelector((state: RootState) => state.timeline);

  // Generate 24 hourly timestamps for today
  const today = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => {
    const date = new Date(today);
    date.setHours(i, 0, 0, 0);
    return date;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hourIndex = parseInt(e.target.value, 10);
    const selectedHour = hours[hourIndex].toISOString();

    if (mode === 'single') {
      dispatch(setSelectedTime(selectedHour));
    } else if (mode === 'range' && Array.isArray(selected)) {
      // For range mode, update only the *end* time for simplicity here
      dispatch(setSelectedTime([selected[0], selectedHour]));
    }
  };

  // Determine current index for slider handle
  const getSelectedHourIndex = () => {
    let selectedTime: string;

    if (mode === 'single' && typeof selected === 'string') {
      selectedTime = selected;
    } else if (mode === 'range' && Array.isArray(selected)) {
      selectedTime = selected[1]; // Use end time for slider in range mode
    } else {
      return 0;
    }

    const selectedHour = new Date(selectedTime).getHours();
    return hours.findIndex((h) => h.getHours() === selectedHour);
  };

  const currentHourIndex = getSelectedHourIndex();
  const currentLabel = hours[currentHourIndex]?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="timeline-slider-container">
      <label htmlFor="timeline">
        {mode === 'single' ? 'Selected Hour' : 'End Hour'}: {currentLabel}
      </label>
      <input
        type="range"
        id="timeline"
        min="0"
        max="23"
        step="1"
        value={currentHourIndex}
        onChange={handleChange}
        className="timeline-slider"
      />
    </div>
  );
};

export default TimelineSlider;
