import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page active">
      <div className="card" style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center', padding: '40px 32px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
          Page not found
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
          The page you're looking for doesn't exist or may have been moved.
        </div>
        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-block' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
