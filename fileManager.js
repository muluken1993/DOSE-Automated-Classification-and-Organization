const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const pdfConverter = require('./pdfConverter');

class FileManager {
    constructor() {
        this.baseDir = path.join(__dirname, '..', 'classified_docs');
        this.categories = [
            'invoice', 
            'contract', 
            'report', 
            'id_card', 
            'educational', 
            'medical', 
            'license', 
            'other'
        ];
        this.init();
    }

    async init() {
        // Create base directory and category folders
        try {
            await fs.mkdir(this.baseDir, { recursive: true });
            
            for (const category of this.categories) {
                const categoryPath = path.join(this.baseDir, category);
                await fs.mkdir(categoryPath, { recursive: true });
            }
            console.log('Document directories created successfully');
        } catch (error) {
            console.error('Directory creation failed:', error);
        }
    }

    async saveToCategoryWithOriginalContent(filePath, category) {
        try {
            const originalFileName = path.basename(filePath);
            const fileExtension = path.extname(originalFileName);
            const fileNameWithoutExt = path.basename(originalFileName, fileExtension);
            
            const categoryDir = path.join(this.baseDir, category);
            
            // Ensure category directory exists
            await fs.mkdir(categoryDir, { recursive: true });
            
            // Create new filename with .pdf extension but keep original content
            const newFileName = `${fileNameWithoutExt}.pdf`;
            const outputPath = path.join(categoryDir, newFileName);
            
            // Copy the original file to the new location with .pdf extension
            await fs.copyFile(filePath, outputPath);
            
            console.log(`✅ Document classified and saved with original content: ${outputPath}`);
            
            return outputPath;
        } catch (error) {
            console.error('❌ Error saving to category:', error);
            throw error;
        }
    }

    async saveImageAsSearchablePDF(filePath, category, text) {
        try {
            const originalFileName = path.basename(filePath);
            const fileNameWithoutExt = path.basename(originalFileName, path.extname(originalFileName));
            
            const categoryDir = path.join(this.baseDir, category);
            
            // Ensure category directory exists
            await fs.mkdir(categoryDir, { recursive: true });
            
            // Create final filename
            const finalFileName = `${fileNameWithoutExt}.pdf`;
            const finalPath = path.join(categoryDir, finalFileName);
            
            // Convert image to proper PDF with embedded text
            console.log(`Converting image to searchable PDF: ${originalFileName}`);
            const pdfPath = await pdfConverter.convertToSearchablePDF(filePath, text, category);
            
            // Move PDF to category directory
            await fs.rename(pdfPath, finalPath);

            console.log(`Image converted and saved as PDF: ${finalPath}`);
            return finalPath;
        } catch (error) {
            console.error('Error converting image to PDF:', error);
            throw error;
        }
    }

