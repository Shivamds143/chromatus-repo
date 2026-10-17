'use client';

import { useState, useRef } from 'react';
import MediaPickerButton from './MediaPickerButton';

function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function LeadershipTeamEditor({ value, onChange }) {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRefs = useRef({});

  const data = value || {};
  const members = Array.isArray(data.members) ? data.members : [];

  function updateField(key, val) {
    onChange({ ...data, [key]: val });
  }

  function updateMember(index, field, val) {
    const nextMembers = [...members];
    nextMembers[index] = { ...nextMembers[index], [field]: val };
    onChange({ ...data, members: nextMembers });
  }

  function addMember() {
    const newMember = {
      name: '',
      role: '',
      photo: '',
      linkedin_url: '',
      bio: '',
      expertise: '',
      icon: 'target',
    };
    onChange({ ...data, members: [...members, newMember] });
  }

  function removeMember(index) {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    const nextMembers = members.filter((_, i) => i !== index);
    onChange({ ...data, members: nextMembers });
  }

  function moveMember(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= members.length) return;
    const nextMembers = [...members];
    [nextMembers[index], nextMembers[target]] = [nextMembers[target], nextMembers[index]];
    onChange({ ...data, members: nextMembers });
  }

  async function handleDirectPhotoUpload(index, file) {
    if (!file) return;
    setUploadError('');
    setUploadingIndex(index);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (!res.ok || !result.url) {
        setUploadError(result.error || 'Photo upload failed. Please try again.');
      } else {
        updateMember(index, 'photo', result.url);
      }
    } catch {
      setUploadError('Network error uploading photo. Please try again.');
    } finally {
      setUploadingIndex(null);
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index].value = '';
      }
    }
  }

  const photosCount = members.filter((m) => m.photo).length;
  const linkedinCount = members.filter((m) => m.linkedin_url || m.linkedin).length;

  return (
    <div className="space-y-8">
      {/* Overview Status Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-brandblue/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-navy flex items-center gap-2">
            <span>👥</span> Leadership Team Directory
          </h2>
          <p className="text-xs text-inkgray mt-0.5">
            Manage executive profiles, upload high-resolution profile photos, and link each member to their verified LinkedIn profile.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-navy border border-gray-200 shadow-2xs">
            {members.length} Members
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            {photosCount} Photos
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
            {linkedinCount} LinkedIns
          </span>
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Page Header Meta */}
      <div className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white space-y-4">
        <h3 className="text-xs font-bold text-inkgray uppercase tracking-wider">Page Header Settings</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-navy">Eyebrow Tag</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  title="Eyebrow color"
                  value={data.eyebrowColor || '#1F82C5'}
                  onChange={(e) => updateField('eyebrowColor', e.target.value)}
                  className="h-6 w-6 rounded border border-gray-200 cursor-pointer p-0"
                />
                {data.eyebrowColor && (
                  <button
                    type="button"
                    onClick={() => updateField('eyebrowColor', '')}
                    className="text-[10px] text-inkgray hover:text-red-600 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <input
              type="text"
              value={data.eyebrow || ''}
              onChange={(e) => updateField('eyebrow', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
              placeholder="ABOUT US / LEADERSHIP TEAM"
            />
            {data.eyebrow && (
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[10px] text-inkgray">Preview:</span>
                <span
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-gray-50 border border-gray-200"
                  style={{ color: data.eyebrowColor || 'var(--color-eyebrow, #1F82C5)' }}
                >
                  {data.eyebrow}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Page Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
              placeholder="Leadership Team"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">Lead Summary</label>
          <textarea
            value={data.lead || ''}
            onChange={(e) => updateField('lead', e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
            placeholder="The operators, technologists, and researchers who lead Chromatus..."
          />
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
              Leadership Profiles ({members.length})
            </h3>
            <p className="text-xs text-inkgray mt-0.5">
              Click on an uploaded photo to test the direct LinkedIn redirect.
            </p>
          </div>
          <button
            type="button"
            onClick={addMember}
            className="inline-flex items-center gap-1.5 bg-brandblue hover:bg-brandblue-dark text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-xs"
          >
            <span>+ Add New Leader</span>
          </button>
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6">
            <p className="text-sm text-inkgray">No leadership members configured yet.</p>
            <button
              type="button"
              onClick={addMember}
              className="mt-3 text-xs font-semibold text-brandblue hover:underline"
            >
              + Add the first member
            </button>
          </div>
        )}

        <div className="space-y-4">
          {members.map((member, i) => {
            const memberPhoto = member.photo || member.profile_photo || member.image || '';
            const memberLinkedIn = member.linkedin_url || member.linkedin || '';
            const initials = getInitials(member.name);

            return (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden transition hover:border-gray-300"
              >
                {/* Member Top Bar */}
                <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-navy/10 text-navy font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-sm text-navy truncate">
                      {member.name || `Leader #${i + 1}`}
                    </span>
                    {member.role && (
                      <span className="text-xs text-inkgray truncate hidden sm:inline">
                        — {member.role}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => moveMember(i, -1)}
                      disabled={i === 0}
                      className="text-xs px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition"
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMember(i, 1)}
                      disabled={i === members.length - 1}
                      className="text-xs px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30 transition"
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                      title="Remove Member"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>

                {/* Member Edit Form */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Photo Uploader & LinkedIn Direct Click Preview */}
                  <div className="lg:col-span-4 flex flex-col items-center text-center p-4 rounded-xl bg-gray-50/60 border border-gray-100">
                    <span className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
                      Profile Photo
                    </span>

                    {/* Avatar Preview with LinkedIn Direct Click */}
                    <div className="relative group mb-3">
                      {memberLinkedIn ? (
                        <a
                          href={memberLinkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Click to test LinkedIn profile redirect"
                          className="block relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-brandblue/30 shadow-sm cursor-pointer hover:ring-4 hover:ring-brandblue/20 transition"
                        >
                          {memberPhoto ? (
                            <img
                              src={memberPhoto}
                              alt={member.name || 'Profile photo'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-navy text-white flex flex-col items-center justify-center font-bold text-xl">
                              {initials}
                              <span className="text-[9px] font-normal opacity-70">No photo</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="text-[10px] text-white font-semibold flex items-center gap-1 bg-brandblue/90 px-2 py-1 rounded-full">
                              <span>🔗</span> Open In
                            </span>
                          </div>
                        </a>
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm bg-navy text-white flex flex-col items-center justify-center font-bold text-xl">
                          {memberPhoto ? (
                            <img
                              src={memberPhoto}
                              alt={member.name || 'Profile photo'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              {initials}
                              <span className="text-[9px] font-normal opacity-70">No photo</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* LinkedIn Badge Overlay */}
                      {memberLinkedIn && (
                        <span
                          className="absolute bottom-0 right-1 bg-[#0A66C2] text-white rounded-full p-1 shadow-sm flex items-center justify-center"
                          title="LinkedIn profile linked"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.49 1.49 0 1 0 0-2.98 1.49 1.49 0 0 0 0 2.98M7.86 18.5v-8.37H5.07v8.37h2.79z" />
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Direct Upload Controls */}
                    <div className="w-full space-y-2 mt-1">
                      <div className="flex items-center justify-center gap-2">
                        <label className="inline-flex items-center gap-1 text-xs font-semibold bg-navy hover:bg-navy-dark text-white px-3 py-1.5 rounded-lg cursor-pointer transition shadow-2xs">
                          <span>
                            {uploadingIndex === i ? 'Uploading…' : memberPhoto ? 'Change Photo' : 'Upload Photo'}
                          </span>
                          <input
                            ref={(el) => (fileInputRefs.current[i] = el)}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(e) => handleDirectPhotoUpload(i, e.target.files?.[0])}
                            className="hidden"
                            disabled={uploadingIndex === i}
                          />
                        </label>
                        <MediaPickerButton onSelect={(url) => updateMember(i, 'photo', url)} />
                      </div>

                      {memberPhoto && (
                        <button
                          type="button"
                          onClick={() => updateMember(i, 'photo', '')}
                          className="text-[11px] text-red-600 hover:underline block mx-auto"
                        >
                          Remove photo
                        </button>
                      )}

                      <p className="text-[10px] text-inkgray mt-2 leading-tight">
                        PNG or JPG recommended. Click on the photo above to test the LinkedIn profile link.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Member Details & LinkedIn URL */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={member.name || ''}
                          onChange={(e) => updateMember(i, 'name', e.target.value)}
                          placeholder="e.g. Vijay Natekar"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          Role / Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={member.role || ''}
                          onChange={(e) => updateMember(i, 'role', e.target.value)}
                          placeholder="e.g. Managing Director"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
                        />
                      </div>
                    </div>

                    {/* LinkedIn Profile URL with Test Button */}
                    <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-navy flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-[#0A66C2] text-white flex items-center justify-center text-[10px] font-bold">
                            in
                          </span>
                          <span>LinkedIn Profile URL</span>
                        </label>
                        {memberLinkedIn && (
                          <a
                            href={memberLinkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0A66C2] hover:underline"
                          >
                            <span>Test LinkedIn profile</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={memberLinkedIn}
                          onChange={(e) => {
                            const next = e.target.value;
                            updateMember(i, 'linkedin_url', next);
                            updateMember(i, 'linkedin', next);
                          }}
                          placeholder="https://www.linkedin.com/in/username"
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                        />
                      </div>

                      <p className="text-[11px] text-inkgray">
                        When visitors click on this member&apos;s photo on the website, this LinkedIn profile will open in a new tab.
                      </p>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">
                        Professional Biography &amp; Background
                      </label>
                      <textarea
                        value={member.bio || ''}
                        onChange={(e) => updateMember(i, 'bio', e.target.value)}
                        rows={3}
                        placeholder="Detail the leader's experience, specialization, and contributions..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
                      />
                    </div>

                    {/* Areas of Expertise */}
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">
                        Areas of Expertise (Comma-separated tags)
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(member.expertise)
                            ? member.expertise.join(', ')
                            : member.expertise || ''
                        }
                        onChange={(e) => updateMember(i, 'expertise', e.target.value)}
                        placeholder="Market Research, Product Testing, B2B Research, Process Design"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandblue"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addMember}
          className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-brandblue hover:bg-blue-50/30 text-navy font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
        >
          <span>+ Add Another Team Member</span>
        </button>
      </div>
    </div>
  );
}
