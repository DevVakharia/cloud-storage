import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc, increment 
} from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import FilePreview from "../components/FilePreview"; // Adjust path as necessary
import FolderPreview from "../components/FolderPreview"; // Import the new FolderPreview component
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
//29-01-25
//all working with icons 
//slection working with mouse scroll
//workinf with files and folder on click
//search working
//folder selction and downlaod also woring 
//good to go  👌👍
//updated with name for zip 

function Dashboard() {
  const [user, setUser] = useState(null); 
  const [userName, setUserName] = useState("Guest");  // Declare userName here
  const [userData, setUserData] = useState(null);  // To store user-specific details (name, email, etc.)
  const [file, setFile] = useState(null); 
  const [uploadStatus, setUploadStatus] = useState(''); 
  const [files, setFiles] = useState([]); 
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [sorting, setSorting] = useState('name'); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [layout, setLayout] = useState('grid'); 
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [dragOver, setDragOver] = useState(false); 
  const [filesToUpload, setFilesToUpload] = useState([]); // To store dropped files
  const [usedStorage, setUsedStorage] = useState(0); // Storage used (in bytes)
  const [totalStorage, setTotalStorage] = useState(200 * 1024 * 1024); // Default: 200MB
  const [selectedFolders, setSelectedFolders] = useState([]); // Folder view state
  const [folderStructure, setFolderStructure] = useState({}); // Tracks folder-like structure of selected files
  const [previewFile, setPreviewFile] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [folders, setFolders] = useState([]); // To store folder metadata
  const [filesByFolder, setFilesByFolder] = useState({}); // To store files grouped by folder
  const [isUploading, setIsUploading] = useState(false); // Add this state
  const [previewFolder, setPreviewFolder] = useState(null); // Track the folder being previewed
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeFile, setActiveFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

// 🔄 Fetch User Data
const fetchUserData = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserName(data.name || "Guest");
    } else {
      console.log("No user document found in Firestore.");
    }
  } catch (error) {
    console.error("Error fetching user data: ", error.message);
  }
};
   // 🛡️ Listen to Auth State and Fetch User Data
   useEffect(() => {
    console.log("Dashboard component rendered");
  
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        if (!currentUser) {
          navigate("/login");
        } else {
          setUser(currentUser);
  
          // Check if displayName is available; fetch Firestore data if not
          if (currentUser.displayName) {
            setUserName(currentUser.displayName);
          } else {
            await fetchUserData(currentUser.uid);
          }
  
          // Fetch user's files
          await fetchUserFiles(currentUser.uid);
  
          // Fetch user's storage data (usedStorage and totalStorage)
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
  
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsedStorage(userData.usedStorage || 0); // Default to 0
            setTotalStorage(userData.totalStorage || 200 * 1024 * 1024); // Default to 200MB
          } else {
            console.error("User data not found!");
          }
        }
      } catch (error) {
        console.error("Error in onAuthStateChanged:", error);
      }
    });
  
    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [navigate]);
  // 🚪 Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // 📁 Handle File Selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const truncateFileName = (name, length = 12) => {
    return name.length > length ? name.slice(0, length) + "..." : name;
  };
  const handleFileNameClick = (e, fileId) => {
    e.stopPropagation(); // Prevent parent div from triggering
    setActiveFile(activeFile === fileId ? null : fileId);
  };

