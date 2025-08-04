import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setDate, setTime } from '../../store/timelineSlice';
import "./TimelineSlider.css"

const dateRange = Array.from({ length: 31 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 15 + i);
  return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
});

const timeRange = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const TimelineSlider = () => {
  const dispatch = useDispatch();
  const selectedDate = useSelector((state: RootState) => state.timeline.selectedDate);
  const selectedTime = useSelector((state: RootState) => state.timeline.selectedTime);

  return (
    <div className="timeline-slider-ui">
      <p>
        <span className='bold'>Selected: </span> {selectedDate} <span className='bold'>@ </span> {selectedTime}
      </p>
      <label>Date: <span className='bold'>{selectedDate}</span></label>
      <input
        type="range"
        min={0}
        max={30}
        value={Math.max(0, dateRange.indexOf(selectedDate))}
        onChange={(e) => dispatch(setDate(dateRange[+e.target.value]))}
      />
      <label>Time: <span className='bold'>{selectedTime}</span></label>
      <input
        type="range"
        min={0}
        max={23}
        value={selectedTime ? parseInt(selectedTime.split(':')[0]) : 0}
        onChange={(e) => dispatch(setTime(`${e.target.value}:00`))}
      />
    </div>
  );
};

export default TimelineSlider;
