import React from 'react';
import '../../styles/sidebar.css';

const PdfSidebar = ({ isOpen, pdfList, currentPdfId, onSelectPdf, onDeletePdf, onFileChange }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}> 
      <div className="sidebar-header">
        <span className="sidebar-title">PDF List</span>
      </div>
      <div className="pdf-list">
        {pdfList.length === 0 && <div style={{padding: '16px', color: '#999'}}>Upload a PDF to start...</div>}
        {pdfList.map(pdf => (
          <div
            key={pdf.id}
            className={`pdf-item ${pdf.id === currentPdfId ? 'active' : ''}`}
            onClick={() => onSelectPdf(pdf.id)}
          >
            <div className="pdf-name">{pdf.fileName}</div>
            <button
              className="delete-pdf"
              onClick={e => { e.stopPropagation(); onDeletePdf(pdf.id, e); }}
              title="Delete PDF"
            >
              &#x2716;
            </button>
          </div>
        ))}
      </div>
      <label className="upload-pdf-button">
        Upload
        <input 
          type="file" 
          onChange={onFileChange} 
          accept="application/pdf"
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

export default PdfSidebar;
