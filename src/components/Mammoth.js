import React, { useEffect, useState } from "react";
import mammoth from "mammoth";

const renderWordDocumentPreview = (fileUrl) => {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    fetch(fileUrl)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        mammoth.extractRawText({ arrayBuffer: buffer })
          .then((result) => {
            setHtmlContent(result.value);
          })
          .catch((error) => {
            console.error("Error reading .docx file:", error);
          });
      });
  }, [fileUrl]);

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

// Inside renderFilePreview
if (fileName.endsWith(".docx")) {
  return renderWordDocumentPreview(fileUrl);
}
