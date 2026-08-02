import './PageLoader.css';

export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading">
      <div className="page-loader__compass" />
      <p className="page-loader__text">Loading...</p>
    </div>
  );
}
