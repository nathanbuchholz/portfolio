import { useState } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'
import type { GameConfig } from './types'
import { CONFIG_FIELDS, PRESETS } from './constants'
import { formatValue } from './rendering'

export function SettingsPanel({
  config,
  baselineConfig,
  onChange,
  preset,
  onPresetChange,
  onSaveAs,
  onDeleteCustom,
  customConfigs,
  closing,
}: {
  config: GameConfig
  baselineConfig: GameConfig
  onChange: (key: keyof GameConfig, value: number | string | boolean) => void
  preset: string
  onPresetChange: (name: string) => void
  onSaveAs: (name: string) => void
  onDeleteCustom: (name: string) => void
  customConfigs: Record<string, Partial<GameConfig>>
  closing?: boolean
}) {
  const [saveFlash, setSaveFlash] = useState(false)

  const sections = CONFIG_FIELDS.reduce<Record<string, typeof CONFIG_FIELDS>>(
    (acc, field) => {
      ;(acc[field.section] ??= []).push(field)
      return acc
    },
    {},
  )

  return (
    <div
      className={`absolute top-14 right-0 z-40 max-h-[calc(100vh-5rem)] w-full overflow-y-auto rounded-lg bg-gray-900/95 text-gray-200 shadow-xl backdrop-blur-sm sm:right-4 sm:w-72 ${closing ? 'soccer-settings-slide-out' : 'soccer-settings-slide-in'}`}
    >
      <div className="sticky top-0 space-y-2 bg-gray-900/95 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Game Settings
          </span>
          <button
            onClick={() => {
              const name = window.prompt('Config name:')
              if (!name?.trim()) return
              onSaveAs(name.trim())
              setSaveFlash(true)
            }}
            onAnimationEnd={() => setSaveFlash(false)}
            title="Save current settings as a named config"
            className={`cursor-pointer rounded px-2 py-0.5 text-xs text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200 ${saveFlash ? 'soccer-btn-flash-green' : ''}`}
          >
            Save As
          </button>
        </div>
        <div className="flex gap-1">
          <select
            value={preset}
            onChange={(e) => onPresetChange(e.target.value)}
            className="min-w-0 flex-1 cursor-pointer rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-blue-500 focus:outline-none"
          >
            {Object.entries(PRESETS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
            {Object.keys(customConfigs).length > 0 && (
              <optgroup label="Custom">
                {Object.keys(customConfigs).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {!(preset in PRESETS) && preset in customConfigs && (
            <button
              onClick={() => onDeleteCustom(preset)}
              title="Delete this custom config"
              className="cursor-pointer rounded border border-gray-700 bg-gray-800 px-1.5 text-xs text-red-400 hover:bg-red-900/30 hover:text-red-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {Object.entries(sections).map(([section, fields]) => (
        <div key={section} className="border-t border-gray-700/50 px-3 py-2">
          <div className="mb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase select-none">
            {section}
          </div>
          {fields.map((field) => {
            const isModified = config[field.key] !== baselineConfig[field.key]
            return (
              <label key={field.key} className="mb-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {isModified && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          onChange(field.key, baselineConfig[field.key])
                        }}
                        title="Reset to preset default"
                        className="cursor-pointer text-[11px] text-gray-500 transition-colors hover:text-gray-300"
                      >
                        ↩
                      </button>
                    )}
                    <span
                      className="text-[11px] text-gray-400"
                      title={field.tooltip}
                    >
                      {field.label}
                    </span>
                  </div>
                  <span className="min-w-[3.5rem] text-right font-mono text-[11px] text-gray-300">
                    {formatValue(config[field.key] as number, field.step)}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={config[field.key] as number}
                  onChange={(e) =>
                    onChange(field.key, parseFloat(e.target.value))
                  }
                  className="soccer-slider h-1.5 w-full cursor-pointer appearance-none rounded bg-gray-700"
                />
              </label>
            )
          })}
        </div>
      ))}

      {/* Visual section */}
      <div className="border-t border-gray-700/50 px-3 py-2">
        <div className="mb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          Visual
        </div>
        <label className="mb-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] text-gray-400"
              title="Dead zone at the bottom of the screen (desktop only). Keeps the cursor away from the OS taskbar."
            >
              Ground Buffer
            </span>
            <span className="min-w-[3.5rem] text-right font-mono text-[11px] text-gray-300">
              {config.bottomBuffer}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={config.bottomBuffer}
            onChange={(e) =>
              onChange('bottomBuffer', parseFloat(e.target.value))
            }
            className="soccer-slider h-1.5 w-full cursor-pointer appearance-none rounded bg-gray-700"
          />
        </label>
        <div className="mb-2">
          <span className="text-[11px] text-gray-400">Overlay Color</span>
          <div className="soccer-color-picker mt-1">
            <HexAlphaColorPicker
              color={config.overlayColor}
              onChange={(c) => onChange('overlayColor', c)}
            />
          </div>
        </div>
      </div>

      {/* Debug section */}
      <div className="border-t border-gray-700/50 px-3 py-2">
        <div className="mb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          Debug
        </div>
        <label className="mb-2 flex cursor-pointer items-center justify-between gap-2">
          <span
            className="text-[11px] text-gray-400"
            title="Show performance overlay with FPS, frame timing, memory usage, and effect counts."
          >
            Performance HUD
          </span>
          <input
            type="checkbox"
            checked={config.showPerfHUD}
            onChange={(e) => onChange('showPerfHUD', e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-gray-600 bg-gray-700 accent-blue-500"
          />
        </label>
      </div>

      <style>{`
        @keyframes btn-flash-green {
          0%   { background-color: transparent; box-shadow: none; }
          30%  { background-color: rgba(34, 197, 94, 0.35); box-shadow: inset 0 0 0 1.5px rgba(34, 197, 94, 0.8); }
          60%  { background-color: rgba(34, 197, 94, 0.1); box-shadow: inset 0 0 0 1.5px rgba(34, 197, 94, 0.6); }
          100% { background-color: transparent; box-shadow: none; }
        }
        .soccer-btn-flash-green { animation: btn-flash-green 0.6s ease-out; }
        .soccer-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .soccer-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #3b82f6;
          border: none;
          cursor: pointer;
        }
        .soccer-color-picker .react-colorful {
          width: 100%;
          height: 120px;
        }
        .soccer-color-picker .react-colorful__saturation {
          border-radius: 4px 4px 0 0;
        }
        .soccer-color-picker .react-colorful__hue,
        .soccer-color-picker .react-colorful__alpha {
          height: 10px;
          border-radius: 0;
        }
        .soccer-color-picker .react-colorful__last-control {
          border-radius: 0 0 4px 4px;
        }
        .soccer-color-picker .react-colorful__pointer {
          width: 12px;
          height: 12px;
        }
      `}</style>
    </div>
  )
}
