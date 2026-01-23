"use client"

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Upload,
    File,
    Download,
    Trash2,
    Share,
    Copy,
    FileText,
    Image,
    AlertCircle,
    ExternalLink,
    Ticket,
    Receipt,
    MoreHorizontal,
    Link as LinkIcon
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
// const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILES = 20;

export const BookingDocuments: React.FC<BookingDocumentsProps> = ({ bookingId }) => {
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
    const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        setError('');

        if (rejectedFiles.length > 0) {
            const reasons = rejectedFiles.map(f => f.errors.map((e: {message: string}) => e.message).join(', ')).join('; ');
            setError(`Some files were rejected: ${reasons}`);
        }

        if (documents.length + acceptedFiles.length > MAX_FILES) {
            setError(`Maximum ${MAX_FILES} files allowed per booking`);
            return;
        }

        for (const file of acceptedFiles) {
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
                    doc.id === documentId ? { ...doc, category: category as 'Voucher' | 'Air Ticket' | 'Invoice' | 'Other' } : doc
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

    // Count documents by category
    const documentCounts = useMemo(() => {
        const counts: Record<string, number> = {
            'All': documents.length,
            'Voucher': 0,
            'Air Ticket': 0,
            'Invoice': 0,
            'Other': 0
        };
        documents.forEach(doc => {
            counts[doc.category] = (counts[doc.category] || 0) + 1;
        });
        return counts;
    }, [documents]);

    // Get category icon
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Voucher': return <FileText className="h-4 w-4" />;
            case 'Air Ticket': return <Ticket className="h-4 w-4" />;
            case 'Invoice': return <Receipt className="h-4 w-4" />;
            default: return <MoreHorizontal className="h-4 w-4" />;
        }
    };

    // Filter documents by category
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const filteredDocuments = useMemo(() => {
        if (activeCategory === 'All') return documents;
        return documents.filter(doc => doc.category === activeCategory);
    }, [documents, activeCategory]);

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Documents & Files
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {documents.length} file{documents.length !== 1 ? 's' : ''} uploaded
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Share Link Quick Action */}
                        {shareToken ? (
                            <Button
                                onClick={copyShareLink}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <LinkIcon className="h-4 w-4" />
                                Copy Share Link
                            </Button>
                        ) : (
                            <Button
                                onClick={createShareToken}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Share className="h-4 w-4" />
                                Create Share Link
                            </Button>
                        )}
                        {/* Upload trigger */}
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <Button size="sm" className="gap-2">
                                <Upload className="h-4 w-4" />
                                Upload
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Upload Progress */}
                {uploadProgress.length > 0 && (
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                        {uploadProgress.map((progress, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="truncate">{progress.filename}</span>
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

                {/* Category Tabs */}
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 h-auto">
                        <TabsTrigger value="All" className="flex flex-col sm:flex-row gap-1 py-2">
                            <span>All</span>
                            <Badge variant="secondary" className="text-xs">{documentCounts['All']}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="Voucher" className="flex flex-col sm:flex-row gap-1 py-2">
                            <FileText className="h-4 w-4 hidden sm:block" />
                            <span className="text-xs sm:text-sm">Vouchers</span>
                            <Badge variant="secondary" className="text-xs">{documentCounts['Voucher']}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="Air Ticket" className="flex flex-col sm:flex-row gap-1 py-2">
                            <Ticket className="h-4 w-4 hidden sm:block" />
                            <span className="text-xs sm:text-sm">Tickets</span>
                            <Badge variant="secondary" className="text-xs">{documentCounts['Air Ticket']}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="Invoice" className="flex flex-col sm:flex-row gap-1 py-2">
                            <Receipt className="h-4 w-4 hidden sm:block" />
                            <span className="text-xs sm:text-sm">Invoices</span>
                            <Badge variant="secondary" className="text-xs">{documentCounts['Invoice']}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="Other" className="flex flex-col sm:flex-row gap-1 py-2">
                            <span className="text-xs sm:text-sm">Other</span>
                            <Badge variant="secondary" className="text-xs">{documentCounts['Other']}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeCategory} className="mt-4">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading documents...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Document List */}
                                {filteredDocuments.length > 0 && (
                                    <div className="space-y-2">
                                        {filteredDocuments.map((document) => (
                                            <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="p-2 bg-muted rounded">
                                                        {getFileIcon(document.mimeType)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium truncate">{document.filename}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Badge variant="outline" className="text-xs">
                                                                {getCategoryIcon(document.category)}
                                                                <span className="ml-1">{document.category}</span>
                                                            </Badge>
                                                            <span>•</span>
                                                            <span>{formatFileSize(document.size)}</span>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span className="hidden sm:inline">{formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Select
                                                        value={document.category}
                                                        onValueChange={(value) => updateDocumentCategory(document.id, value)}
                                                    >
                                                        <SelectTrigger className="w-28 h-8 text-xs">
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
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => window.open(document.url, '_blank')}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteClick(document.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Dropzone - Always visible */}
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
                                        ${filteredDocuments.length > 0 ? 'p-4' : 'p-8'}
                                        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                                >
                                    <input {...getInputProps()} />
                                    {filteredDocuments.length === 0 ? (
                                        <>
                                            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                                            <p className="text-muted-foreground mb-2">
                                                {activeCategory === 'All'
                                                    ? 'No documents uploaded yet'
                                                    : `No ${activeCategory.toLowerCase()}s uploaded`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Drag & drop or click to upload
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                PDF, JPG, PNG, DOCX • Max {formatFileSize(MAX_FILE_SIZE)}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Upload className="h-4 w-4" />
                                            <span className="text-sm">Drop files here or click to upload more</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Share Link & Itinerary URL - Collapsible Footer */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Share Link Section */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Client Share Link</Label>
                        {shareToken ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    value={shareToken.shareUrl}
                                    readOnly
                                    className="text-xs h-8"
                                />
                                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={copyShareLink}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={openShareLink}>
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={createShareToken}
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                            >
                                <Share className="h-4 w-4" />
                                Generate Share Link
                            </Button>
                        )}
                        {shareToken && (
                            <p className="text-xs text-muted-foreground">
                                Expires {formatDistanceToNow(new Date(shareToken.expiresAt), { addSuffix: true })}
                            </p>
                        )}
                    </div>

                    {/* Itinerary URL Section */}
                    <div className="space-y-2">
                        <Label htmlFor="itinerary" className="text-xs text-muted-foreground uppercase tracking-wide">
                            Safari Portal Itinerary URL
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="itinerary"
                                placeholder="https://..."
                                value={itineraryUrl}
                                onChange={(e) => setItineraryUrl(e.target.value)}
                                className="text-xs h-8"
                            />
                            <Button onClick={saveItineraryUrl} variant="outline" size="sm" className="h-8 shrink-0">
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>

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
        </Card>
    );
};