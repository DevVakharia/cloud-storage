import React from 'react';
import { FaFileAlt, FaFileImage, FaFileVideo, FaFilePdf, FaDownload } from 'react-icons/fa';
import './FileGrid.css';

function FileGrid({ files, onDownload }) {
  // Function to determine file type and return appropriate icon
  
  return (
    <div className="file-grid">
      {files.length > 0 ? (
        files.map((file, index) => (
          <div key={index} className="file-card">
            {getFileIcon(file.name)}
            <p className="file-name">{file.name}</p>
            <button onClick={() => onDownload(file.name)} className="download-btn">
              <FaDownload /> Download
            </button>
          </div>
        ))
      ) : (
        <p className="no-files">No files uploaded yet.</p>
      )}
    </div>

    
  );
}

export default FileGrid;
