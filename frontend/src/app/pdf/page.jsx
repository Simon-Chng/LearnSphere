"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '../styles/pdf-viewer.css';
import '../styles/app.css';
import Header from '../components/layout/Header';
import { useRouter } from 'next/navigation';
import PdfSidebar from '../components/sidebar/PdfSidebar';
import PdfNavigation from '../components/pdf/PdfNavigation';
import ExtractButton from '../components/pdf/ExtractButton';
import TextPanel from '../components/pdf/TextPanel';

// Set the workerSrc to the local file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// IndexedDB setup
const DB_NAME = 'pdfViewerDB';
const DB_VERSION = 1;
const STORE_NAME = 'pdfFiles';

// Suppress AbortException warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('AbortException: TextLayer task cancelled') || 
       args[0].includes('TextLayer task cancelled'))) {
    return; // Suppress this specific warning
  }
  originalConsoleError(...args);
};

const PDFViewer = () => {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fileName, setFileName] = useState('');
  const [scale, setScale] = useState(1.0);
  const [selectedText, setSelectedText] = useState('');
  const [showExtractButton, setShowExtractButton] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [extractButtonPosition, setExtractButtonPosition] = useState({ x: 0, y: 0 });
  const [isCopied, setIsCopied] = useState(false);
  const [pdfList, setPdfList] = useState([]);
  const [showPdfList, setShowPdfList] = useState(false);
  const [currentPdfId, setCurrentPdfId] = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Add a key to force re-render
  const containerRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const dbRef = useRef(null);
  const documentRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = () => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
          console.error('Error opening database');
          reject(request.error);
        };
        
        request.onsuccess = () => {
          dbRef.current = request.result;
          setDbReady(true);
          resolve(request.result);
        };
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
      });
    };
    
    initDB().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  // Load PDF list from IndexedDB
  useEffect(() => {
    if (!dbReady) return;
    
    const loadPdfList = async () => {
      try {
        const db = dbRef.current;
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const pdfList = request.result;
            setPdfList(pdfList);
            resolve(pdfList);
          };
          
          request.onerror = () => {
            console.error('Error loading PDF list from database');
            reject(request.error);
          };
        });
      } catch (error) {
        console.error('Error in loadPdfList:', error);
        return [];
      }
    };
    
    loadPdfList();
  }, [dbReady]);

  // Load PDF from IndexedDB
  useEffect(() => {
    if (!dbReady) return;
    
    const loadPdfFromDB = async (pdfId) => {
      try {
        const db = dbRef.current;
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(pdfId);
        
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const data = request.result;
            if (data) {
              const byteArray = new Uint8Array(data.fileData);
              const blob = new Blob([byteArray], { type: 'application/pdf' });
              const pdfFile = new File([blob], data.fileName, { type: 'application/pdf' });
              
              setFile(pdfFile);
              setFileName(data.fileName);
              setCurrentPdfId(pdfId);
              
              // Restore the last read page if available
              if (data.lastPage) {
                setPageNumber(data.lastPage);
              } else {
                setPageNumber(1);
              }
              
              resolve(true);
            } else {
              resolve(false);
            }
          };
          
          request.onerror = () => {
            console.error('Error loading PDF from database');
            reject(request.error);
          };
        });
      } catch (error) {
        console.error('Error in loadPdfFromDB:', error);
        return false;
      }
    };
    
    // Load the first PDF if available
    if (pdfList.length > 0 && !file) {
      loadPdfFromDB(pdfList[0].id);
    }
  }, [pdfList, dbReady]);

  // Save current page number when it changes
  useEffect(() => {
    if (!dbReady) return;
    
    const saveCurrentPage = async () => {
      if (currentPdfId && pageNumber) {
        try {
          const db = dbRef.current;
          const transaction = db.transaction(STORE_NAME, 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(currentPdfId);
          
          request.onsuccess = () => {
            const data = request.result;
            if (data) {
              // Update the lastPage property
              data.lastPage = pageNumber;
              
              // Save the updated data
              const updateTransaction = db.transaction(STORE_NAME, 'readwrite');
              const updateStore = updateTransaction.objectStore(STORE_NAME);
              updateStore.put(data);
            }
          };
        } catch (error) {
          console.error('Error saving current page:', error);
        }
      }
    };
    
    saveCurrentPage();
  }, [pageNumber, currentPdfId, dbReady]);

  // Reset render key when page number changes
  useEffect(() => {
    setRenderKey(prevKey => prevKey + 1);
  }, [pageNumber]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
    
    // If we're loading a PDF for the first time, set page to 1
    // Otherwise, the page number will be restored from the database
    if (!currentPdfId) {
    setPageNumber(1);
    }
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF document:', error);
    setIsLoading(false);
  };

  // Function to calculate file hash for content comparison
  const calculateFileHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const hashArray = new Uint8Array(arrayBuffer);
          let hash = '';
          for (let i = 0; i < hashArray.length; i++) {
            hash += hashArray[i].toString(16).padStart(2, '0');
          }
          resolve(hash);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Function to check if a file with the same content already exists
  const findExistingPdf = async (file) => {
    if (!dbReady) return null;
    
    try {
      const fileHash = await calculateFileHash(file);
      
      const db = dbRef.current;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const pdfList = request.result;
          for (const pdf of pdfList) {
            if (pdf.fileHash === fileHash) {
              resolve(pdf);
              return;
            }
          }
          resolve(null);
        };
        
        request.onerror = () => {
          console.error('Error checking for existing PDF');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in findExistingPdf:', error);
      return null;
    }
  };

  const onFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setIsLoading(true);
      
      try {
        // Check if the file already exists in the database
        const existingPdf = await findExistingPdf(selectedFile);
        
        if (existingPdf) {
          // If the file exists, use the existing record
          console.log('File already exists, using existing record');
          setFile(selectedFile);
          setFileName(existingPdf.fileName);
          setCurrentPdfId(existingPdf.id);
          
          // Restore the last read page if available
          if (existingPdf.lastPage) {
            setPageNumber(existingPdf.lastPage);
          } else {
            setPageNumber(1);
          }
          
          // Update the file name if it's different
          if (selectedFile.name !== existingPdf.fileName) {
            const db = dbRef.current;
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            existingPdf.fileName = selectedFile.name;
            store.put(existingPdf);
            
            // Update the PDF list
            setPdfList(prevList => 
              prevList.map(pdf => 
                pdf.id === existingPdf.id ? existingPdf : pdf
              )
            );
          }
        } else {
          // If the file doesn't exist, create a new record
          const fileHash = await calculateFileHash(selectedFile);
          const pdfId = `pdf_${Date.now()}`;
          
          // Save file to IndexedDB
          await savePdfToDB(selectedFile, pdfId, fileHash);
          
          // Update the PDF list
          setPdfList(prevList => [...prevList, { 
            id: pdfId, 
            fileName: selectedFile.name,
            fileHash: fileHash,
            lastPage: 1
          }]);
          
          // Set the current file
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setPageNumber(1);
          setCurrentPdfId(pdfId);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setIsLoading(false);
      }
    }
  };
  
  // Save PDF to IndexedDB
  const savePdfToDB = async (pdfFile, pdfId, fileHash) => {
    if (!dbReady) return;
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);
      
      const db = dbRef.current;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const data = {
        id: pdfId,
        fileName: pdfFile.name,
        fileData: fileData,
        fileHash: fileHash,
        lastPage: 1 // Initialize lastPage to 1
      };
      
      store.put(data);
      
      transaction.oncomplete = () => {
        console.log('PDF saved to database');
      };
      
      transaction.onerror = () => {
        console.error('Error saving PDF to database');
      };
    } catch (error) {
      console.error('Error in savePdfToDB:', error);
    }
  };

  // Select a PDF from the list
  const selectPdf = async (pdfId, pdfFileName) => {
    if (!dbReady) return;
    
    try {
      setIsLoading(true);
      const db = dbRef.current;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(pdfId);
      
      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          const byteArray = new Uint8Array(data.fileData);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const pdfFile = new File([blob], data.fileName, { type: 'application/pdf' });
          
          setFile(pdfFile);
          setFileName(data.fileName);
          setCurrentPdfId(pdfId);
          
          // Restore the last read page if available
          if (data.lastPage) {
            setPageNumber(data.lastPage);
          } else {
            setPageNumber(1);
          }
          
          setShowPdfList(false);
        }
      };
    } catch (error) {
      console.error('Error selecting PDF:', error);
      setIsLoading(false);
    }
  };

  // Delete a PDF from the list
  const deletePdf = async (pdfId, event) => {
    if (!dbReady) return;
    
    event.stopPropagation(); // Prevent triggering the selectPdf function
    
    try {
      const db = dbRef.current;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(pdfId);
      
      request.onsuccess = () => {
        // Update the PDF list
        setPdfList(prevList => prevList.filter(pdf => pdf.id !== pdfId));
        
        // If the deleted PDF was the current one, select another one if available
        if (file && fileName === pdfList.find(pdf => pdf.id === pdfId)?.fileName) {
          const remainingPdfs = pdfList.filter(pdf => pdf.id !== pdfId);
          if (remainingPdfs.length > 0) {
            selectPdf(remainingPdfs[0].id, remainingPdfs[0].fileName);
          } else {
            setFile(null);
            setFileName('');
            setNumPages(null);
            setPageNumber(1);
            setCurrentPdfId(null);
          }
        }
      };
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }
  };

  // Toggle PDF list visibility
  const togglePdfList = () => {
    setShowPdfList(!showPdfList);
  };

  const goToPrevPage = (e) => {
    e.preventDefault();
    if (pageNumber <= 1) return;
    
    const currentScroll = containerRef.current?.scrollTop || 0;
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
    
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current.scrollTop = currentScroll;
      }, 0);
    }
  };

  const goToNextPage = (e) => {
    e.preventDefault();
    if (pageNumber >= numPages) return;
    
    const currentScroll = containerRef.current?.scrollTop || 0;
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages));
    
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current.scrollTop = currentScroll;
      }, 0);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!file) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevPage(e);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextPage(e);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [file, pageNumber, numPages]);

  // Handle text selection
  useEffect(() => {
    const handleTextSelection = (e) => {
      // Don't handle selection changes if the panel is already showing
      if (showTextPanel) return;

      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(selectedText);
        setExtractButtonPosition({
          x: rect.left + (rect.width / 2),
          y: rect.bottom + window.scrollY + 10
        });
        setShowExtractButton(true);
      } else {
        setShowExtractButton(false);
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
    };
  }, [showTextPanel]);  // Add showTextPanel as dependency

  // Cleanup copy timeout
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Function to copy selected text
  const copySelectedText = async () => {
    if (selectedText) {
      try {
        // Copy text to clipboard
        await navigator.clipboard.writeText(selectedText);
        
        // Update state to show feedback
        setIsCopied(true);

        // Clear any existing timeout
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }

        // Set timeout to reset the state
        copyTimeoutRef.current = setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    }
  };

  const handleExtractClick = () => {
    setShowExtractButton(false);
    setShowTextPanel(true);
  };

  const handleClosePanel = () => {
    setShowTextPanel(false);
    setSelectedText('');
    setIsCopied(false);
    // Clear any existing timeout
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;  // Clear the ref
    }
  };

  return (
    <div className="app-container">
      <Header onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      <PdfSidebar
        isOpen={isSidebarOpen}
        pdfList={pdfList}
        currentPdfId={currentPdfId}
        onSelectPdf={selectPdf}
        onDeletePdf={deletePdf}
        onFileChange={onFileChange}
      />
      <div className="main-content">
        <div className="pdf-viewer-container" ref={containerRef}>
          <h1 className="pdf-viewer-title">PDF Viewer</h1>
          {file && (
            <>
              <PdfNavigation
                pageNumber={pageNumber}
                numPages={numPages}
                onPrevPage={goToPrevPage}
                onNextPage={goToNextPage}
                className="top-controls"
              />
              <div className="pdf-document">
                <Document 
                  file={file} 
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={<div>Loading PDF...</div>}
                  ref={documentRef}
                >
                  {numPages && pageNumber <= numPages && (
                    <Page 
                      key={`page-${pageNumber}-${renderKey}`}
                      pageNumber={pageNumber} 
                      className="pdf-page"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      scale={scale}
                      loading={<div>Loading page...</div>}
                      error={<div>Error loading page</div>}
                    />
                  )}
                </Document>
              </div>
              <PdfNavigation
                pageNumber={pageNumber}
                numPages={numPages}
                onPrevPage={goToPrevPage}
                onNextPage={goToNextPage}
                className="bottom-controls"
              />
              {showExtractButton && (
                <ExtractButton
                  position={extractButtonPosition}
                  onClick={handleExtractClick}
                />
              )}
              {showTextPanel && (
                <TextPanel
                  selectedText={selectedText}
                  isCopied={isCopied}
                  onCopy={copySelectedText}
                  onClose={handleClosePanel}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
