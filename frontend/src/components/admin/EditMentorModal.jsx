import { useState, useEffect } from "react";
import * as adminApi from "../../api/admin";

export function EditMentorModal({ open, mentor, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [experience, setExperience] = useState(0);
  const [linkedin, setLinkedin] = useState("");

  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  const [expertise, setExpertise] = useState([]);
  const [newExpertise, setNewExpertise] = useState("");

  useEffect(() => {
    if (mentor) {
      setBio(mentor.bio || "");
      setCompany(mentor.company || "");
      setDesignation(mentor.designation || "");
      setExperience(mentor.experience || 0);
      setLinkedin(mentor.linkedin || "");
      setTags(Array.isArray(mentor.tags) ? [...mentor.tags] : []);
      setExpertise(Array.isArray(mentor.expertise) ? [...mentor.expertise] : []);
      setError("");
    }
  }, [mentor]);

  if (!open || !mentor) return null;

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddExpertise = () => {
    const trimmed = newExpertise.trim();
    if (trimmed && !expertise.includes(trimmed)) {
      setExpertise([...expertise, trimmed]);
      setNewExpertise("");
    }
  };

  const handleRemoveExpertise = (expToRemove) => {
    setExpertise(expertise.filter((e) => e !== expToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const mentorId = mentor.id || mentor._id;
      const updated = await adminApi.updateMentorMetadata(mentorId, {
        bio,
        company,
        designation,
        experience: Number(experience) || 0,
        linkedin,
        tags,
        expertise,
      });

      onSuccess?.(updated);
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to update mentor metadata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-[92%] max-w-xl max-h-[85vh] flex flex-col rounded-xl border border-white/[0.1] bg-navy-900 p-6 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-mentor-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0 border-b border-white/[0.08] pb-3">
          <div>
            <h3 id="edit-mentor-title" className="text-lg font-semibold text-ink-50">
              Manage Mentor Metadata
            </h3>
            <p className="text-xs text-ink-400">
              Update tags, bio description, expertise, and profile details for{" "}
              <span className="text-emerald-400 font-medium">{mentor.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="mq-btn-icon"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mq-scroll">
            {/* Bio / Description */}
            <div>
              <label className="block text-xs font-semibold text-ink-400 mb-1">
                Bio / Description
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief mentor bio and background..."
                className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-xs text-ink-50 placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Tags Management */}
            <div>
              <label className="block text-xs font-semibold text-ink-400 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-medium text-emerald-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag (e.g. Node.js, Azure)..."
                  className="flex-1 rounded-lg border border-white/10 bg-navy-800 px-3 py-1.5 text-xs text-ink-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="mq-btn-secondary h-8 text-xs px-3"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Expertise Management */}
            <div>
              <label className="block text-xs font-semibold text-ink-400 mb-1">
                Expertise Areas
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {expertise.map((exp) => (
                  <span
                    key={exp}
                    className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 text-[11px] font-medium text-sky-400"
                  >
                    {exp}
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(exp)}
                      className="hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                  placeholder="Add expertise (e.g. Full Stack Development)..."
                  className="flex-1 rounded-lg border border-white/10 bg-navy-800 px-3 py-1.5 text-xs text-ink-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddExpertise}
                  className="mq-btn-secondary h-8 text-xs px-3"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Company & Designation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-400 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-xs text-ink-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-400 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-xs text-ink-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Experience & LinkedIn */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-400 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-xs text-ink-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-400 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-xs text-ink-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex gap-2 pt-4 shrink-0 border-t border-white/[0.08] mt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mq-btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="mq-btn-primary flex-1"
            >
              {loading ? "Saving..." : "Save Metadata"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