// 📥 Download Selected Files
const handleDownload = async () => {
  const filesToDownload = selectedFiles.map(id => 
    files.find(f => f.id === id)
  ).filter(Boolean);
  
  const foldersToDownload = folders.filter(f => 
    selectedFolders.includes(f.id)
  );

  if (filesToDownload.length === 0 && foldersToDownload.length === 0) {
    alert('No files or folders selected');
    return;
  }

  try {
    // 1. Download folders as ZIP files
    for (const folder of foldersToDownload) {
      const zip = new JSZip();
      const folderFiles = filesByFolder[folder.id] || [];
      
      for (const file of folderFiles) {
        const response = await fetch(file.fileUrl);
        const blob = await response.blob();
        zip.file(file.fileName, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folder.name}.zip`);
    }

    // 2. Download individual files using blob conversion
    if (filesToDownload.length > 0) {
      for (const file of filesToDownload) {
        const response = await fetch(file.fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }
    }

    // Clear selections
    setSelectedFiles([]);
    setSelectedFolders([]);
    setIsSelectionMode(false);

  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download items');
  }
};
// Update your FileItem component's click handler
const handleFileClick = (fileId, e) => {
  if (isSelectionMode) {
    // Selection logic remains same
  } else {
    // Trigger download directly instead of preview
    const file = files.find(f => f.id === fileId);
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
    
 // ✅ Handle selecting files using checkboxes
 const handleCheckboxChange = (file) => {
  setSelectedFiles((prevSelected) => {
    if (prevSelected.includes(file)) {
      return prevSelected.filter((f) => f !== file); // Unselect if already selected
    } else {
      return [...prevSelected, file]; // Add to selected files
    }
  });
};
// Handle file preview
  const handleFilePreview = (file) => {
    setPreviewFile(file);
    setPreviewFolder(null); // Clear folder preview
  };

  // Handle folder preview
  const handleFolderPreview = (folder) => {
    setPreviewFolder(folder);
    setPreviewFile(null); // Clear file preview
  };

  // Handle back from folder preview
  const handleBackFromFolderPreview = () => {
    setPreviewFolder(null);
  };


// 📤 Handle Upload
const handleFileUpload = async () => {
  if (usedStorage >= totalStorage) {
    alert("Your storage limit has been reached. Please upgrade your plan.");
    return;
  }

  if (filesToUpload.length === 0 || !user) {
    alert("No files selected for upload.");
    return;
  }

  setIsUploading(true); // Disable the upload button
  setUploadStatus("Uploading...");

  // Separate single files and folder files
  const singleFiles = [];
  const folderFiles = {};

  filesToUpload.forEach((file) => {
    if (file.webkitRelativePath) {
      // File is part of a folder
      const folderPath = file.webkitRelativePath.split("/")[0]; // Extract folder name
      if (!folderFiles[folderPath]) {
        folderFiles[folderPath] = [];
      }
      folderFiles[folderPath].push(file);
    } else {
      // Single file
      singleFiles.push(file);
    }
  });

  // Upload single files
  for (const file of singleFiles) {
    try {
      const uniqueFileName = `${Date.now()}_${file.name}`;
      const filePath = `users/${user.uid}/${uniqueFileName}`;

      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadStatus(`Uploading ${file.name}: ${Math.round(progress)}%`);
        },
        (error) => {
          console.error(`❌ Failed to upload ${file.name}:`, error.message);
          setUploadStatus(`Failed to upload ${file.name}`);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          // Save file metadata
          await addDoc(collection(db, "userFiles"), {
            userId: user.uid,
            fileName: file.name,
            fileUrl: url,
            filePath: filePath,
            uploadedAt: new Date().toISOString(),
            fileType: file.type,
            fileSize: file.size,
            folderId: null, // No folder
          });

          // Update user storage
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            usedStorage: increment(file.size),
          });

          setUploadStatus(`${file.name} uploaded successfully!`);
        }
      );
    } catch (error) {
      console.error("❌ Upload error:", error.message);
    }
  }

  // Upload folder files
  for (const [folderName, files] of Object.entries(folderFiles)) {
    try {
        // Create folder metadata in Firestore
        const folderRef = await addDoc(collection(db, "folders"), {
            name: folderName,
            userId: user.uid,
            path: `users/${user.uid}/${folderName}`,
            createdAt: new Date().toISOString(),
        });

        let uploadedFilesCount = 0; // Track number of uploaded files in the folder

        // Upload files in the folder
        for (const file of files) {
            const uniqueFileName = `${Date.now()}_${file.name}`;
            const filePath = `users/${user.uid}/${folderName}/${uniqueFileName}`;

            const storageRef = ref(storage, filePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadStatus(`Uploading ${file.name}: ${Math.round(progress)}%`);
                },
                (error) => {
                    console.error(`❌ Failed to upload ${file.name}:`, error.message);
                    setUploadStatus(`Failed to upload ${file.name}`);
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);

                    // Save file metadata with folder reference
                    await addDoc(collection(db, "userFiles"), {
                        userId: user.uid,
                        fileName: file.name,
                        fileUrl: url,
                        filePath: filePath,
                        uploadedAt: new Date().toISOString(),
                        fileType: file.type,
                        fileSize: file.size,
                        folderId: folderRef.id, // Link file to folder
                    });

                    // Update user storage
                    const userRef = doc(db, "users", user.uid);
                    await updateDoc(userRef, {
                        usedStorage: increment(file.size),
                    });

                    uploadedFilesCount++; // Increment file count

                    // If all files in the folder are uploaded, show success message for folder
                    if (uploadedFilesCount === files.length) {
                        setUploadStatus(`Folder "${folderName}" uploaded successfully!`);
                    }
                }
            );
        }
    } catch (error) {
        console.error("❌ Upload error:", error.message);
    }
}

  setIsUploading(false); // Re-enable the upload button
  setFilesToUpload([]); // Clear selected files after upload
  fetchUserFiles(user.uid); // Refresh file list
};
  // 🖱️ Handle Drag-and-Drop
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
  
    const items = event.dataTransfer.items;
    const files = [];
  
    const processEntry = (entry, path = '') => {
      return new Promise((resolve) => {
        if (entry.isFile) {
          entry.file((file) => {
            file.relativePath = path + file.name; // Set relativePath
            files.push(file);
            resolve();
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          dirReader.readEntries((entries) => {
            const promises = entries.map((e) => processEntry(e, path + entry.name + '/'));
            Promise.all(promises).then(resolve);
          });
        }
      });
    };
  
    const promises = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          promises.push(processEntry(entry));
        }
      }
    }
  
    Promise.all(promises).then(() => {
      setFilesToUpload(files);
    });
  };


  // 📥 Fetch User Files
  const fetchUserFiles = async (userId) => {
    const q = query(collection(db, 'userFiles'), where('userId', '==', userId));
    const folderQ = query(collection(db, 'folders'), where('userId', '==', userId));
  
    try {
      const [filesSnapshot, foldersSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(folderQ),
      ]);
  
      const userFiles = filesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      const userFolders = foldersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Group files by folder
      const filesByFolder = {};
      userFiles.forEach((file) => {
        if (file.folderId) {
          if (!filesByFolder[file.folderId]) {
            filesByFolder[file.folderId] = [];
          }
          filesByFolder[file.folderId].push(file);
        }
      });
  
      setFiles(userFiles); // Set files state
      setFolders(userFolders); // Set folders state
      setFilesByFolder(filesByFolder); // Set filesByFolder state
    } catch (error) {
      console.error('Fetch error:', error.message);
    }
  };

 
// 🗑️ Delete Files
const handleDeleteFiles = async () => {
  const filesToDelete = [...selectedFiles];
  const foldersToDelete = [...selectedFolders];

  if (filesToDelete.length === 0 && foldersToDelete.length === 0) {
    alert("No selection");
    return;
  }

  const confirmation = window.confirm(`Delete ${filesToDelete.length} files and ${foldersToDelete.length} folders?`);
  if (!confirmation) return;

  try {
    // Delete individual files
    for (const fileId of filesToDelete) {
      const fileDoc = await getDoc(doc(db, "userFiles", fileId));
      if (fileDoc.exists()) {
        const { filePath, fileSize } = fileDoc.data();
        await deleteObject(ref(storage, filePath));
        await deleteDoc(doc(db, "userFiles", fileId));
        await updateDoc(doc(db, "users", user.uid), {
          usedStorage: increment(-fileSize)
        });
      }
    }

    // Delete folders and their contents
    for (const folderId of foldersToDelete) {
      const folderFiles = filesByFolder[folderId] || [];
      
      // Delete all files in folder
      for (const file of folderFiles) {
        await deleteObject(ref(storage, file.filePath));
        await deleteDoc(doc(db, "userFiles", file.id));
        await updateDoc(doc(db, "users", user.uid), {
          usedStorage: increment(-file.fileSize)
        });
      }
      
      // Delete folder metadata
      await deleteDoc(doc(db, "folders", folderId));
    }

    // Refresh data
    setSelectedFiles([]);
    setSelectedFolders([]);
    setIsSelectionMode(false);
    fetchUserFiles(user.uid);

  } catch (error) {
    console.error("Delete error:", error);
    alert("Error deleting items");
  }
};
  // 🌓 Theme Toggle
  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
};
  // 🔄 Sorting
  const handleSort = (criteria) => {
  setSorting(criteria); // Save the sorting criteria
  const sortedFiles = [...files].sort((a, b) => {
    if (criteria === 'name') {
      return a.fileName.localeCompare(b.fileName);
    }
    if (criteria === 'date') {
      return new Date(b.uploadedAt) - new Date(a.uploadedAt); // Newest first
    }
    if (criteria === 'type') {
      return a.fileType.localeCompare(b.fileType);
    }
    return 0; // Default case to handle no sorting criteria
  });
  setFiles(sortedFiles); // Update the files with the sorted version
};
  // 🔍 Search Filter
  // Filter files and folders based on search query
const filteredFiles = files.filter(
  (file) =>
    file.fileName &&
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
);

const filteredFolders = folders.filter(
  (folder) =>
    folder.name &&
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
);
  

   // Helper function to get file icon based on type or extension
   const getFileTypeIcon = (fileName, fileType) => {
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
//ADD box selection
const [selectionBox, setSelectionBox] = useState({
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  isSelecting: false,
});
const handleMouseDown = (e) => {
  if (isSelectionMode && e.button === 0) {
    e.preventDefault(); // Prevent default behavior
    setSelectionBox({
      startX: e.clientX,
      startY: e.clientY,
      endX: e.clientX,
      endY: e.clientY,
      isSelecting: true,
    });
  }
};

const handleMouseMove = (e) => {
  if (selectionBox.isSelecting) {
    setSelectionBox((prev) => ({
      ...prev,
      endX: e.clientX,
      endY: e.clientY,
    }));
  }
};

const handleMouseUp = () => {
  if (selectionBox.isSelecting) {
    // Calculate the selection box area
    const { startX, startY, endX, endY } = selectionBox;
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

// Select files
const selectedFiles = filteredFiles.filter(file => {
  const element = document.getElementById(`file-${file.id}`);
  return element && isElementInBox(element, minX, maxX, minY, maxY);
}).map(f => f.id);

// Select folders
const selectedFolders = filteredFolders.filter(folder => {
  const element = document.getElementById(`folder-${folder.id}`);
  return element && isElementInBox(element, minX, maxX, minY, maxY);
}).map(f => f.id);

setSelectedFiles(prev => [...new Set([...prev, ...selectedFiles])]);
setSelectedFolders(prev => [...new Set([...prev, ...selectedFolders])]);

// Reset selection box
setSelectionBox({
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  isSelecting: false,
})
  }
};

// Helper function
const isElementInBox = (element, minX, maxX, minY, maxY) => {
const rect = element.getBoundingClientRect();
return (
rect.left < maxX &&
rect.right > minX &&
rect.top < maxY &&
rect.bottom > minY
);
};


const FolderItem = ({ folder, files, selectedFiles, setSelectedFiles, onPreview, isSelectionMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedFiles.includes(folder.id);
  const handleFolderClick = (e) => {
    if (isSelectionMode) {
      if (e.ctrlKey || e.metaKey) {
        // Toggle selection
        setSelectedFiles((prev) =>
          prev.includes(folder.id)
            ? prev.filter((id) => id !== folder.id) // Deselect
            : [...prev, folder.id] // Select
        );
      } else {
        // Select single folder
        setSelectedFiles([folder.id]);
      }
    } else {
      // Toggle expand/collapse
      setIsExpanded(!isExpanded);
    }
  };
  
  return (
    <div className={`folder-item ${isSelected ? "selected" : ""}`}>
      <div className="folder-header" onClick={handleFolderClick}>
        <span>{folder.name}</span>
        <span>{isExpanded ? "▼" : "▶"}</span>
      </div>
      {isExpanded && (
        <div className="folder-contents">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              setSelectedFiles={setSelectedFiles}
              selectedFiles={selectedFiles}
              onPreview={onPreview}
              isSelectionMode={isSelectionMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

  //  component for rendering individual files
  const FileItem = ({ file, setSelectedFiles, selectedFiles, onPreview, isSelectionMode }) => {
    const { id, fileName, fileUrl, fileType } = file;
    const isImage = fileType && fileType.startsWith("image/");
    const iconPath = isImage
      ? fileUrl
      : `/icons/${getFileTypeIcon(fileName, fileType)}`;
  
    const isSelected = selectedFiles.includes(id);
  
    const handleClick = (e) => {
      if (isSelectionMode) {
        if (e.ctrlKey || e.metaKey) {
          // Toggle selection
          setSelectedFiles((prev) =>
            prev.includes(id)
              ? prev.filter((fileId) => fileId !== id) // Deselect
              : [...prev, id] // Select
          );
        } else {
          // Select single file
          setSelectedFiles([id]);
        }
      } else {
        // Preview file
        onPreview(file);
      }
    };
  
    return (
      <div
        className={`file-item ${isSelected ? "selected" : ""}`}
        onClick={handleClick}
        id={`file-${id}`}
      >
        <img
          src={iconPath}
          alt={fileName || "File"}
          className="file-icon"
        />
       <span
                className={`file-name ${activeFile === file.id ? "expanded" : ""}`}
                title={file.fileName} // Tooltip for hover
                onClick={(e) => handleFileNameClick(e, file.id)}
              >
                {activeFile === file.id ? file.fileName : truncateFileName(file.fileName)}
              </span>
      </div>
    );
  };
  return (
    <div className={`app-container ${isDarkMode ? "dark-mode" : ""}`}>
     <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="dashboard">
      <div className="">
        <h1>Welcome, {userName}</h1>
        <p>
          You are using{" "}
          {totalStorage > 0
            ? ((usedStorage / totalStorage) * 100).toFixed(2)
            : 0}
          % of your storage
        </p>
            <div className='search-container'>
        {/* 🔍 Search Bar */}
        <input
        
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
  </div>
        {/* Theme Toggle */}
        <button onClick={handleThemeToggle}>
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
        <button
          onClick={() => {
            setIsSelectionMode(!isSelectionMode);
            setSelectedFiles([]); // Clear selections when canceling selection mode
            setSelectedFolders([]); 
          }}
        >
          {isSelectionMode ? "Cancel Selection" : "Select Files"}
        </button>
  
        {/* Drag & Drop Area */}
        <div
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <p>
            Drag & Drop files or folders here or{" "}
            <span
              onClick={() => document.getElementById('file-input').click()}
              style={{ cursor: 'pointer', color: 'blue' }}
            >
              choose a file
            </span>{" "}
            or{" "}
            <span
              onClick={() => document.getElementById('folder-input').click()}
              style={{ cursor: 'pointer', color: 'blue' }}
            >
              choose a folder
            </span>
          </p>
          <input
            id="file-input"
            type="file"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files);
              files.forEach((file) => {
                file.relativePath = file.name; // Set relativePath for files uploaded via input
              });
              setFilesToUpload(files);
            }}
            style={{ display: 'none' }}
          />
          <input
            id="folder-input"
            type="file"
            webkitdirectory="true"
            onChange={(e) => setFilesToUpload(Array.from(e.target.files))}
            style={{ display: 'none' }}
          />
          <button
            onClick={handleFileUpload}
            disabled={isUploading || filesToUpload.length === 0}
          >
            Upload
          </button>
          {filesToUpload.length > 0 && (
            <div className="file-preview">
              <h4>Files to Upload:</h4>
              <ul>
                {filesToUpload.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          {uploadStatus && <p>{uploadStatus}</p>}
        </div>
      
      <div className='sort-container'>
        {/* Sorting */}
        <select
        onChange={(e) => handleSort(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
          <option value="type">Sort by Type</option>
        </select>
       </div>
        <div className="layout-toggle">
          <button onClick={() => setLayout("grid")}>Grid View</button>
          <button onClick={() => setLayout("list")}>List View</button>
        </div>
  
        {/* Conditional Rendering */}
        {previewFolder ? (
          // Show folder preview if a folder is selected
          <FolderPreview
  folder={previewFolder}
  files={filesByFolder[previewFolder.id] || []}
  onBack={handleBackFromFolderPreview}
  onFileClick={handleFilePreview}
  selectedFiles={selectedFiles} 
  setSelectedFiles={setSelectedFiles} 
  handleCheckboxChange={handleCheckboxChange}
  handleDeleteFiles={handleDeleteFiles}
  handleDownload={handleDownload}
  searchQuery={searchQuery}
  isSelectionMode={isSelectionMode}
  selectionBox={selectionBox} 
  setSelectionBox={setSelectionBox}
/>


        ) : previewFile ? (
          // Show file preview if a file is selected
          <FilePreview file={previewFile} onBack={() => setPreviewFile(null)} />
        ) : (
          // Show files and folders if no preview is active
          <div
            className={`file-container ${layout}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Render folders */}
            {filteredFolders.map((folder) => (
              <div
              id={`folder-${folder.id}`}
                key={folder.id}
                className={`folder-item ${selectedFolders.includes(folder.id) ? "selected" : ""}`}
                onClick={(e) => {
                  if (isSelectionMode) {
                    e.stopPropagation(); // Prevent event bubbling
                    const folderId = folder.id;
                    if (e.ctrlKey || e.metaKey) {
                      setSelectedFolders((prev) =>
                        prev.includes(folderId)
                          ? prev.filter((id) => id !== folderId)
                          : [...prev, folderId]
                      );
                    } else {
                      setSelectedFolders([folderId]);
                    }
                  } else {
                    handleFolderPreview(folder);
                  }
                }}
              >
                <img
                  src="/icons/folder-icon.png"
                  alt="Folder"
                  className="folder-icon"
                />
                <span className="folder-name">{folder.name}</span>
              </div>
            ))}

            {filteredFiles
              .filter((file) => !file.folderId)
              .map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  setSelectedFiles={setSelectedFiles}
                  selectedFiles={selectedFiles}
                  onPreview={handleFilePreview}
                  isSelectionMode={isSelectionMode}
                />
              ))}
  
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
          </div>
        )}
  
        {/* Storage Status */}
        <div className="storage-status">
          {usedStorage >= totalStorage ? (
            <p className="error-message">
              <strong>Storage limit reached!</strong> Please upgrade your plan.
            </p>
          ) : (
            <p>
              You are using{" "}
              {totalStorage > 0
                ? ((usedStorage / totalStorage) * 100).toFixed(2)
                : 0}
              % of your storage.
            </p>
          )}
        </div>
  
        {/* ⬇️ Single Download Button */}
        <button
          onClick={handleDeleteFiles}
          disabled={selectedFiles.length === 0 && selectedFolders.length === 0}
        >
          Delete Selected Files
        </button>
        <button
          onClick={handleDownload}
          disabled={selectedFiles.length === 0 && selectedFolders.length === 0}
        >
          Download Selected Files
        </button>
      </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;