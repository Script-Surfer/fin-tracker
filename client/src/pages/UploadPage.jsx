import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setResult(null);
    setError('');
    if (rejectedFiles.length > 0) {
      setError('Invalid file. Please upload a CSV file (max 2 MB).');
      return;
    }
    const f = acceptedFiles[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError('File exceeds 2 MB limit.');
      return;
    }
    setFile(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="main-content">

        <div className="page-header animate-in">
          <div>
            <h1 className="page-title">Upload CSV</h1>
            <p className="page-subtitle">Import transactions in bulk from a bank statement</p>
          </div>
        </div>

        {/* ── Format guide ── */}
        <div className="settings-section animate-in animate-in-delay-1" style={{ marginBottom: 24 }}>
          <h2 className="settings-section-title">Expected CSV Format</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Your CSV must have the following columns (header row required):
          </p>
          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 18px',
            fontFamily: 'monospace',
            fontSize: 13,
            color: 'var(--income)',
            overflowX: 'auto',
          }}>
            <div>date,description,type,category,amount</div>
            <div style={{ color: 'var(--text-muted)' }}>2024-01-15,Grocery Store,expense,Food,450</div>
            <div style={{ color: 'var(--text-muted)' }}>2024-01-16,Freelance Payment,income,Freelance,8000</div>
          </div>
          <ul style={{ marginTop: 14, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>date</strong> — valid date string (e.g., 2024-01-15)</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>type</strong> — must be <code style={{ color: 'var(--accent-light)' }}>income</code> or <code style={{ color: 'var(--accent-light)' }}>expense</code></li>
            <li><strong style={{ color: 'var(--text-primary)' }}>category</strong> — must match a known category (defaults to &quot;Other&quot;)</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>amount</strong> — positive number</li>
          </ul>
        </div>

        {/* ── Dropzone ── */}
        <div className="animate-in animate-in-delay-2">
          {!file ? (
            <div
              {...getRootProps()}
              className={`dropzone${isDragActive ? ' active' : ''}`}
              id="csv-dropzone"
            >
              <input {...getInputProps()} id="csv-file-input" />
              <div className="dropzone-icon">📂</div>
              <p className="dropzone-text">
                {isDragActive ? 'Drop the CSV file here…' : 'Drag & drop a CSV file here'}
              </p>
              <p className="dropzone-hint">or click to browse — max 2 MB</p>
            </div>
          ) : (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-bg)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22,
                }}>
                  📄
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={handleUpload} disabled={uploading} id="upload-btn">
                  {uploading ? 'Uploading…' : 'Upload & import'}
                </button>
                <button className="btn btn-ghost" onClick={handleRemove}>Remove</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="error-box animate-in" style={{ marginTop: 20 }}>
            {error}
          </div>
        )}

        {/* ── Result summary ── */}
        {result && (
          <div
            className="animate-in"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              marginTop: 24,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Import Summary</h2>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--income)' }}>
                  {result.inserted}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Inserted</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--warning)' }}>
                  {result.skipped}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Skipped</div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Skipped rows:
                </p>
                <ul style={{
                  paddingLeft: 16,
                  fontSize: 13,
                  color: 'var(--expense)',
                  lineHeight: 1.8,
                  background: 'var(--expense-bg)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                }}>
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.inserted > 0 && (
              <p style={{
                marginTop: 16,
                fontSize: 13,
                color: 'var(--income)',
                fontWeight: 500,
              }}>
                ✅ {result.inserted} transaction{result.inserted !== 1 ? 's' : ''} successfully imported.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;