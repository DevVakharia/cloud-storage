// utils.js
export const getFileTypeIcon = (fileName, fileType) => {
    const extension = fileName.split(".").pop().toLowerCase();
  
    const iconMap = {
      pdf: "pdf-icon.png",
      doc: "word-icon.png",
      docx: "word-icon.png",
      xls: "excel-icon.png",
      xlsx: "excel-icon.png",
      ppt: "ppt-icon.png",
      pptx: "ppt-icon.png",
      zip: "zip-icon.png",
      rar: "zip-icon.png",
      txt: "text-icon.png",
      mp4: "video-icon.png",
      mp3: "audio-icon.png",
      png: "image-icon.png",
      jpg: "image-icon.png",
      jpeg: "image-icon.png",
      gif: "image-icon.png",
      default: "file-icon.png",
    };
  
    return iconMap[extension] || iconMap.default;
  };
  