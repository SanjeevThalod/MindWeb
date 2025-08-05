import { useDispatch, useSelector } from 'react-redux';
import { Range, getTrackBackground } from 'react-range';
import { setDateRange, setTimeRange } from '../../store/timelineSlice';
import type { RootState } from '../../store';
import './TimelineSlider.css';

const TOTAL_DAYS = 31;
const TOTAL_HOURS = 24;

const dateRange = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 15 + i);
  return d.toISOString().split('T')[0];
});

const TimelineSlider = () => {
  const dispatch = useDispatch();
  const { selectedDateRange, selectedTimeRange } = useSelector((state: RootState) => state.timeline);

  const dateStart = dateRange.indexOf(selectedDateRange[0]);
  const dateEnd = dateRange.indexOf(selectedDateRange[1]);
  const timeStart = parseInt(selectedTimeRange[0]);
  const timeEnd = parseInt(selectedTimeRange[1]);

  const updateDateRange = ([start, end]: number[]) => {
    dispatch(setDateRange([dateRange[start], dateRange[end]]));
  };

  const updateTimeRange = ([start, end]: number[]) => {
    dispatch(setTimeRange([`${start}:00`, `${end}:00`]));
  };

  return (
    <div className="timeline-slider-container">
      <div className="slider-section">
        <label>Date Range:</label>
        <Range
          values={[dateStart, dateEnd]}
          step={1}
          min={0}
          max={TOTAL_DAYS - 1}
          onChange={updateDateRange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="track"
              style={{
                ...props.style,
                background: getTrackBackground({
                  values: [dateStart, dateEnd],
                  colors: ['#ccc', '#0077ff', '#ccc'],
                  min: 0,
                  max: TOTAL_DAYS - 1,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ index, props }) => (
            <div {...props} className="thumb">
              <div className="thumb-label">
                {dateRange[[dateStart, dateEnd][index]]}
              </div>
            </div>
          )}
        />
      </div>

      <div className="slider-section">
        <label>Time Range:</label>
        <Range
          values={[timeStart, timeEnd]}
          step={1}
          min={0}
          max={23}
          onChange={updateTimeRange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="track"
              style={{
                ...props.style,
                background: getTrackBackground({
                  values: [timeStart, timeEnd],
                  colors: ['#ccc', '#0077ff', '#ccc'],
                  min: 0,
                  max: 23,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ index, props }) => (
            <div {...props} className="thumb">
              <div className="thumb-label">
                {[timeStart, timeEnd][index]}:00
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default TimelineSlider;
