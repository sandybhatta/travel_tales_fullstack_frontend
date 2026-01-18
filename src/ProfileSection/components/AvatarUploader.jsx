import React, { useState, useEffect } from "react";

/**
 * Component for selecting and previewing an avatar image.
 * Includes client-side validation for file size and type.
 *
 * @param {Object} props
 * @param {string} props.currentAvatarUrl - The URL of the current avatar.
 * @param {Function} props.onFileSelect - Callback when a valid file is selected.
 * @param {string} props.error - External error message.
 */
const AvatarUploader = ({ currentAvatarUrl, onFileSelect, error: externalError }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [internalError, setInternalError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateFile = (file) => {
    const MAX_SIZE = 9.99 * 1024 * 1024; // 9.99 MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, and WebP formats are allowed.";
    }

    if (file.size > MAX_SIZE) {
      return "File size must be less than 10MB.";
    }

    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setInternalError(validationError);
      onFileSelect(null); // Clear selection in parent
      return;
    }

    setInternalError("");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelect(file);
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-red-500/40 bg-gray-100 flex items-center justify-center">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <i className="bx bx-user text-2xl text-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <label
          htmlFor="avatar-upload"
          className="block text-xs font-semibold text-gray-600 mb-1"
        >
          Profile photo
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        {(internalError || externalError) && (
          <p className="mt-1 text-[11px] text-red-500">
            {internalError || externalError}
          </p>
        )}
        <p className="mt-1 text-[10px] text-gray-400">
          Max 10MB. Formats: JPEG, PNG, WebP.
        </p>
      </div>
    </div>
  );
};

export default AvatarUploader;
