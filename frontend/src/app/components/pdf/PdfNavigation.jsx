import React from 'react';

const PdfNavigation = ({ 
  pageNumber, 
  numPages, 
  onPrevPage, 
  onNextPage,
  className = ''
}) => {
  return (
    <div className={`pdf-controls ${className}`}>
      <button 
        type="button"
        onClick={onPrevPage} 
        disabled={pageNumber <= 1}
        className="pdf-nav-button prev-button"
        aria-label="Previous page"
      >
        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <p className="page-info">
        Page {pageNumber} of {numPages || '...'}
      </p>
      <button 
        type="button"
        onClick={onNextPage} 
        disabled={pageNumber >= (numPages || 1)}
        className="pdf-nav-button next-button"
        aria-label="Next page"
      >
        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

export default PdfNavigation;
