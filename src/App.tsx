import { useState } from 'react';
import FaceTracker from './components/FaceTracker';

type ColorMode = 'red' | 'green' | 'blue';

const DEFAULT_FONT_SIZE = 12;

const colorHex: Record<ColorMode, string> = {
  red: '#FE0000',
  green: '#00FF40',
  blue: '#0059CF',
};

function App() {
  const [enabled, setEnabled] = useState(false);
  const [asciiMode, setAsciiMode] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>('red');
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  return (
    <div data-theme="lofi" className="min-h-screen bg-base-200 flex flex-col">
      <main className="flex-1 flex justify-center p-6 mt-20">
        <div className="w-full max-w-6xl grid grid-rows-[1fr_auto] lg:grid-cols-[1fr_280px] gap-6 items-start">
          <div className=" overflow-hidden">
            <div className="aspect-4/3 bg-black">
              <FaceTracker
                enabled={enabled}
                asciiMode={asciiMode}
                colorMode={colorMode}
                fontSize={fontSize}
              />
            </div>
          </div>

          <div className="">
            <div className="card-body gap-5 p-5">
              <h2 className="text-md text-center ">
                Another Face Tracker with ASCII :)
              </h2>

              <button
                className={`btn w-full ${enabled ? 'btn-error' : 'btn-success'}`}
                onClick={() => setEnabled((prev) => !prev)}
              >
                {enabled ? 'Camera Off' : 'Camera On'}
              </button>

              <div className="divider my-0" />

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-md font-medium">ASCII</span>
                <input
                  type="checkbox"
                  className="toggle toggle-success toggle-sm"
                  checked={asciiMode}
                  onChange={(e) => setAsciiMode(e.target.checked)}
                />
              </label>

              <div>
                <span className="text-xs text-base-content/50 mb-2 block">Color</span>
                <div className="flex gap-3">
                  {(['red', 'green', 'blue'] as const).map((color) => (
                    <button
                      key={color}
                      onClick={() => setColorMode(color)}
                      className={` cursor-pointer w-7 h-7 rounded-full transition-all outline-2 outline-offset-2 ${
                        colorMode === color
                          ? 'outline outline-base-content scale-110'
                          : 'opacity-75 hover:opacity-95'
                      }`}
                      style={{ backgroundColor: colorHex[color] }}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>

              {asciiMode && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-base-content/50">Font Size</span>
                    <span className="badge badge-ghost badge-sm">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    className="range range-info range-sm"
                    min={8}
                    max={16}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="divider my-0" />

              <p className="text-[11px] text-center text-base-content/70 leading-relaxed">
                Don't forget to enable webcam permissions via your browser settings!
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-base-content/25">
        Built by Alex Burgos with React &amp; face-api.js
      </footer>
    </div>
  );
}

export default App;
