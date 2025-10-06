class DocumentClassifierUI {
    constructor() {
        this.currentFolder = null;
        this.currentTheme = 'dark';
        this.selectedFiles = [];
        this.currentReaderFile = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFolders();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000);
        
        document.body.setAttribute('data-theme', this.currentTheme);
    }

    bindEvents() {
        document.getElementById('browse-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('upload-files-option').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('file-input').click();
            document.getElementById('upload-menu').classList.add('hidden');
        });

        document.getElementById('upload-scan-option').addEventListener('click', (e) => {
            e.preventDefault();
            this.openScannerDialog();
            document.getElementById('upload-menu').classList.add('hidden');
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        document.getElementById('upload-menu-btn').addEventListener('click', () => {
            const menu = document.getElementById('upload-menu');
            menu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#upload-menu-btn') && !e.target.closest('#upload-menu')) {
                document.getElementById('upload-menu').classList.add('hidden');
            }
        });

        const uploadArea = document.getElementById('upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files);
        });

        document.getElementById('back-to-upload-btn').addEventListener('click', () => {
            this.showUploadView();
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('close-reader').addEventListener('click', () => {
            this.closeReader();
        });

        document.getElementById('download-reader-file').addEventListener('click', () => {
            this.downloadCurrentFile();
        });

        document.getElementById('refresh-files').addEventListener('click', () => {
            if (this.currentFolder) {
                this.loadFilesInFolder(this.currentFolder);
            }
        });

        document.getElementById('export-folder-btn').addEventListener('click', () => {
            if (this.currentFolder) {
                this.zipFolder(this.currentFolder);
            }
        });

        document.getElementById('clear-results').addEventListener('click', () => {
            document.getElementById('results').classList.add('hidden');
            document.getElementById('results-content').innerHTML = '';
        });

        document.getElementById('export-all-btn').addEventListener('click', () => {
            this.exportAllDocuments();
        });

        document.getElementById('open-folder-btn').addEventListener('click', () => {
            this.openDocumentsFolder();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('reader-modal').addEventListener('click', (e) => {
            if (e.target.id === 'reader-modal') {
                this.closeReader();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('reader-modal').style.display === 'flex') {
                this.closeReader();
            }
        });
    }

    async handleFileSelect(files) {
        this.selectedFiles = Array.from(files);
        
        if (this.selectedFiles.length > 0) {
            this.showLoading(`Processing ${this.selectedFiles.length} file(s)...`, true);            
            document.getElementById('results-content').innerHTML = '';
            document.getElementById('results').classList.remove('hidden');            
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const file = this.selectedFiles[i];
                const progress = ((i / this.selectedFiles.length) * 100).toFixed(0);
                this.updateProgress(progress, `Processing ${i+1}/${this.selectedFiles.length}: ${file.name}`);
                
                try {
                    const result = await window.electronAPI.uploadFile(file.path);
                    
                    if (result.success) {
                        this.showResult(result, i);
                        successCount++;
                    } else {
                        this.showError(result.error, file.name);
                        errorCount++;
                    }
                } catch (error) {
                    this.showError('Failed to process file: ' + error.message, file.name);
                    errorCount++;
                }
            }            
            if (this.selectedFiles.length > 1) {
                this.showSummary(successCount, errorCount);
            }
            
            this.hideLoading();
            this.loadFolders();            
            if (successCount > 0) {
                document.getElementById('quick-actions').classList.remove('hidden');
            }
        }
    }

    async openScannerDialog() {
        try {
            this.showLoading('Initializing scanner...');            
            const scannerAvailable = await window.electronAPI.checkScannerAvailability();
            
            if (!scannerAvailable.available) {
                this.hideLoading();
                this.showScannerNotAvailableDialog(scannerAvailable.reason);
                return;
            }

            const scanResult = await window.electronAPI.openScannerDialog();
            
            if (scanResult.success && scanResult.filePaths && scanResult.filePaths.length > 0) {
                this.hideLoading();
                
                for (const filePath of scanResult.filePaths) {
                    await this.processScannedDocument(filePath);
                }
            } else {
                this.hideLoading();
                if (scanResult.error !== 'Scan cancelled by user') {
                    this.showError('Scanning failed: ' + (scanResult.error || 'Unknown error'));
                }
            }
            
        } catch (error) {
            this.hideLoading();
            this.showError('Scanner error: ' + error.message);
        }
    }

    showScannerNotAvailableDialog(reason) {
        document.getElementById('results').classList.remove('hidden');
        document.getElementById('results-content').innerHTML = `
            <div class="p-4 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-400 text-xl mr-3"></i>
                    <div>
                        <h4 class="font-semibold text-yellow-200">Scanner Not Available</h4>
                        <p class="text-yellow-100 text-sm mt-1">${reason || 'No scanner detected'}. Please ensure:</p>
                        <ul class="text-yellow-100 text-sm mt-2 list-disc list-inside space-y-1">
                            <li>Your scanner is properly connected and powered on</li>
                            <li>Scanner drivers are installed</li>
                            <li>Try the manual upload option instead</li>
                        </ul>
                    </div>
                </div>
                <div class="mt-4 flex space-x-3">
                    <button id="retry-scanner" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm transition-colors">
                        <i class="fas fa-redo mr-2"></i>Retry
                    </button>
                    <button id="manual-upload" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors">
                        <i class="fas fa-upload mr-2"></i>Manual Upload
                    </button>
                    <button id="simulate-scan" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition-colors">
                        <i class="fas fa-print mr-2"></i>Simulate Scan
                    </button>
                </div>
            </div>
        `;

        document.getElementById('retry-scanner').addEventListener('click', () => {
            this.openScannerDialog();
        });

        document.getElementById('manual-upload').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('simulate-scan').addEventListener('click', () => {
            this.simulatePrinterScan();
        });
    }

    async simulatePrinterScan() {
        this.showLoading('Simulating printer scan...');
        
        setTimeout(() => {
            this.updateProgress(30, 'Connecting to printer...');
        }, 1000);
        
        setTimeout(() => {
            this.updateProgress(60, 'Scanning document...');
        }, 2000);
        
        setTimeout(() => {
            this.updateProgress(90, 'Processing scanned image...');
        }, 3000);
        
        setTimeout(async () => {
            this.updateProgress(100, 'Scan complete!');
            
            try {
                const result = await window.electronAPI.simulateScanner();
                if (result.success) {
                    for (const filePath of result.filePaths) {
                        await this.processScannedDocument(filePath);
                    }
                }
            } catch (error) {
                this.showError('Simulation error: ' + error.message);
            }
            
            this.hideLoading();
        }, 4000);
    }

    async processScannedDocument(filePath) {
        this.showLoading('Processing scanned document...');
        
        try {
            const result = await window.electronAPI.uploadFile(filePath);
            
            if (result.success) {
                this.hideLoading();
                this.showScanSuccess(result);
                this.loadFolders();
            } else {
                this.hideLoading();
                this.showError('Failed to process scanned document: ' + result.error);
            }
        } catch (error) {
            this.hideLoading();
            this.showError('Processing error: ' + error.message);
        }
    }

    showScanSuccess(result) {
        document.getElementById('results').classList.remove('hidden');
        
        const successElement = document.createElement('div');
        successElement.className = 'mb-4 p-4 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg';
        successElement.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle text-green-400 text-xl mr-3"></i>
                <div>
                    <h4 class="font-semibold text-green-200">Scan Successful!</h4>
                    <p class="text-green-100 text-sm mt-1">Document has been scanned and classified.</p>
                </div>
            </div>
            <div class="mt-4 space-y-2">
                <div class="flex justify-between">
                    <span class="text-green-200">Category:</span>
                    <span class="px-2 py-1 bg-green-600 rounded text-sm capitalize">${result.category}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-green-200">File:</span>
                    <span class="text-green-100 text-sm">${result.originalName || result.fileName}</span>
                </div>
            </div>
        `;
        
        document.getElementById('results-content').appendChild(successElement);
        document.getElementById('quick-actions').classList.remove('hidden');
    }

    showLoading(message, showProgress = false) {
        document.getElementById('loading-overlay').classList.remove('hidden');
        document.getElementById('loading-title').textContent = message;
        
        if (showProgress) {
            document.getElementById('upload-progress-bar').style.width = '0%';
            document.getElementById('loading-message').textContent = 'Starting...';
        } else {
            document.getElementById('loading-message').textContent = 'Please wait';
        }
    }

    updateProgress(percent, message = '') {
        document.getElementById('upload-progress-bar').style.width = `${percent}%`;
        if (message) {
            document.getElementById('loading-message').textContent = message;
        }
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    showResult(result, index) {
        document.getElementById('results').classList.remove('hidden');
        
        const resultElement = document.createElement('div');
        resultElement.className = 'mb-4 p-4 bg-gray-700 rounded-lg theme-transition';
        resultElement.style.backgroundColor = 'var(--bg-tertiary)';
        resultElement.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <span class="font-semibold" style="color: var(--text-primary);">File:</span>
                    <span class="text-gray-300 theme-transition" style="color: var(--text-secondary);">${result.originalName || result.fileName || 'Document'}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="font-semibold" style="color: var(--text-primary);">Classification:</span>
                    <span class="px-3 py-1 rounded-full text-sm capitalize" style="background-color: var(--primary-color); color: white;">${result.category}</span>
                </div>
                <div>
                    <span class="font-semibold" style="color: var(--text-primary);">Saved to:</span>
                    <span class="text-gray-300 ml-2 theme-transition truncate block" style="color: var(--text-secondary);" title="${result.outputPath}">${result.outputPath}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="font-semibold" style="color: var(--text-primary);">File Size:</span>
                    <span class="text-gray-300 theme-transition" style="color: var(--text-secondary);">${result.fileSize || 'N/A'}</span>
                </div>
            </div>
        `;
        
        document.getElementById('results-content').appendChild(resultElement);
        
        if (index === 0) {
            document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
        }
    }

    showError(error, fileName = '') {
        document.getElementById('results').classList.remove('hidden');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'text-red-400 flex items-center p-4 bg-gray-700 rounded-lg theme-transition mb-4';
        errorElement.style.backgroundColor = 'var(--bg-tertiary)';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle mr-3"></i>
            <div>
                <strong>${fileName ? `Error processing ${fileName}:` : 'Error:'}</strong> ${error}
            </div>
        `;
        
        document.getElementById('results-content').appendChild(errorElement);
    }

    showSummary(successCount, errorCount) {
        const summaryElement = document.createElement('div');
        summaryElement.className = 'mt-4 p-4 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg';
        summaryElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="font-semibold text-blue-200">Processing Complete</h4>
                    <p class="text-blue-100 text-sm mt-1">Summary of batch processing</p>
                </div>
                <div class="flex space-x-4 text-sm">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-400">${successCount}</div>
                        <div class="text-green-200">Successful</div>
                    </div>
                    ${errorCount > 0 ? `
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-400">${errorCount}</div>
                        <div class="text-red-200">Failed</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.getElementById('results-content').appendChild(summaryElement);
    }

    async loadFolders() {
        try {
            const folders = await window.electronAPI.getFolders();
            this.renderFolders(folders);
            
            // Update file count
            const totalFiles = folders.reduce((sum, folder) => sum + folder.count, 0);
            document.getElementById('total-files').textContent = totalFiles;
        } catch (error) {
            console.error('Failed to load folders:', error);
        }
    }

    renderFolders(folders) {
        const folderList = document.getElementById('folder-list');
        
        if (!folders || folders.length === 0) {
            folderList.innerHTML = `
                <div class="text-center py-8 text-gray-500 theme-transition" style="color: var(--text-muted);">
                    <i class="fas fa-folder-open text-2xl mb-2"></i>
                    <div>No folders available</div>
                </div>
            `;
            return;
        }

        folderList.innerHTML = '';

        folders.forEach(folder => {
            const folderElement = document.createElement('div');
            folderElement.className = `folder-item p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                this.currentFolder === folder.name ? 'active' : ''
            }`;
            folderElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-folder${this.currentFolder === folder.name ? '-open' : ''} text-yellow-400"></i>
                        <span class="capitalize">${folder.displayName}</span>
                    </div>
                    <span class="bg-gray-700 px-2 py-1 rounded text-xs theme-transition" style="background-color: var(--bg-tertiary); color: var(--text-primary);">${folder.count}</span>
                </div>
            `;

            folderElement.addEventListener('click', () => {
                this.selectFolder(folder.name);
            });

            folderList.appendChild(folderElement);
        });
    }

    async selectFolder(folderName) {
        this.currentFolder = folderName;
        
        this.showFolderView();
        
        this.renderFolders(await window.electronAPI.getFolders());
        
        await this.loadFilesInFolder(folderName);
    }

    showFolderView() {
        document.getElementById('upload-area').classList.add('hidden');
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('quick-actions').classList.add('hidden');
        document.getElementById('results').classList.add('hidden');        
        document.getElementById('folder-content').classList.remove('hidden');
        document.getElementById('back-to-upload-container').classList.remove('hidden');        
        const displayName = this.currentFolder.replace('_', ' ');
        document.getElementById('folder-title').textContent = this.capitalizeFirstLetter(displayName);
        document.getElementById('main-title').textContent = `Documents - ${this.capitalizeFirstLetter(displayName)}`;
    }

    showUploadView() {
        document.getElementById('upload-area').classList.remove('hidden');
        document.getElementById('welcome-section').classList.remove('hidden');
        document.getElementById('quick-actions').classList.remove('hidden');        
        document.getElementById('folder-content').classList.add('hidden');
        document.getElementById('back-to-upload-container').classList.add('hidden');        
        this.currentFolder = null;      
        document.getElementById('main-title').textContent = 'Document Processing';        
        this.loadFolders();
    }

    async loadFilesInFolder(folderName) {
        try {
            const files = await window.electronAPI.getFilesInFolder(folderName);
            this.renderFiles(files);
        } catch (error) {
            console.error('Failed to load files:', error);
            this.renderFiles([]);
        }
    }

    renderFiles(files) {
        const filesContainer = document.getElementById('folder-files-content');
        
        if (!files || files.length === 0) {
            filesContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-folder-open text-4xl mb-4 theme-transition" style="color: var(--text-muted);"></i>
                    <p class="text-gray-400 theme-transition text-lg mb-2" style="color: var(--text-muted);">No documents found</p>
                    <p class="text-gray-500 theme-transition text-sm" style="color: var(--text-muted);">Upload documents to see them here</p>
                </div>
            `;
            return;
        }

        filesContainer.innerHTML = files.map(file => `
            <div class="file-preview-card group">
                <div class="flex flex-col h-full">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <i class="${this.getFileIcon(file.name)} file-icon ${this.getFileIconColor(file.name)}"></i>
                            <div>
                                <span class="text-xs px-2 py-1 rounded theme-transition" style="background-color: var(--bg-tertiary); color: var(--text-primary);">${file.size}</span>
                            </div>
                        </div>
                        <span class="text-xs theme-transition" style="color: var(--text-muted);">
                            <i class="far fa-clock mr-1"></i>
                            ${new Date(file.modified).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <h4 class="font-semibold mb-3 truncate flex-1" style="color: var(--text-primary);" title="${file.displayName}">${file.displayName}</h4>
                    
                    <div class="file-actions">
                        <div class="flex space-x-2">
                            <button onclick="app.openFile('${this.escapeHtml(file.path)}')" class="flex-1 btn btn-primary btn-sm">
                                <i class="fas fa-eye mr-2"></i> View
                            </button>
                            <button onclick="app.downloadFile('${this.escapeHtml(file.path)}')" class="flex-1 btn btn-secondary btn-sm">
                                <i class="fas fa-download mr-2"></i> Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'fas fa-file-pdf',
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'tiff': 'fas fa-file-image',
            'tif': 'fas fa-file-image',
            'bmp': 'fas fa-file-image',
            'doc': 'fas fa-file-word',
            'docx': 'fas fa-file-word',
            'txt': 'fas fa-file-alt',
            'zip': 'fas fa-file-archive'
        };
        return iconMap[ext] || 'fas fa-file';
    }

    getFileIconColor(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const colorMap = {
            'pdf': 'text-red-500',
            'jpg': 'text-green-500',
            'jpeg': 'text-green-500',
            'png': 'text-green-500',
            'tiff': 'text-green-500',
            'tif': 'text-green-500',
            'bmp': 'text-green-500',
            'doc': 'text-blue-500',
            'docx': 'text-blue-500',
            'txt': 'text-gray-500',
            'zip': 'text-yellow-500'
        };
        return colorMap[ext] || 'text-gray-400';
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async openFile(filePath) {
        try {
            // Use Electron API to open the file with default application
            const result = await window.electronAPI.openFile(filePath);
            
            if (!result.success) {
                this.showError('Failed to open file: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            this.showError('Failed to open file: ' + error.message);
        }
    }

    async downloadFile(filePath) {
        try {
            this.showLoading('Preparing download...');
            const result = await window.electronAPI.downloadFile(filePath);
            this.hideLoading();
            
            if (result && result.success) {
                this.showToast('Download started successfully!', 'success');
            } else {
                this.showError('Download failed: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            this.hideLoading();
            this.showError('Download failed: ' + error.message);
        }
    }

    async zipFolder(folderName) {
        try {
            this.showLoading(`Creating archive for ${folderName}...`);
            const result = await window.electronAPI.zipFolder(folderName);
            this.hideLoading();
            
            if (result && result.success) {
                this.showToast(`Folder "${folderName}" exported successfully!`, 'success');
            }
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to create zip: ' + error.message);
        }
    }

    async exportAllDocuments() {
        try {
            this.showLoading('Exporting all documents...');
            const result = await window.electronAPI.exportAllDocuments();
            this.hideLoading();
            
            if (result && result.success) {
                this.showToast('All documents exported successfully!', 'success');
            }
        } catch (error) {
            this.hideLoading();
            this.showError('Export failed: ' + error.message);
        }
    }

    async openDocumentsFolder() {
        try {
            await window.electronAPI.openDocumentsFolder();
        } catch (error) {
            this.showError('Failed to open folder: ' + error.message);
        }
    }

    showSettings() {
        document.getElementById('results').classList.remove('hidden');
        document.getElementById('results-content').innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Application Settings</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: var(--text-primary);">Default Upload Location</label>
                        <input type="text" class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white" value="classified_docs/" readonly>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: var(--text-primary);">Supported Formats</label>
                        <p class="text-sm" style="color: var(--text-secondary);">PDF, JPG, JPEG, PNG, TIFF, BMP</p>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors">Cancel</button>
                        <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">Save</button>
                    </div>
                </div>
            </div>
        `;
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);      
        const themeText = document.getElementById('theme-text');
        const themeIcon = document.querySelector('#theme-toggle i');
        
        if (this.currentTheme === 'dark') {
            themeText.textContent = 'Dark Mode';
            themeIcon.className = 'fas fa-moon mr-2';
        } else {
            themeText.textContent = 'Light Mode';
            themeIcon.className = 'fas fa-sun mr-2';
        }
        
        localStorage.setItem('preferred-theme', this.currentTheme);
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('current-time').textContent = now.toLocaleDateString('en-US', options);
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new DocumentClassifierUI();
    
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
        window.app.currentTheme = savedTheme;
        document.body.setAttribute('data-theme', savedTheme);
        
        const themeText = document.getElementById('theme-text');
        const themeIcon = document.querySelector('#theme-toggle i');
        
        if (savedTheme === 'dark') {
            themeText.textContent = 'Dark Mode';
            themeIcon.className = 'fas fa-moon mr-2';
        } else {
            themeText.textContent = 'Light Mode';
            themeIcon.className = 'fas fa-sun mr-2';
        }
    }
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Global functions for button onclick events
window.openFile = (filePath) => window.app.openFile(filePath);
window.downloadFile = (filePath) => window.app.downloadFile(filePath);