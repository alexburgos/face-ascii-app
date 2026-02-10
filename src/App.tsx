import { useState } from 'react';
import FaceTracker from './components/FaceTracker';

type ColorMode = 'green' | 'white' | 'cyan';

const DEFAULT_FONT_SIZE = 12;

const colorButtonStyles = {
  green: {
    active: 'text-matrix-green border-matrix-green shadow-color-green',
  },
  white: {
    active: 'text-white border-white shadow-color-white',
  },
  cyan: {
    active: 'text-matrix-cyan border-matrix-cyan shadow-color-cyan',
  },
} as const;

function App() {
  const [enabled, setEnabled] = useState(false);
  const [asciiMode, setAsciiMode] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>('green');
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg to-dark-secondary flex items-center justify-center p-5 font-sans text-gray-text">
      <div className="w-full max-w-[1200px] flex flex-col gap-[30px]">
        <header className="text-center mb-5">
          <h1 className="text-[2.5rem] font-bold text-gradient-matrix tracking-tight">
            ASCII Face Tracker
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[30px] items-start">
          <div className="bg-black border-2 border-dark-border rounded-xl overflow-hidden aspect-[4/3] shadow-glow-green hover:shadow-glow-green-hover transition-shadow">
            <FaceTracker
              enabled={enabled}
              asciiMode={asciiMode}
              colorMode={colorMode}
              fontSize={fontSize}
            />
          </div>

          <div className="flex flex-col gap-5 bg-white/[0.02] border border-matrix-green/10 rounded-xl p-6 backdrop-blur-sm h-fit sticky top-5">
            {/* Start/Stop Button */}
            <div className="flex flex-col gap-2.5">
              <button
                className={`
                  w-full py-3 px-4 rounded-lg text-base font-semibold cursor-pointer 
                  transition-all uppercase tracking-wider border-none
                  ${enabled 
                    ? 'bg-gradient-to-br from-error-red to-[#cc0000] text-white shadow-btn-red' 
                    : 'bg-gradient-to-br from-matrix-green to-[#00cc00] text-black shadow-btn-green hover:-translate-y-0.5 hover:shadow-btn-green-hover'
                  }
                `}
                onClick={() => setEnabled((prev) => !prev)}
              >
                {enabled ? '⏹ Stop' : '▶ Start'}
              </button>
            </div>

            {/* ASCII Mode Toggle */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-gray-label flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={asciiMode}
                  onChange={(e) => setAsciiMode(e.target.checked)}
                  className="w-[18px] h-[18px] cursor-pointer accent-matrix-green"
                />
                <span>ASCII Art Mode</span>
              </label>
            </div>

            {/* Color Selection */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-gray-label">Color:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['green', 'white', 'cyan'] as const).map((color) => (
                  <button
                    key={color}
                    className={`
                      py-3 px-2 rounded-lg text-2xl cursor-pointer transition-all border-2
                      ${colorMode === color 
                        ? `bg-white/10 ${colorButtonStyles[color].active}` 
                        : 'bg-white/5 border-white/10 text-gray-muted hover:border-white/20 hover:bg-white/[0.08]'
                      }
                    `}
                    onClick={() => setColorMode(color)}
                    title={color}
                  >
                    ●
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            {asciiMode && (
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-medium text-gray-label">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="16"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Info Box */}
            <div className="p-3 bg-matrix-green/5 border border-matrix-green/20 rounded-lg text-center">
              <p className="text-sm text-[#909090]">
                Enable webcam and toggle ASCII mode for effects
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center p-5 text-gray-footer text-sm border-t border-matrix-green/10">
          <p>Built by Alex Burgos using React and face-api.js</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
