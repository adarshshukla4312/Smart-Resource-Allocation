import './BrandLoader.css';

export default function BrandLoader({ message = "Loading..." }) {
  return (
    <div className="brand-loader-container">
      <div className="brand-loader">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-core">
          <div className="core-dot"></div>
        </div>
      </div>
      <div className="brand-loader-text">{message}</div>
    </div>
  );
}
