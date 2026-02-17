import { useState } from 'react';
import FaceTracker from './components/FaceTracker';

type ColorMode = 'green' | 'white' | 'cyan';

const DEFAULT_FONT_SIZE = 12;

const colorHex: Record<ColorMode, string> = {
  green: '#00ff00',
  white: '#ffffff',
  cyan: '#00ffff',
};

function App() {
  const [enabled, setEnabled] = useState(false);
  const [asciiMode, setAsciiMode] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>('green');
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  return (
    <div data-theme="dim" className="min-h-screen bg-base-200 flex flex-col">
      {/* Navbar */}
      <nav className="navbar px-6">
        <span className="text-lg font-semibold tracking-tight">
          Just another Face Tracker with ASCII capabilities
        </span>
      </nav>

      {/* Main */}
      <main className="flex-1 flex justify-center p-6 mt-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
          {/* Video Feed */}
          <div className="card bg-base-100 shadow-md overflow-hidden">
            <div className="aspect-4/3 bg-black">
              <FaceTracker
                enabled={enabled}
                asciiMode={asciiMode}
                colorMode={colorMode}
                fontSize={fontSize}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body gap-5 p-5">
              <h2 className="text-xs font-medium uppercase tracking-widest text-base-content/40">
                Controls
              </h2>

              {/* Start / Stop */}
              <button
                className={`btn w-full ${enabled ? 'btn-error' : 'btn-success'}`}
                onClick={() => setEnabled((prev) => !prev)}
              >
                {enabled ? 'Stop Camera' : 'Start Camera'}
              </button>

              <div className="divider my-0" />

              {/* ASCII Mode Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">ASCII Mode</span>
                <input
                  type="checkbox"
                  className="toggle toggle-success toggle-sm"
                  checked={asciiMode}
                  onChange={(e) => setAsciiMode(e.target.checked)}
                />
              </label>

              {/* Color Picker */}
              <div>
                <span className="text-xs text-base-content/50 mb-2 block">Color</span>
                <div className="flex gap-3">
                  {(['green', 'white', 'cyan'] as const).map((color) => (
                    <button
                      key={color}
                      onClick={() => setColorMode(color)}
                      className={`w-7 h-7 rounded-full transition-all outline-2 outline-offset-2 ${
                        colorMode === color
                          ? 'outline outline-base-content scale-110'
                          : 'opacity-50 hover:opacity-75'
                      }`}
                      style={{ backgroundColor: colorHex[color] }}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>

              {/* Font Size Slider */}
              {asciiMode && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-base-content/50">Font Size</span>
                    <span className="badge badge-ghost badge-sm">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    className="range range-success range-sm"
                    min={8}
                    max={16}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="divider my-0" />

              {/* Hint */}
              <p className="text-[11px] text-center text-base-content/30 leading-relaxed">
                Enable webcam and toggle ASCII mode for real-time effects
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-base-content/25 border-t border-base-300">
        Built by Alex Burgos with React &amp; face-api.js
      </footer>
    </div>
  );
}

export default App;
