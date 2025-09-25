"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
    Upload,
    File,
    Download,
    Trash2,
    Share,
    Copy,
    Mail,
    Eye,
    Calendar,
    FileText,
    Image,
    AlertCircle,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { BookingDocument, ShareToken, DocumentUploadProgress } from '@/types/BookingTypes';
import { useAuth } from './auth/AuthContext';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { formatDistanceToNow } from 'date-fns';

interface BookingDocumentsProps {
    bookingId: string;
    bookingName: string;
}

const DOCUMENT_CATEGORIES = ['Voucher', 'Air Ticket', 'Invoice', 'Other'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILES = 20;

export const BookingDocuments: React.FC<BookingDocumentsProps> = ({ bookingId, bookingName }) => {
    const { token } = useAuth();
    const [documents, setDocuments] = useState<BookingDocument[]>([]);
    const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [shareToken, setShareToken] = useState<ShareToken | null>(null);
    const [itineraryUrl, setItineraryUrl] = useState<string>('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

    // Fetch documents for the booking
    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Fetching documents for booking:', bookingId);
            const documentsUrl = API_ENDPOINTS.BOOKINGS.DOCUMENTS(bookingId);
            console.log('Documents URL:', documentsUrl);
            console.log('Full API URL will be:', documentsUrl); // The api.get will construct full URL
            const response = await api.get(documentsUrl, token);
            console.log('Documents API response:', response);
            console.log('Documents array:', response.documents);
            setDocuments(response.documents || []);
            setItineraryUrl(response.itineraryUrl || '');
        } catch (err) {
            setError('Failed to fetch documents');
            console.error('Error fetching documents:', err);
        } finally {
            setLoading(false);
        }
    }, [bookingId, token]);

    // Fetch existing share token for the booking
    const fetchExistingShareToken = useCallback(async () => {
        try {
            const response = await api.get(API_ENDPOINTS.BOOKINGS.SHARE(bookingId), token);
            if (response && response.shareUrl) {
                setShareToken(response);
            }
        } catch (err) {
            // No existing share token or error fetching - that's ok
            console.log('No existing share token found or error fetching:', err);
        }
    }, [bookingId, token]);

    useEffect(() => {
        fetchDocuments();
        fetchExistingShareToken();
    }, [fetchDocuments, fetchExistingShareToken]);

    // File upload handler
    const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
        setError('');

        if (rejectedFiles.length > 0) {
            const reasons = rejectedFiles.map(f => f.errors.map((e: any) => e.message).join(', ')).join('; ');
            setError(`Some files were rejected: ${reasons}`);
        }

        if (documents.length + acceptedFiles.length > MAX_FILES) {
            setError(`Maximum ${MAX_FILES} files allowed per booking`);
            return;
        }

        for (const file of acceptedFiles) {
            const progressId = `${file.name}-${Date.now()}`;

            // Add to upload progress
            setUploadProgress(prev => [...prev, {
                filename: file.name,
                progress: 0,
                status: 'uploading'
            }]);

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('category', 'Other'); // Default category
                formData.append('bookingId', bookingId);

                // Simulate upload progress
                const updateProgress = (progress: number) => {
                    setUploadProgress(prev =>
                        prev.map(p =>
                            p.filename === file.name ? { ...p, progress } : p
                        )
                    );
                };

                // Upload with progress simulation
                for (let i = 10; i <= 90; i += 10) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    updateProgress(i);
                }

                const response = await api.post(API_ENDPOINTS.BOOKINGS.DOCUMENTS(bookingId), formData, token);

                updateProgress(100);
                setUploadProgress(prev =>
                    prev.map(p =>
                        p.filename === file.name ? { ...p, status: 'completed' } : p
                    )
                );

                // Add to documents list
                setDocuments(prev => [...prev, response.document]);

                // Remove from progress after 2 seconds
                setTimeout(() => {
                    setUploadProgress(prev => prev.filter(p => p.filename !== file.name));
                }, 2000);

            } catch (err) {
                setUploadProgress(prev =>
                    prev.map(p =>
                        p.filename === file.name ? {
                            ...p,
                            status: 'error',
                            error: 'Upload failed'
                        } : p
                    )
                );
                console.error('Upload failed:', err);
            }
        }
    }, [bookingId, token, documents.length]);

    // Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxSize: MAX_FILE_SIZE,
        multiple: true
    });

    // Update document category
    const updateDocumentCategory = async (documentId: string, category: string) => {
        try {
            await api.put(API_ENDPOINTS.BOOKINGS.DOCUMENT(bookingId, documentId), { category }, token);
            setDocuments(prev =>
                prev.map(doc =>
                    doc.id === documentId ? { ...doc, category: category as any } : doc
                )
            );
        } catch (err) {
            setError('Failed to update document category');
            console.error('Error updating category:', err);
        }
    };

    // Delete document
    const deleteDocument = async (documentId: string) => {
        try {
            await api.delete(API_ENDPOINTS.BOOKINGS.DOCUMENT(bookingId, documentId), token);
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            setDeleteDialogOpen(false);
            setDocumentToDelete(null);
        } catch (err) {
            setError('Failed to delete document');
            console.error('Error deleting document:', err);
        }
    };

    // Handle delete button click
    const handleDeleteClick = (documentId: string) => {
        setDocumentToDelete(documentId);
        setDeleteDialogOpen(true);
    };

    // Handle delete confirmation
    const handleConfirmDelete = () => {
        if (documentToDelete) {
            deleteDocument(documentToDelete);
        }
    };

    // Handle delete cancellation
    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
    };


    // Copy share link to clipboard
    const copyShareLink = async () => {
        if (shareToken) {
            await navigator.clipboard.writeText(shareToken.shareUrl);
            // You could add a toast notification here
        }
    };

    // Open share link in new tab
    const openShareLink = () => {
        if (shareToken) {
            window.open(shareToken.shareUrl, '_blank');
        }
    };

    // Save itinerary URL
    const saveItineraryUrl = async () => {
        try {
            await api.put(API_ENDPOINTS.BOOKINGS.ITINERARY(bookingId), { url: itineraryUrl }, token);
        } catch (err) {
            setError('Failed to save itinerary URL');
            console.error('Error saving itinerary URL:', err);
        }
    };

    // Create/regenerate share token with all categories
    const createShareToken = async () => {
        try {
            const payload = {
                categories: DOCUMENT_CATEGORIES,
                expiresInSeconds: 604800 // 7 days
            };
            const response = await api.post(API_ENDPOINTS.BOOKINGS.SHARE(bookingId), payload, token);
            setShareToken(response);
            console.log('Share token created/updated:', response);
        } catch (err) {
            setError('Failed to create share token');
            console.error('Error creating share token:', err);
        }
    };

    // Get file icon based on mime type
    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
        if (mimeType === 'application/pdf') return <FileText className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Documents Management Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documents
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Upload and manage documents for {bookingName}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* File Upload Area */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">
                            {isDragActive ? 'Drop files here' : 'Upload Documents'}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            Drag & drop files here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supports PDF, JPG, PNG, DOCX • Max {formatFileSize(MAX_FILE_SIZE)} per file • Max {MAX_FILES} files
                        </p>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress.length > 0 && (
                        <div className="space-y-2">
                            {uploadProgress.map((progress, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>{progress.filename}</span>
                                        <span>{progress.progress}%</span>
                                    </div>
                                    <Progress value={progress.progress} className="h-2" />
                                    {progress.status === 'error' && (
                                        <p className="text-xs text-destructive">{progress.error}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <Separator />

                    {/* Itinerary URL */}
                    <div className="space-y-2">
                        <Label htmlFor="itinerary">Client Safari Itinerary URL</Label>
                        <div className="flex gap-2">
                            <Input
                                id="itinerary"
                                placeholder="https://..."
                                value={itineraryUrl}
                                onChange={(e) => setItineraryUrl(e.target.value)}
                            />
                            <Button onClick={saveItineraryUrl} variant="outline">
                                Save
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Share Link */}
                    <div className="space-y-4">
                        {shareToken ? (
                            <>
                                <div className="p-3 bg-muted rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">Client Share Link</p>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={copyShareLink}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Copy className="h-4 w-4" />
                                                Copy
                                            </Button>
                                            <Button
                                                onClick={openShareLink}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Open
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground break-all">{shareToken.shareUrl}</p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Categories: {shareToken.allowedCategories?.join(', ')}</span>
                                        <span>Expires: {formatDistanceToNow(new Date(shareToken.expiresAt), { addSuffix: true })}</span>
                                    </div>
                                    {shareToken.allowedCategories && !shareToken.allowedCategories.includes('Other') && (
                                        <div className="pt-2 border-t">
                                            <Button
                                                onClick={createShareToken}
                                                variant="secondary"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Update to Include All Categories
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="p-3 bg-muted rounded-lg space-y-3">
                                <p className="text-sm text-muted-foreground">No share link exists for this booking.</p>
                                <Button
                                    onClick={createShareToken}
                                    variant="default"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Share className="h-4 w-4" />
                                    Create Share Link
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Uploaded Documents Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <File className="h-5 w-5" />
                        Uploaded Documents ({documents.length})
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        View and manage uploaded files
                    </p>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading documents...
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No documents uploaded yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((document) => (
                                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {getFileIcon(document.mimeType)}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">{document.filename}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{formatFileSize(document.size)}</span>
                                                <span>•</span>
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={document.category}
                                            onValueChange={(value) => updateDocumentCategory(document.id, value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DOCUMENT_CATEGORIES.map(category => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(document.url, '_blank')}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteClick(document.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Document</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this document? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCancelDelete}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};