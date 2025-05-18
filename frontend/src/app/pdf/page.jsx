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

/**
 * PDFViewer component allows users to upload, view, and navigate PDFs stored in IndexedDB.
 * 
 * Features:
 * - IndexedDB storage of PDFs and metadata (last page, file hash)
 * - PDF page navigation with scroll position preservation
 * - Text selection, copying, and extraction panel
 * - Persistence of last read page
 * - PDF deduplication via content hashing
 * - Sidebar for managing multiple stored PDFs
 *
 * @component
 * @returns {JSX.Element}
 */
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
    
    /**
     * Loads the list of all stored PDFs from IndexedDB.
     *
     * - Opens a read-only transaction on the `STORE_NAME` object store.
     * - Resolves with the list of PDF entries and updates local state via `setPdfList`.
     * - Logs and rejects if an error occurs during the transaction.
     *
     * @async
     * @function
     * @returns {Promise<Object[]>} Resolves to an array of PDF metadata objects stored in IndexedDB.
     */
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
    
    /**
     * Loads a single PDF file from IndexedDB by its ID and sets it in component state.
     *
     * - Retrieves the stored binary data and metadata.
     * - Converts the binary data back into a `File` object for PDF rendering.
     * - Restores the last viewed page number if available.
     * - Updates relevant state: `file`, `fileName`, `pageNumber`, `currentPdfId`.
     *
     * @async
     * @function
     * @param {string} pdfId - The ID of the PDF to load from IndexedDB
     * @returns {Promise<boolean>} Resolves `true` if the file was found and loaded, otherwise `false`
     */
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
    
    /**
     * Persists the current page number of the active PDF to IndexedDB.
     *
     * - Retrieves the current PDF entry using `currentPdfId`.
     * - Updates the `lastPage` field with the current `pageNumber`.
     * - Saves the updated record back to the database using a read/write transaction.
     *
     * @async
     * @function
     * @returns {Promise<void>}
     */
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

  /**
   * Callback fired when a PDF document has been successfully loaded.
   *
   * - Sets the total number of pages.
   * - Updates the loading state.
   * - If no current PDF ID exists, resets page to 1 (first-time load).
   *
   * @function
   * @param {{ numPages: number }} param0 - Object containing the total page count
   */
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
    
    // If we're loading a PDF for the first time, set page to 1
    // Otherwise, the page number will be restored from the database
    if (!currentPdfId) {
    setPageNumber(1);
    }
  };

  /**
   * Callback fired when a PDF document fails to load.
   *
   * - Logs the error and disables the loading state.
   *
   * @function
   * @param {Error} error - The error object from the PDF load failure
   */
  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF document:', error);
    setIsLoading(false);
  };

  /**
   * Calculates a hexadecimal hash string from the contents of a given file.
   *
   * - Uses FileReader to read the file as an ArrayBuffer.
   * - Converts the binary data into a hex string for deduplication purposes.
   * - This is a custom (non-cryptographic) hash based on byte values.
   *
   * @async
   * @function
   * @param {File} file - The file to generate a hash for
   * @returns {Promise<string>} The resulting hex string hash
   */
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

  /**
   * Checks if a PDF with the same file content already exists in IndexedDB.
   *
   * - Calculates a hash of the given file.
   * - Compares it with stored file hashes.
   *
   * @async
   * @function
   * @param {File} file - The file to compare for duplication
   * @returns {Promise<Object|null>} The existing PDF record if found, otherwise null
   */
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

  /**
   * Handles file selection from input and loads or stores it in IndexedDB.
   *
   * - Checks if the selected file already exists by comparing hash.
   * - If it exists, loads from DB and restores last read page.
   * - If new, hashes, stores, and updates local state.
   *
   * @async
   * @function
   * @param {Event} event - File input change event
   * @returns {Promise<void>}
   */
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
  
  /**
   * Saves a new PDF file into IndexedDB with metadata including file hash and last page.
   *
   * @async
   * @function
   * @param {File} pdfFile - The file to store
   * @param {string} pdfId - Unique identifier to store the PDF under
   * @param {string} fileHash - Hex-encoded hash of the file content
   * @returns {Promise<void>}
   */
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

  /**
   * Loads a PDF from IndexedDB by ID and sets it as the currently active document.
   *
   * - Converts stored binary data into a Blob and creates a File.
   * - Updates page number and hides the PDF list view.
   *
   * @async
   * @function
   * @param {string} pdfId - ID of the PDF in IndexedDB
   * @param {string} pdfFileName - Display name for logging/UI reference
   * @returns {Promise<void>}
   */
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

  /**
   * Deletes a PDF from IndexedDB by ID and updates the viewer state accordingly.
   *
   * - Removes the record from IndexedDB and the local list.
   * - If the deleted PDF is currently open, loads the next available one or clears the viewer.
   *
   * @async
   * @function
   * @param {string} pdfId - ID of the PDF to delete
   * @param {Event} event - Click event to stop propagation (prevent selection)
   * @returns {Promise<void>}
   */
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

  /**
   * Toggles the visibility of the PDF list sidebar.
   *
   * @function
   * @returns {void}
   */
  const togglePdfList = () => {
    setShowPdfList(!showPdfList);
  };

  /**
   * Navigates to the previous page of the currently loaded PDF.
   * 
   * - Prevents going below page 1.
   * - Preserves scroll position during re-render.
   *
   * @function
   * @param {Event} e - The event object (usually from a button click)
   * @returns {void}
   */
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

  /**
   * Navigates to the next page of the currently loaded PDF.
   * 
   * - Prevents going beyond the last page.
   * - Preserves scroll position during re-render.
   *
   * @function
   * @param {Event} e - The event object (usually from a button click)
   * @returns {void}
   */
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

  /**
   * Copies the currently selected text from the PDF viewer to the clipboard.
   *
   * - Uses the Clipboard API to write text.
   * - Triggers UI feedback by updating `isCopied` state.
   * - Resets feedback after 2 seconds using a timeout.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
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

  /**
   * Displays the text extraction panel after the user clicks the extract button.
   *
   * - Hides the floating extract button.
   * - Shows the text panel for interacting with the selected text.
   *
   * @function
   * @returns {void}
   */
  const handleExtractClick = () => {
    setShowExtractButton(false);
    setShowTextPanel(true);
  };

  /**
   * Closes the text extraction panel and clears selection state.
   *
   * - Hides the panel and resets `selectedText` and `isCopied`.
   * - Clears the copy feedback timeout if it exists.
   *
   * @function
   * @returns {void}
   */
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
