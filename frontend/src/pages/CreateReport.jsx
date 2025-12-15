// frontend/src/pages/CreateReport.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI, uploadAPI } from '../services/api';
import MapLocationPicker from '../components/MapLocationPicker';
import './CreateReport.css';

export default function CreateReport() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'accident',
    severity: 'medium',
    address: '',
    city: '',
    latitude: null,
    longitude: null,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = ['accident', 'fire', 'flood', 'crime', 'pollution', 'earthquake', 'cyclone', 'other'];
  const severities = ['low', 'medium', 'high', 'critical'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;

    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreviews((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            url: event.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Clear input
    e.target.value = '';
  };

  // Remove selected file
  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove uploaded file
  const removeUploadedFile = (index) => {
    setUploadedMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files to server
  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('No files selected');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setUploadProgress(0);
      const response = await uploadAPI.uploadFiles(selectedFiles);

      if (response.data.success) {
        const newMediaUrls = response.data.data.files;
        setUploadedMediaUrls((prev) => [...prev, ...newMediaUrls]);
        setSelectedFiles([]);
        setFilePreviews([]);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle location selection from map picker
  const handleLocationSelect = (location) => {
    if (location) {
      setFormData((prev) => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || prev.address,
        city: prev.city,
      }));
    } else {
      // Clear location
      setFormData((prev) => ({
        ...prev,
        latitude: null,
        longitude: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create report with location data and media
      const response = await reportAPI.createReport({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        address: formData.address,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
        mediaUrls: uploadedMediaUrls,
      });

      setSuccess(
        `Report created successfully! You earned ${response.data.pointsAwarded} points!`
      );

      // Redirect to home after 2 seconds
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-report-container">
      <div className="create-report-card">
        <h2>📍 Report a Hazard</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* TITLE INPUT */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Pothole on Main Street"
              maxLength={100}
            />
          </div>

          {/* DESCRIPTION INPUT */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Provide detailed information about the hazard..."
              rows={5}
              maxLength={1000}
            />
          </div>

          {/* CATEGORY & SEVERITY ROW */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity">Severity</label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
              >
                {severities.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ADDRESS & CITY FIELDS */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address">Address (Optional)</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City (Optional)</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City name"
              />
            </div>
          </div>

          {/* MAP LOCATION PICKER */}
          <div className="form-group">
            <label>📍 Select Incident Location on Map</label>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-12)' }}>
              Click on the map to select the exact location, or use the "Use My Current Location" button
            </p>
            <MapLocationPicker
              onLocationSelect={handleLocationSelect}
              defaultLocation={
                formData.latitude && formData.longitude
                  ? {
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                  }
                  : null
              }
            />
          </div>

          {/* COORDINATES DISPLAY */}
          {formData.latitude && formData.longitude && (
            <div className="coordinates-display">
              <p>
                <strong>📍 Selected Location:</strong>
              </p>
              <p>
                Latitude: <code>{formData.latitude.toFixed(6)}</code>
              </p>
              <p>
                Longitude: <code>{formData.longitude.toFixed(6)}</code>
              </p>
            </div>
          )}

          {/* FILE UPLOAD SECTION */}
          <div className="form-group">
            <label>📸 Photo & Video Upload (Optional)</label>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-12)' }}>
              Upload up to 5 photos or videos to support your report. Accepted formats: JPG, PNG, GIF, WebP, MP4, MPEG, MOV, AVI (Max 50MB each)
            </p>

            {/* FILE INPUT */}
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-input"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                disabled={loading || selectedFiles.length + uploadedMediaUrls.length >= 5}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="file-input-label">
                {loading ? 'Uploading...' : '+ Choose Files'}
              </label>
            </div>

            {/* SELECTED FILES PREVIEW */}
            {filePreviews.length > 0 && (
              <div className="file-preview-container">
                <h4>Selected Files ({selectedFiles.length}):</h4>
                <div className="file-preview-grid">
                  {filePreviews.map((preview, index) => (
                    <div key={index} className="file-preview-item">
                      {preview.type.startsWith('image/') ? (
                        <img src={preview.url} alt={preview.name} />
                      ) : (
                        <div className="video-placeholder">
                          <span>🎥</span>
                          <p>{preview.name}</p>
                        </div>
                      )}
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeSelectedFile(index)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* UPLOAD BUTTON */}
                <button
                  type="button"
                  className="btn-upload-files"
                  onClick={handleUploadFiles}
                  disabled={loading || selectedFiles.length === 0}
                >
                  {loading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
                </button>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                {uploadProgress === 100 && (
                  <div className="upload-success">✓ Files uploaded successfully</div>
                )}
              </div>
            )}

            {/* UPLOADED MEDIA DISPLAY */}
            {uploadedMediaUrls.length > 0 && (
              <div className="uploaded-media-container">
                <h4>Uploaded Media ({uploadedMediaUrls.length}):</h4>
                <div className="uploaded-media-grid">
                  {uploadedMediaUrls.map((url, index) => {
                    const isVideo = url.includes('.mp4') || url.includes('.mpeg') || url.includes('.mov') || url.includes('.avi');
                    return (
                      <div key={index} className="uploaded-media-item">
                        {isVideo ? (
                          <div className="video-placeholder">
                            <span>🎥</span>
                            <p>{url.split('/').pop()}</p>
                          </div>
                        ) : (
                          <img src={url} alt={`Uploaded ${index}`} />
                        )}
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeUploadedFile(index)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`btn-submit ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Creating Report...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
