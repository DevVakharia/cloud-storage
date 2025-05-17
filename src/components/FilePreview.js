import React, { useState, useEffect } from "react"; 
import { getFileTypeIcon } from "../components/utils";

// Function to render the file preview based on file type
const renderFilePreview = (file) => {
  const { fileName, fileUrl, fileType } = file;
 // 1️⃣ Images
  if (fileType?.startsWith("image/")) {
    return <img src={fileUrl} alt={fileName} style={{ width: "95%" }} />;
  }
    // 2️⃣ PDFs
  if (fileType === "application/pdf") {
    return (
      <embed
        src={fileUrl}
        type="application/pdf"
        width="95%"
        height="600px"
      />
    );
  }
   // 3️⃣ Fetch and display text-based files
  if (
    fileType?.startsWith("text/") ||
    [".txt", ".csv", ".json", ".py", ".js", ".html", ".css", ".java", ".c", ".cpp", ".sh"].some(
      (ext) => fileName.endsWith(ext)
    )
  ) {
    return (
      <iframe
        src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(fileUrl)}`}
        width="95%"
        height="600px"
      />
    );
  }
    // 4️⃣ Microsoft Office Files (Google Docs Viewer)
  if (
    [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"].some((ext) =>
      fileName.endsWith(ext)
    )
  ) {
    return (
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
        width="90%"
        height="600px"
      />
    );
  }
    // 5️⃣ Videos
  if (fileType?.startsWith("video/")) {
    return (
      <video controls width="95%">
        <source src={fileUrl} type={fileType} />
        Your browser does not support the video tag.
      </video>
    );
  }
   // 6️⃣ Audio
  if (fileType?.startsWith("audio/")) {
    return (
      <audio controls>
        <source src={fileUrl} type={fileType} />
        Your browser does not support the audio tag.
      </audio>
    );
  }
   // 7️⃣ ZIP / RAR Files
  if (fileName.endsWith(".zip") || fileName.endsWith(".rar")) {
    return <div>📁 ZIP File Preview (Download or extract manually)</div>;
  }
   // 8️⃣ Default: Show Icon and File Name
  return (
    <div className="file-preview-default">
      <img
        src={`/icons/${getFileTypeIcon(fileName, fileType)}`}
        alt={fileName}
        style={{ width: "50px", height: "50px" }}
      />
      <p>{fileName}</p>
      <p>❌ Preview not available</p>
    </div>
  );
};

// File Preview Component
const FilePreview = ({ file, folder, onBack, onFolderClick }) => {
    
  return (
    <div className="file-preview">
      <button onClick={() => {
        if (folder && folder.name) {
          onBack("folder");
        } else {
          onBack("dashboard");
        }
      }}>
        Back
      </button>
      <h2>📄 Previewing: {file.fileName}</h2>

      <div className="file-preview-content">{renderFilePreview(file)}</div>
    </div>
  );
};
export default FilePreview;