    // Keep the original method for backward compatibility
    async saveToCategory(filePath, category, text) {
        const fileExtension = path.extname(filePath).toLowerCase();
        
        if (fileExtension === '.pdf') {
            return this.saveToCategoryWithOriginalContent(filePath, category);
        } else {
            return this.saveImageAsSearchablePDF(filePath, category, text);
        }
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async getFolders() {
        const folders = [];
        
        for (const category of this.categories) {
            const categoryPath = path.join(this.baseDir, category);
            try {
                const files = await fs.readdir(categoryPath);
                const validFiles = files.filter(file => 
                    file.endsWith('.pdf') && !file.endsWith('.meta.txt')
                );
                
                folders.push({
                    name: category,
                    displayName: this.getCategoryDisplayName(category),
                    path: categoryPath,
                    count: validFiles.length
                });
            } catch (error) {
                folders.push({
                    name: category,
                    displayName: this.getCategoryDisplayName(category),
                    path: categoryPath,
                    count: 0
                });
            }
        }
        
        return folders;
    }

    async getFilesInFolder(folderName) {
        const folderPath = path.join(this.baseDir, folderName);
        
        try {
            const files = await fs.readdir(folderPath);
            const fileList = [];
            
            for (const file of files) {
                if (file.endsWith('.meta.txt') || !file.endsWith('.pdf')) continue;
                
                const filePath = path.join(folderPath, file);
                const stats = await fs.stat(filePath);
                
                // Get original filename (remove the _category suffix if it exists)
                let displayName = this.getDisplayFileName(file);
                
                fileList.push({
                    name: file,
                    displayName: displayName,
                    path: filePath,
                    size: this.formatFileSize(stats.size),
                    modified: stats.mtime,
                    originalSize: stats.size
                });
            }
            
            return fileList;
        } catch (error) {
            console.error(`Error getting files from ${folderName}:`, error);
            return [];
        }
    }

    getCategoryDisplayName(category) {
        const displayNames = {
            invoice: 'Invoice',
            contract: 'Contract',
            report: 'Report',
            id_card: 'ID Card',
            educational: 'Educational',
            medical: 'Medical',
            license: 'License',
            other: 'Other'
        };
        return displayNames[category] || category;
    }

    getDisplayFileName(fileName) {
        // Remove the .pdf extension and any category suffixes for display
        let displayName = fileName.replace(/\.pdf$/i, '');
        
        // Remove common category suffixes
        const categorySuffixes = this.categories.map(cat => `_${cat}`);
        categorySuffixes.forEach(suffix => {
            if (displayName.endsWith(suffix)) {
                displayName = displayName.slice(0, -suffix.length);
            }
        });
        
        return displayName.replace(/_/g, ' ');
    }

    async zipFolder(folderName) {
        return new Promise(async (resolve, reject) => {
            const folderPath = path.join(this.baseDir, folderName);
            const displayName = this.getCategoryDisplayName(folderName);
            const zipFileName = `${displayName}_${new Date().toISOString().split('T')[0]}.zip`;
            const zipPath = path.join(this.baseDir, zipFileName);
            
            try {
                const output = require('fs').createWriteStream(zipPath);
                const archive = archiver('zip', { 
                    zlib: { level: 9 },
                    comment: `${displayName} Documents - Ethiopian Document Classifier`
                });
                
                output.on('close', () => {
                    console.log(`✅ Folder zipped successfully: ${zipPath}`);
                    resolve({
                        success: true,
                        zipPath: zipPath,
                        fileName: zipFileName,
                        size: archive.pointer()
                    });
                });
                
                archive.on('error', (error) => {
                    console.error('Zip error:', error);
                    reject(error);
                });
                
                archive.pipe(output);
                archive.directory(folderPath, false);
                await archive.finalize();
                
            } catch (error) {
                console.error('Zip creation failed:', error);
                reject(error);
            }
        });
    }

    async exportAllDocuments() {
        return new Promise(async (resolve, reject) => {
            const zipFileName = `all_documents_${new Date().toISOString().split('T')[0]}.zip`;
            const zipPath = path.join(this.baseDir, zipFileName);
            
            try {
                const output = require('fs').createWriteStream(zipPath);
                const archive = archiver('zip', { 
                    zlib: { level: 9 },
                    comment: 'All Documents - Ethiopian Document Classifier'
                });
                
                output.on('close', () => {
                    console.log(`All documents zipped successfully: ${zipPath}`);
                    resolve({
                        success: true,
                        zipPath: zipPath,
                        fileName: zipFileName,
                        size: archive.pointer()
                    });
                });
                
                archive.on('error', (error) => {
                    console.error('Zip error:', error);
                    reject(error);
                });
                
                // Add all category folders
                for (const category of this.categories) {
                    const categoryPath = path.join(this.baseDir, category);
                    if (require('fs').existsSync(categoryPath)) {
                        archive.directory(categoryPath, category);
                    }
                }
                
                await archive.finalize();
                
            } catch (error) {
                console.error('Export all failed:', error);
                reject(error);
            }
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Method to simulate printer scan functionality
    async simulatePrinterScan() {
        return new Promise((resolve) => {
            // Simulate scanning delay
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Document scanned successfully',
                    filePath: path.join(this.baseDir, 'scanned_document.pdf')
                });
            }, 3000);
        });
    }
}

// Create and export instance
const fileManager = new FileManager();
module.exports = fileManager;