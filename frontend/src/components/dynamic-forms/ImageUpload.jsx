/**
 * ImageUpload Component
 *
 * Drag-and-drop file upload zone for image inspiration photos
 * Supports JPEG, PNG, WEBP formats with size validation
 */

import { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * @typedef {Object} ImageUploadProps
 * @property {Object} question - Question configuration
 * @property {Function} onAnswer - Callback when image is uploaded
 * @property {Object} [currentAnswer] - Previously saved answer
 * @property {boolean} [disabled] - Disable interactions
 */

export default function ImageUpload({ question, onAnswer, currentAnswer, disabled = false }) {
  const theme = useTheme();
  const { colors, radius, spacing, typography, transitions } = theme;

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentAnswer?.value || null);
  const [fileName, setFileName] = useState(currentAnswer?.fileName || null);
  const fileInputRef = useRef(null);

  const maxFileSize = question.maxFileSize || 5000000; // 5MB default
  const acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'];

  // Validate file
  const validateFile = (file) => {
    setError(null);

    if (!acceptedFormats.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      return false;
    }

    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / 1000000).toFixed(1);
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  // Process file upload
  const processFile = (file) => {
    if (!validateFile(file)) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const base64URL = e.target.result;

      setPreview(base64URL);
      setFileName(file.name);
      setError(null);

      // Call onAnswer with file data
      onAnswer({
        questionId: question.id,
        value: base64URL,
        fileName: file.name,
        fileSize: file.size,
        timestamp: Date.now()
      });
    };

    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle click to browse
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Handle remove image
  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName(null);
    setError(null);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Notify parent of removal
    onAnswer({
      questionId: question.id,
      value: null,
      fileName: null,
      fileSize: null,
      timestamp: Date.now()
    });
  };

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Upload zone or preview */}
      {!preview ? (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? colors.primary : error ? colors.error : colors.neutral300}`,
            borderRadius: radius.lg,
            padding: spacing.xxxl,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: `all ${transitions.normal}`,
            background: isDragging ? colors.primaryLight : error ? colors.errorLight : colors.surface,
            opacity: disabled ? 0.5 : 1
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload image"
        >
          {/* Upload icon */}
          <UploadCloud
            size={32}
            color={error ? colors.error : colors.neutral500}
            style={{ marginBottom: spacing.md }}
          />

          {/* Upload text */}
          <p style={{
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.semibold,
            color: error ? colors.error : colors.neutral900,
            margin: `0 0 ${spacing.sm}`
          }}>
            Drop image here or click to browse
          </p>

          {/* Supported formats */}
          <span style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral600
          }}>
            Supports JPG, PNG, WEBP
          </span>
        </div>
      ) : (
        // Image preview
        <div style={{
          border: `2px solid ${colors.neutral300}`,
          borderRadius: radius.lg,
          padding: spacing.lg,
          background: colors.surface,
          position: 'relative'
        }}>
          {/* Preview image */}
          <div style={{
            width: '100%',
            height: '120px',
            borderRadius: radius.md,
            overflow: 'hidden',
            marginBottom: spacing.md,
            background: colors.neutral100
          }}>
            <img
              src={preview}
              alt={fileName || 'Uploaded image'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* File name */}
          <p style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral700,
            margin: 0,
            wordBreak: 'break-all'
          }}>
            {fileName}
          </p>

          {/* Remove button */}
          {!disabled && (
            <button
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: spacing.md,
                right: spacing.md,
                width: '32px',
                height: '32px',
                background: colors.error,
                color: 'white',
                border: 'none',
                borderRadius: radius.full,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: `all ${transitions.normal}`
              }}
              aria-label="Remove image"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p style={{
          fontSize: typography.sizes.sm,
          color: colors.error,
          marginTop: spacing.md,
          margin: `${spacing.md} 0 0`
        }}>
          {error}
        </p>
      )}

      {/* Optional helper text */}
      {!question.required && !preview && !error && (
        <p style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral500,
          marginTop: spacing.md,
          fontStyle: 'italic',
          margin: `${spacing.md} 0 0`
        }}>
          This question is optional - you can skip if you don't have an inspiration image
        </p>
      )}
    </div>
  );
}
