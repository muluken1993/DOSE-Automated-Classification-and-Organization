const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  uploadFile: (filePath) => ipcRenderer.invoke('upload-file', filePath),
  getFolders: () => ipcRenderer.invoke('get-folders'),
  getFilesInFolder: (folderName) => ipcRenderer.invoke('get-files-in-folder', folderName),
  downloadFile: (filePath) => ipcRenderer.invoke('download-file', filePath),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  
  // Folder operations
  zipFolder: (folderName) => ipcRenderer.invoke('zip-folder', folderName),
  showSaveDialog: (defaultPath) => ipcRenderer.invoke('show-save-dialog', defaultPath),
  exportAllDocuments: () => ipcRenderer.invoke('export-all-documents'),
  openDocumentsFolder: () => ipcRenderer.invoke('open-documents-folder'),
  
  // Scanner operations
  checkScannerAvailability: () => ipcRenderer.invoke('check-scanner-availability'),
  openScannerDialog: () => ipcRenderer.invoke('open-scanner-dialog'),
  simulateScanner: () => ipcRenderer.invoke('simulate-scanner'),
  
  // Dialog operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  
  // Utility operations
  getAppVersion: () => ipcRenderer.invoke('get-app-info'),
  openFileLocation: (filePath) => ipcRenderer.invoke('open-file-location', filePath),
  getFileContent: (filePath) => ipcRenderer.invoke('get-file-content', filePath)
});