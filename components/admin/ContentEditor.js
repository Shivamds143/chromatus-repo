'use client';

import { useState } from 'react';
import MediaPickerButton from './MediaPickerButton';

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function blankTemplate(sample) {
  if (Array.isArray(sample)) return [];
  if (isPlainObject(sample)) {
    const out = {};
    for (const k of Object.keys(sample)) out[k] = blankTemplate(sample[k]);
    return out;
  }
  if (typeof sample === 'number') return 0;
  if (typeof sample === 'boolean') return false;
  return '';
}

function prettyLabel(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function isImageKey(key) {
  return /image|photo|picture|icon(?!Name)/i.test(key) === true && !/iconName|iconLabel/i.test(key);
}

function isLongTextKey(key) {
  return /body|lead|description|summary|text|content|bio|about/i.test(key);
}

function ArrayEditor({ label, value, onChange }) {
  const [collapsed, setCollapsed] = useState(() => new Set());
  const itemsAreObjects = value.length > 0 && isPlainObject(value[0]);
  const itemsArePrimitive = value.length === 0 || typeof value[0] !== 'object';

  function move(index, dir) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function removeAt(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addItem() {
    const template = value.length > 0 ? blankTemplate(value[0]) : '';
    onChange([...value, template]);
  }

  function updateAt(index, newVal) {
    const next = [...value];
    next[index] = newVal;
    onChange(next);
  }

  function toggleCollapsed(i) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-inkgray uppercase tracking-wide">{label} ({value.length})</p>
        <button
          type="button"
          onClick={addItem}
          className="text-xs font-semibold text-brandblue hover:text-brandblue-dark"
        >
          + Add item
        </button>
      </div>

      {value.length === 0 && <p className="text-xs text-inkgray italic">No items yet.</p>}

      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-3 py-2">
              <button
                type="button"
                onClick={() => toggleCollapsed(i)}
                className="text-sm font-medium text-navy flex items-center gap-2"
              >
                <span className="text-inkgray">{collapsed.has(i) ? '▸' : '▾'}</span>
                {itemsAreObjects
                  ? (item.title || item.label || item.name || item.eyebrow || `Item ${i + 1}`)
                  : (typeof item === 'string' ? (item || `Item ${i + 1}`) : `Item ${i + 1}`)}
              </button>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-xs px-1.5 py-0.5 rounded hover:bg-gray-100 disabled:opacity-30" title="Move up">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="text-xs px-1.5 py-0.5 rounded hover:bg-gray-100 disabled:opacity-30" title="Move down">↓</button>
                <button type="button" onClick={() => removeAt(i)} className="text-xs px-1.5 py-0.5 rounded text-red-600 hover:bg-red-50" title="Remove">✕</button>
              </div>
            </div>
            {!collapsed.has(i) && (
              <div className="px-3 pb-3">
                {itemsArePrimitive ? (
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateAt(i, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
                  />
                ) : (
                  <FieldEditor label="" value={item} onChange={(v) => updateAt(i, v)} nested />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectEditor({ value, onChange }) {
  function updateKey(key, newVal) {
    onChange({ ...value, [key]: newVal });
  }

  return (
    <div className="space-y-4">
      {Object.keys(value).map((key) => (
        <FieldEditor key={key} label={prettyLabel(key)} fieldKey={key} value={value[key]} onChange={(v) => updateKey(key, v)} />
      ))}
    </div>
  );
}

export default function FieldEditor({ label, fieldKey = '', value, onChange, nested = false }) {
  if (Array.isArray(value)) {
    return <ArrayEditor label={label} value={value} onChange={onChange} />;
  }

  if (isPlainObject(value)) {
    return (
      <div className={nested ? '' : 'border border-gray-200 rounded-lg p-3'}>
        {label && <p className="text-xs font-semibold text-inkgray uppercase tracking-wide mb-2">{label}</p>}
        <ObjectEditor value={value} onChange={onChange} />
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-navy">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    );
  }

  if (typeof value === 'number') {
    return (
      <div>
        {label && <label className="block text-xs font-medium text-inkgray mb-1">{label}</label>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
        />
      </div>
    );
  }

  // string (or null/undefined -> treat as text)
  const strValue = value ?? '';

  if (isImageKey(fieldKey)) {
    return (
      <div>
        <label className="block text-xs font-medium text-inkgray mb-1">{label}</label>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          {strValue && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={strValue} alt="" className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 object-cover rounded-lg border border-gray-200 bg-white" />
          )}
          <input
            type="text"
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/… or https://…"
            className="flex-1 min-w-[180px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
          />
          <MediaPickerButton onSelect={(url) => onChange(url)} />
        </div>
      </div>
    );
  }

  if (isLongTextKey(fieldKey) || strValue.length > 120) {
    return (
      <div>
        {label && <label className="block text-xs font-medium text-inkgray mb-1">{label}</label>}
        <textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
        />
      </div>
    );
  }

  return (
    <div>
      {label && <label className="block text-xs font-medium text-inkgray mb-1">{label}</label>}
      <input
        type="text"
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
      />
    </div>
  );
}
