import { useState, useCallback, useMemo } from 'react';
import FaceTracker from './components/FaceTracker';
import './App.css';

type ColorMode = 'green' | 'white' | 'cyan';

function App() {
  const [enabled, setEnabled] = useState(false);
  const [asciiMode, setAsciiMode] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>('green');
  const [fontSize, setFontSize] = useState(11);

  const handleToggle = useCallback(() => setEnabled((prev) => !prev), []);
  const handleAsciiToggle = useCallback((e) => setAsciiMode(e.target.checked), []);
  const handleColorChange = useCallback((color: ColorMode) => setColorMode(color), []);
  const handleFontSizeChange = useCallback((e) => setFontSize(Number(e.target.value)), []);

  const colorButtons = useMemo(() => (
    ['green', 'white', 'cyan'].map((color) => (
      <button
        key={color}
        className={`btn btn-color btn-${color} ${colorMode === color ? 'active' : ''}`}
        onClick={() => handleColorChange(color as ColorMode)}
        title={color}
      >
        ●
      </button>
    ))
  ), [colorMode, handleColorChange]);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>ASCII Face Tracker</h1>
        </header>

        <div className="content">
          <div className="viewer-wrapper">
            <FaceTracker
              enabled={enabled}
              asciiMode={asciiMode}
              colorMode={colorMode}
              fontSize={fontSize}
            />
          </div>

          <div className="controls-panel">
            <div className="control-group">
              <button
                className={`btn btn-primary ${enabled ? 'active' : ''}`}
                onClick={handleToggle}
              >
                {enabled ? '⏹ Stop' : '▶ Start'}
              </button>
            </div>

            <div className="control-group">
              <label className="control-label">
                <input
                  type="checkbox"
                  checked={asciiMode}
                  onChange={handleAsciiToggle}
                  className="checkbox"
                />
                <span>ASCII Art Mode</span>
              </label>
            </div>

            <div className="control-group">
              <label className="control-label">Color:</label>
              <div className="color-buttons">
                {colorButtons}
              </div>
            </div>

            {asciiMode && (
              <div className="control-group">
                <label className="control-label">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="16"
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  className="slider"
                />
              </div>
            )}

            <div className="info">
              <p>Enable webcam and toggle ASCII mode for effects</p>
            </div>
          </div>
        </div>

        <footer className="footer">
          <p>Built by Alex Burgos using React and face-api.js</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
