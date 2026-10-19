'use client';

import { useState, useRef } from 'react';
import MediaPickerButton from './MediaPickerButton';
import Icon from '../Icon';

const AVAILABLE_ICONS = [
  'compass', 'target', 'file-text', 'chart-bar', 'shield', 'badge', 'flask',
  'users', 'users-two', 'handshake', 'briefcase', 'heart', 'heart-pulse',
  'factory', 'chip', 'code', 'database', 'cloud', 'trending-up', 'award',
  'book', 'document', 'graduation-cap', 'mail', 'refresh', 'settings', 'map-pin',
  'folder', 'play', 'gift', 'shopping-bag'
];

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

const CUSTOM_SECTION_LABELS = {
  hero: 'Hero Section',
  servicesAndCapabilities: 'Services & Capabilities',
  capabilities: 'Services & Capabilities',
  ourApproach: 'Our Approach',
  about: 'Why Chromatus',
  clientPerspectives: 'Client Perspectives',
  clientPerspective: 'Client Perspectives',
  chromatusPro: 'Chromatus Pro Banner',
};

function prettyLabel(key) {
  if (CUSTOM_SECTION_LABELS[key]) return CUSTOM_SECTION_LABELS[key];
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

function isLinkedInKey(key) {
  return /linkedin/i.test(key);
}

function isHeadingKey(key) {
  return /heading|title|stage/i.test(key) && !/metricsTitle|tilesTitle|stepsTitle/i.test(key);
}

function isEyebrowKey(key) {
  return /eyebrow/i.test(key);
}

function isColorKey(key) {
  return /color/i.test(key);
}

// ---------------------------------------------------------------------------
// Text formatting toolbar for textareas (Bold, Headline, Italic, Bullet)
// ---------------------------------------------------------------------------
function TextareaWithToolbar({ value, onChange, label, rows = 4, placeholder = '' }) {
  const textareaRef = useRef(null);

  function wrapSelection(prefix, suffix = prefix, defaultPlaceholder = 'text') {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.substring(start, end) || defaultPlaceholder;
    const next = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    onChange(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  }

  function insertBoldHeadline() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.substring(start, end) || 'Headline';
    const prefix = start > 0 && !value.substring(0, start).endsWith('\n') ? '\n\n**' : '**';
    const suffix = ':** ';
    const next = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    onChange(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        {label && <label className="block text-xs font-medium text-inkgray">{label}</label>}
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5 border border-gray-200">
          <button
            type="button"
            title="Make Bold (**text**)"
            onClick={() => wrapSelection('**', '**', 'bold text')}
            className="px-2 py-0.5 text-xs font-bold text-navy hover:bg-white rounded transition shadow-2xs"
          >
            B
          </button>
          <button
            type="button"
            title="Insert Bold Headline (**Headline:**)"
            onClick={insertBoldHeadline}
            className="px-2 py-0.5 text-xs font-bold text-brandorange hover:bg-white rounded transition shadow-2xs flex items-center gap-0.5"
          >
            <span>H</span>
            <span className="text-[9px] uppercase tracking-tighter">Bold</span>
          </button>
          <button
            type="button"
            title="Italic (*text*)"
            onClick={() => wrapSelection('*', '*', 'italic text')}
            className="px-2 py-0.5 text-xs italic text-navy hover:bg-white rounded transition shadow-2xs"
          >
            I
          </button>
          <button
            type="button"
            title="Bullet point (• text)"
            onClick={() => wrapSelection('• ', '\n', 'point')}
            className="px-2 py-0.5 text-xs font-semibold text-navy hover:bg-white rounded transition shadow-2xs"
          >
            •
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue font-sans leading-relaxed"
      />
      <div className="flex items-center justify-between text-[11px] text-inkgray/80 mt-1">
        <span>Formatting: Use <strong>**bold**</strong> for bold text or headlines</span>
        {value.length > 0 && <span>{value.length} characters</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Specialized Section item editor (Headline + Body with bold headline option)
// ---------------------------------------------------------------------------
function SectionItemEditor({ value, onChange }) {
  const isSection = isPlainObject(value) && ('heading' in value || 'body' in value);
  if (!isSection) return null;

  const heading = value.heading ?? '';
  const body = value.body ?? '';

  return (
    <div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-navy uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-brandorange rounded-full inline-block" />
            Headline (Bold)
          </label>
          <span className="text-[10px] uppercase font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
            Bold Headline
          </span>
        </div>
        <input
          type="text"
          value={heading}
          onChange={(e) => onChange({ ...value, heading: e.target.value })}
          placeholder="e.g. Who we are, How we work, What we help answer"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
        />
      </div>

      <TextareaWithToolbar
        label="Section Content"
        value={body}
        onChange={(v) => onChange({ ...value, body: v })}
        rows={3}
        placeholder="Enter section paragraph..."
      />

      {/* Mini live preview */}
      {(heading || body) && (
        <div className="mt-2 p-2.5 rounded-lg bg-bglight/60 border border-gray-100 text-xs">
          <p className="font-bold text-navy text-[13px] flex items-center gap-1.5">
            <span className="w-1 h-3 bg-brandorange rounded-full" />
            {heading || 'Headline Preview'}
          </p>
          <p className="text-inkgray mt-1 line-clamp-2 leading-relaxed">
            {body || 'Paragraph text will appear here...'}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual Box Card Editors (Metrics, Tiles, Steps)
// ---------------------------------------------------------------------------
function MetricBoxEditor({ metric, onChange }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-inkgray mb-0.5">Stat / Number (e.g. 25+)</label>
          <input
            type="text"
            value={metric.value || ''}
            onChange={(e) => onChange({ ...metric, value: e.target.value })}
            placeholder="e.g. 25+, 350+, 100%"
            className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-inkgray mb-0.5">Label / Title (e.g. Years Experience)</label>
          <input
            type="text"
            value={metric.label || ''}
            onChange={(e) => onChange({ ...metric, label: e.target.value })}
            placeholder="e.g. Years Experience, Research Topics"
            className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-inkgray mb-0.5">Detail / Subtext</label>
        <input
          type="text"
          value={metric.detail || ''}
          onChange={(e) => onChange({ ...metric, detail: e.target.value })}
          placeholder="e.g. Quantitative & qualitative research depth"
          className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-inkgray focus:outline-none focus:ring-2 focus:ring-brandblue"
        />
      </div>
    </div>
  );
}

function TileBoxEditor({ tile, onChange }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
      <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <Icon name={tile.icon || 'target'} className="h-4 w-4" />
          </div>
          <select
            value={tile.icon || 'target'}
            onChange={(e) => onChange({ ...tile, icon: e.target.value })}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
          >
            {AVAILABLE_ICONS.map((ic) => (
              <option key={ic} value={ic}>{ic}</option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            value={tile.label || ''}
            onChange={(e) => onChange({ ...tile, label: e.target.value })}
            placeholder="Box Title / Capability Name (e.g. Primary Field Studies)"
            className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
          />
        </div>
      </div>
      <div>
        <input
          type="text"
          value={tile.description || ''}
          onChange={(e) => onChange({ ...tile, description: e.target.value })}
          placeholder="Description (e.g. Surveys, CATI/CAPI & ground investigations)"
          className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-inkgray focus:outline-none focus:ring-2 focus:ring-brandblue"
        />
      </div>
    </div>
  );
}

function StepBoxEditor({ step, index, onChange }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
      <div className="grid grid-cols-[70px_auto_1fr] gap-2 items-center">
        <div>
          <input
            type="text"
            value={step.stage || `0${index + 1}`}
            onChange={(e) => onChange({ ...step, stage: e.target.value })}
            placeholder="01"
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs font-mono font-bold text-brandorange text-center focus:outline-none focus:ring-2 focus:ring-brandblue"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <Icon name={step.icon || 'target'} className="h-4 w-4" />
          </div>
          <select
            value={step.icon || 'target'}
            onChange={(e) => onChange({ ...step, icon: e.target.value })}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
          >
            {AVAILABLE_ICONS.map((ic) => (
              <option key={ic} value={ic}>{ic}</option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            value={step.title || ''}
            onChange={(e) => onChange({ ...step, title: e.target.value })}
            placeholder="Step Title (e.g. Define What Matters)"
            className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
          />
        </div>
      </div>
      <div>
        <input
          type="text"
          value={step.text || step.body || ''}
          onChange={(e) => onChange({ ...step, text: e.target.value, body: e.target.value })}
          placeholder="Step description or detail..."
          className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-inkgray focus:outline-none focus:ring-2 focus:ring-brandblue"
        />
      </div>
    </div>
  );
}

function ArrayEditor({ label, fieldKey = '', value, onChange }) {
  const [collapsed, setCollapsed] = useState(() => new Set());
  const itemsAreObjects = value.length > 0 && isPlainObject(value[0]);
  const itemsArePrimitive = value.length === 0 || typeof value[0] !== 'object';
  const isSectionsArray = fieldKey === 'sections' || (itemsAreObjects && 'heading' in (value[0] || {}));
  const isMetricsArray = fieldKey === 'metrics' || (itemsAreObjects && 'value' in (value[0] || {}) && 'detail' in (value[0] || {}));
  const isTilesArray = fieldKey === 'tiles' || (itemsAreObjects && 'icon' in (value[0] || {}) && 'description' in (value[0] || {}));
  const isStepsArray = fieldKey === 'steps' || (itemsAreObjects && 'stage' in (value[0] || {}));

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
    let template;
    if (isSectionsArray) {
      template = { heading: 'New Headline', body: '' };
    } else if (isMetricsArray) {
      template = { value: '10+', label: 'New Metric', detail: 'Description of this achievement' };
    } else if (isTilesArray) {
      template = { label: 'New Capability', icon: 'target', description: 'Brief explanation of capability' };
    } else if (isStepsArray) {
      template = { stage: `0${value.length + 1}`, title: 'New Stage', text: 'Stage description', icon: 'compass' };
    } else if (value.length > 0) {
      template = blankTemplate(value[0]);
    } else {
      template = '';
    }
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
    <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/70">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-navy uppercase tracking-wide">
            {label} ({value.length})
          </p>
          {isSectionsArray && (
            <p className="text-[11px] text-inkgray mt-0.5">
              Each section features a prominent bold headline and formatted content.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="text-xs font-semibold bg-white border border-brandblue text-brandblue hover:bg-brandblue hover:text-white px-2.5 py-1 rounded-full transition shadow-2xs"
        >
          + Add {isSectionsArray ? 'Section' : isMetricsArray ? 'Stat Box' : isTilesArray ? 'Capability Box' : isStepsArray ? 'Step' : 'Item'}
        </button>
      </div>

      {value.length === 0 && (
        <div className="p-4 bg-white rounded-lg border border-dashed border-gray-300 text-center">
          <p className="text-xs text-inkgray italic">No items yet.</p>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 text-xs font-semibold text-brandblue hover:underline"
          >
            + Click here to add your first item
          </button>
        </div>
      )}

      <div className="space-y-2.5">
        {value.map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-2xs transition hover:border-gray-300">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 rounded-t-lg border-b border-gray-100">
              <button
                type="button"
                onClick={() => toggleCollapsed(i)}
                className="text-xs sm:text-sm font-bold text-navy flex items-center gap-2 hover:text-brandblue text-left"
              >
                <span className="text-inkgray text-xs">{collapsed.has(i) ? '▸' : '▾'}</span>
                {isSectionsArray && (
                  <span className="text-brandorange">#{i + 1}</span>
                )}
                {itemsAreObjects
                  ? (item.heading || item.title || item.label || item.value || item.name || `Box ${i + 1}`)
                  : (typeof item === 'string' ? (item || `Paragraph ${i + 1}`) : `Item ${i + 1}`)}
              </button>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-xs px-1.5 py-0.5 rounded hover:bg-gray-200 disabled:opacity-30" title="Move up">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="text-xs px-1.5 py-0.5 rounded hover:bg-gray-200 disabled:opacity-30" title="Move down">↓</button>
                <button type="button" onClick={() => removeAt(i)} className="text-xs px-1.5 py-0.5 rounded text-red-600 hover:bg-red-50 font-semibold" title="Remove">✕</button>
              </div>
            </div>
            {!collapsed.has(i) && (
              <div className="p-3">
                {isSectionsArray ? (
                  <SectionItemEditor value={item} onChange={(v) => updateAt(i, v)} />
                ) : isMetricsArray ? (
                  <MetricBoxEditor metric={item} onChange={(v) => updateAt(i, v)} />
                ) : isTilesArray ? (
                  <TileBoxEditor tile={item} onChange={(v) => updateAt(i, v)} />
                ) : isStepsArray ? (
                  <StepBoxEditor step={item} index={i} onChange={(v) => updateAt(i, v)} />
                ) : itemsArePrimitive ? (
                  <TextareaWithToolbar
                    label={`Paragraph ${i + 1}`}
                    value={item}
                    onChange={(v) => updateAt(i, v)}
                    rows={2}
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
    if (newVal === undefined) {
      const next = { ...value };
      delete next[key];
      onChange(next);
    } else {
      onChange({ ...value, [key]: newVal });
    }
  }

  const hasEyebrow = 'eyebrow' in value || 'cardEyebrow' in value;

  return (
    <div className="space-y-4">
      {Object.keys(value).map((key) => (
        <FieldEditor
          key={key}
          label={prettyLabel(key)}
          fieldKey={key}
          value={value[key]}
          onChange={(v) => updateKey(key, v)}
          nested
        />
      ))}

      {hasEyebrow && !('eyebrowColor' in value) && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => updateKey('eyebrowColor', '#1F82C5')}
            className="text-xs font-semibold text-brandblue hover:underline flex items-center gap-1.5"
          >
            <span>🎨</span> Customize eyebrow color for this section
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick toolbar for adding visual boxes to ANY page
// ---------------------------------------------------------------------------
function AddVisualBoxesToolbar({ value, onChange }) {
  const hasMetrics = 'metrics' in value && Array.isArray(value.metrics);
  const hasTiles = 'tiles' in value && Array.isArray(value.tiles);
  const hasSteps = 'steps' in value && Array.isArray(value.steps);
  const hasOutcome = 'outcomeText' in value || 'outcome' in value;

  function addMetrics() {
    onChange({
      ...value,
      metricsTitle: value.metricsTitle || 'Key Performance & Track Record',
      metrics: [
        { value: '25+', label: 'Years Experience', detail: 'Quantitative & qualitative research depth' },
        { value: '350+', label: 'Research Topics', detail: 'Knowledge base across 12 business sectors' },
        { value: '60+', label: 'Field Officers', detail: 'On-ground investigation network across India' },
        { value: '8+', label: 'Core Verticals', detail: 'Deep industry-specialized practice teams' }
      ]
    });
  }

  function removeMetrics() {
    if (!confirm('Remove the stat boxes section?')) return;
    const next = { ...value };
    delete next.metrics;
    delete next.metricsTitle;
    onChange(next);
  }

  function addTiles() {
    onChange({
      ...value,
      tilesTitle: value.tilesTitle || 'Core Capabilities',
      tiles: [
        { label: 'Primary Field Studies', icon: 'compass', description: 'Surveys, CATI/CAPI & ground investigations' },
        { label: 'Secondary Synthesis', icon: 'file-text', description: 'Market data & competitive intelligence' },
        { label: 'Market Engineering', icon: 'chart-bar', description: 'Gap analysis, forecasting & pricing models' },
        { label: 'Executive Strategy', icon: 'target', description: 'Directives built for board-level decisions' }
      ]
    });
  }

  function removeTiles() {
    if (!confirm('Remove the capability boxes section?')) return;
    const next = { ...value };
    delete next.tiles;
    delete next.tilesTitle;
    onChange(next);
  }

  function addSteps() {
    onChange({
      ...value,
      stepsTitle: value.stepsTitle || 'Engagement Flow',
      steps: [
        { stage: '01', title: 'Define What Matters', text: 'Clarify the core business question behind the brief.', icon: 'target' },
        { stage: '02', title: 'Build the Evidence', text: 'Multi-modal primary fieldwork and secondary intelligence.', icon: 'compass' },
        { stage: '03', title: 'Test, Validate, Refine', text: 'Data sanity checks, statistical rigor & expert validation.', icon: 'shield' },
        { stage: '04', title: 'Turn Insight into Action', text: 'Clear conclusions, practical trade-offs & execution plans.', icon: 'chart-bar' }
      ]
    });
  }

  function removeSteps() {
    if (!confirm('Remove the process step boxes section?')) return;
    const next = { ...value };
    delete next.steps;
    delete next.stepsTitle;
    onChange(next);
  }

  function addOutcome() {
    onChange({
      ...value,
      outcomeTag: value.outcomeTag || 'Our Guiding Promise',
      outcomeText: value.outcomeText || 'We work at the intersection of research and consulting — ensuring every dataset translates directly into measurable strategic advantage.'
    });
  }

  function removeOutcome() {
    if (!confirm('Remove the guiding promise / callout banner?')) return;
    const next = { ...value };
    delete next.outcomeTag;
    delete next.outcomeText;
    delete next.outcome;
    onChange(next);
  }

  return (
    <div className="mt-8 pt-6 border-t-2 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-navy uppercase tracking-wide flex items-center gap-2">
            <span>📦</span> Visual Highlight Boxes (Page Add-ons)
          </h3>
          <p className="text-xs text-inkgray mt-0.5">
            Add or manage interactive highlight boxes, stats, capability tiles, and guiding promise banners.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Stat Boxes */}
        <div className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-navy">📊 Stat / Metric Boxes</p>
            <p className="text-[11px] text-inkgray">e.g. 25+ Years Experience, 350+ Topics</p>
          </div>
          {hasMetrics ? (
            <button
              type="button"
              onClick={removeMetrics}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md border border-red-200"
            >
              ✕ Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={addMetrics}
              className="text-xs font-semibold bg-brandblue text-white hover:bg-brandblue-dark px-3 py-1.5 rounded-full transition shadow-xs"
            >
              + Add Boxes
            </button>
          )}
        </div>

        {/* Capability Tiles */}
        <div className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-navy">🧩 Feature / Capability Boxes</p>
            <p className="text-[11px] text-inkgray">Cards with icon, title, and description</p>
          </div>
          {hasTiles ? (
            <button
              type="button"
              onClick={removeTiles}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md border border-red-200"
            >
              ✕ Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={addTiles}
              className="text-xs font-semibold bg-brandblue text-white hover:bg-brandblue-dark px-3 py-1.5 rounded-full transition shadow-xs"
            >
              + Add Boxes
            </button>
          )}
        </div>

        {/* Process Steps */}
        <div className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-navy">🪜 Process / Flow Steps</p>
            <p className="text-[11px] text-inkgray">Numbered steps (01, 02) with icon &amp; description</p>
          </div>
          {hasSteps ? (
            <button
              type="button"
              onClick={removeSteps}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md border border-red-200"
            >
              ✕ Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={addSteps}
              className="text-xs font-semibold bg-brandblue text-white hover:bg-brandblue-dark px-3 py-1.5 rounded-full transition shadow-xs"
            >
              + Add Steps
            </button>
          )}
        </div>

        {/* Guiding Promise Banner */}
        <div className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-navy">💡 Guiding Promise / Callout Box</p>
            <p className="text-[11px] text-inkgray">Highlighted quote box with orange accent</p>
          </div>
          {hasOutcome ? (
            <button
              type="button"
              onClick={removeOutcome}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md border border-red-200"
            >
              ✕ Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={addOutcome}
              className="text-xs font-semibold bg-brandblue text-white hover:bg-brandblue-dark px-3 py-1.5 rounded-full transition shadow-xs"
            >
              + Add Callout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main FieldEditor Component
// ---------------------------------------------------------------------------
export default function FieldEditor({ label, fieldKey = '', value, onChange, nested = false }) {
  if (Array.isArray(value)) {
    return <ArrayEditor label={label} fieldKey={fieldKey} value={value} onChange={onChange} />;
  }

  if (isPlainObject(value)) {
    return (
      <div className={nested ? '' : 'border border-gray-200 rounded-xl p-4 sm:p-5 bg-white'}>
        {label && <p className="text-xs font-bold text-navy uppercase tracking-wide mb-3">{label}</p>}
        <ObjectEditor value={value} onChange={onChange} />
        {!nested && <AddVisualBoxesToolbar value={value} onChange={onChange} />}
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300 text-brandblue focus:ring-brandblue"
        />
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

  // String field
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

  if (isLinkedInKey(fieldKey)) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-inkgray">{label || 'LinkedIn Profile URL'}</label>
          {strValue && (
            <a
              href={strValue}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-[#0A66C2] hover:underline flex items-center gap-1"
            >
              Test LinkedIn profile ↗
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center text-xs font-bold shrink-0">
            in
          </span>
          <input
            type="url"
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://www.linkedin.com/in/username"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
          />
        </div>
      </div>
    );
  }

  // Color fields
  if (isColorKey(fieldKey)) {
    return (
      <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-navy">🎨 {label}</label>
          {strValue && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-[11px] text-inkgray hover:text-red-600 underline"
            >
              Reset to Theme Default
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={strValue || '#1F82C5'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer shrink-0"
          />
          <input
            type="text"
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#1F82C5"
            className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brandblue"
          />
          <span className="text-xs text-inkgray">Hex color code</span>
        </div>
      </div>
    );
  }

  // Eyebrow fields
  if (isEyebrowKey(fieldKey)) {
    return (
      <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/40 space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-navy">🏷️ {label} (Eyebrow Tag)</label>
          <span className="text-[10px] text-inkgray uppercase tracking-wider font-mono">Eyebrow</span>
        </div>
        <input
          type="text"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. WHAT WE DO"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
        />
        {strValue && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-inkgray uppercase tracking-wider font-semibold">Preview:</span>
            <span
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] px-2.5 py-1 rounded bg-white border border-gray-200 shadow-2xs"
              style={{ color: 'var(--color-eyebrow, #1F82C5)' }}
            >
              {strValue}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Heading / Title fields
  if (isHeadingKey(fieldKey)) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-navy">{label} (Bold Headline)</label>
          <span className="text-[10px] font-semibold text-brandorange bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
            Bold
          </span>
        </div>
        <input
          type="text"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-brandblue"
          placeholder="e.g. Who we are"
        />
      </div>
    );
  }

  // Long text / textarea fields
  if (isLongTextKey(fieldKey) || strValue.length > 120) {
    return (
      <TextareaWithToolbar
        label={label}
        value={strValue}
        onChange={onChange}
        rows={4}
      />
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
