import React from 'react';

/**
 * Navigation controls for paging through a PDF document.
 *
 * - Displays current page and total pages.
 * - Includes previous and next buttons with disabled state handling.
 * - Supports optional custom styling via `className`.
 *
 * @component
 * @param {Object} props
 * @param {number} props.pageNumber - The current page number being viewed
 * @param {number} props.numPages - The total number of pages in the PDF
 * @param {() => void} props.onPrevPage - Callback for navigating to the previous page
 * @param {() => void} props.onNextPage - Callback for navigating to the next page
 * @param {string} [props.className] - Optional additional class names for styling
 * @returns {JSX.Element}
 */
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
