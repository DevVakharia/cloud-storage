import React, { useState, useEffect } from "react";
import { getFileTypeIcon } from "../components/utils";
import "../components/FolderPreview.css";

const FolderPreview = ({ 
  folder, 
  files, 
  onBack, 
  onFileClick, 
  selectedFiles, 
  setSelectedFiles, 
  handleDeleteFiles, 
  handleDownload, 
  searchQuery,
  isSelectionMode,
  selectionBox, 
  setSelectionBox
}) => {
  const [activeFile, setActiveFile] = useState(null);

  // Close expanded name when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.classList.contains("file-name")) {
        setActiveFile(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const truncateFileName = (name, length = 12) => {
    return name.length > length ? name.slice(0, length) + "..." : name;
  };

  const handleFileNameClick = (e, fileId) => {
    e.stopPropagation(); // Prevent parent div from triggering
    setActiveFile(activeFile === fileId ? null : fileId);
  };

  // 🟦 Start Selection Box
  const handleMouseDown = (e) => {
    if (isSelectionMode && e.button === 0) {
      setSelectionBox({
        startX: e.clientX,
        startY: e.clientY,
        endX: e.clientX,
        endY: e.clientY,
        isSelecting: true,
      });
    }
  };

  // 🔄 Update Selection Box While Dragging
  const handleMouseMove = (e) => {
    if (selectionBox.isSelecting) {
      setSelectionBox((prev) => ({
        ...prev,
        endX: e.clientX,
        endY: e.clientY,
      }));
    }
  };

  // ✅ Finish Selection & Select Files
  const handleMouseUp = () => {
    if (selectionBox.isSelecting) {
      const { startX, startY, endX, endY } = selectionBox;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      const newSelectedFiles = files.filter((file) => {
        const element = document.getElementById(`file-${file.id}`);
        if (!element) return false;

        const rect = element.getBoundingClientRect();

        return (
          rect.left < maxX &&
          rect.right > minX &&
          rect.top < maxY &&
          rect.bottom > minY
        );
      }).map((file) => file.id);

      // Merge new selections with existing selections
      setSelectedFiles((prev) => [...new Set([...prev, ...newSelectedFiles])]);

      // Reset Selection Box
      setSelectionBox({ startX: 0, startY: 0, endX: 0, endY: 0, isSelecting: false });
    }
  };

  return (
    <div className="folder-preview"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <button onClick={onBack}>Back</button>
      <h2>📁 Folder: {folder.name}</h2>

      {/* 🟦 Selection Box UI */}
      {selectionBox.isSelecting && (
        <div
          className="selection-box"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.endX),
            top: Math.min(selectionBox.startY, selectionBox.endY),
            width: Math.abs(selectionBox.endX - selectionBox.startX),
            height: Math.abs(selectionBox.endY - selectionBox.startY),
          }}
        />
      )}

      <div className="folder-contents">
      {files
  .filter((file) => 
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by search query
  )
  .map((file) => {

          const isImage = file.fileType && file.fileType.startsWith("image/");
          const iconPath = isImage
            ? file.fileUrl
            : `/icons/${getFileTypeIcon(file.fileName, file.fileType)}`;

          return (
            <div 
              key={file.id} 
              id={`file-${file.id}`}
              className={`file-item ${selectedFiles.includes(file.id) ? 'selected' : ''}`}
              onClick={(e) => {
                if (isSelectionMode) {
                  setSelectedFiles((prev) => {
                    if (e.ctrlKey || e.metaKey) {
                      // Multi-select (Toggle selection)
                      return prev.includes(file.id)
                        ? prev.filter((id) => id !== file.id) // Deselect
                        : [...prev, file.id]; // Add selection
                    } else {
                      return [file.id]; // Single select if no modifier key
                    }
                  });
                } else {
                  onFileClick(file); // Preview file when selection mode is OFF
                }
              }}
            >
              <img src={iconPath} alt={file.fileName} className="file-icon" />

              {/* File Name with Click-to-Expand */}
              <span
                className={`file-name ${activeFile === file.id ? "expanded" : ""}`}
                title={file.fileName} // Tooltip for hover
                onClick={(e) => handleFileNameClick(e, file.id)}
              >
                {activeFile === file.id ? file.fileName : truncateFileName(file.fileName)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FolderPreview;
