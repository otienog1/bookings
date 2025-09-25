"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Download,
    Calendar,
    Image,
    File,
    AlertCircle,
    Share2,
    Clock,
    MapPin,
    ExternalLink,
    Filter,
    X
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface SharedDocument {
    id: string;
    filename: string;
    category: string;
    size: number;
    uploadedAt: string;
    url: string; // Changed from downloadUrl to match backend response
}

interface ShareData {
    booking: {
        id: string;
        name: string;
    };
    documents: SharedDocument[];
    allowedCategories: string[];
    expiresAt: string;
    itineraryUrl?: string;
}

export default function SharePage() {
    const params = useParams();
    const token = params.token as string;
    const [shareData, setShareData] = useState<ShareData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state - only category filtering
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchSharedData = async () => {
            try {
                setLoading(true);
                // Explicitly avoid authentication for share routes
                const response = await fetch(`/api/share/${token}`, {
                    headers: {
                        'Content-Type': 'application/json'
                        // Explicitly no Authorization header
                    }
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        setError('This share link has expired or is invalid.');
                    } else {
                        setError('Failed to load shared documents.');
                    }
                    return;
                }

                const data = await response.json();
                console.log('Share data received:', data);
                console.log('Documents in share data:', data.documents);
                setShareData(data);
            } catch (err) {
                setError('Failed to connect to the server.');
                console.error('Error fetching shared data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchSharedData();
        }
    }, [token]);

    // Filter documents by selected categories
    const filteredDocuments = useMemo(() => {
        if (!shareData) return [];

        if (selectedCategories.length === 0) {
            return shareData.documents;
        }

        return shareData.documents.filter(doc =>
            selectedCategories.includes(doc.category)
        );
    }, [shareData, selectedCategories]);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.toLowerCase().split('.').pop();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        }
        if (ext === 'pdf') {
            return <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />;
        }
        return <File className="h-5 w-5 text-muted-foreground" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'voucher': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'air ticket': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            case 'invoice': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
        }
    };

    const handleDownload = async (doc: SharedDocument) => {
        try {
            console.log('Attempting to download document:', doc);

            // Try API route first
            const response = await fetch(`/api/share/${token}/download/${doc.id}`);

            console.log('Download API response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Download API error:', errorData);
                throw new Error(`Download failed: ${response.status} ${errorData.error || ''}`);
            }

            // Check if response is JSON (old backend) or binary data (new backend)
            const contentType = response.headers.get('Content-Type') || '';

            if (contentType.includes('application/json')) {
                // Old backend - returns JSON with downloadUrl
                console.log('Backend returned JSON, extracting download URL');
                const data = await response.json();

                if (data.downloadUrl) {
                    // Use the direct download URL
                    const link = document.createElement('a');
                    link.href = data.downloadUrl;
                    link.download = data.filename || doc.filename;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    return;
                } else {
                    throw new Error('No download URL provided by backend');
                }
            } else {
                // New backend - streams file directly
                console.log('Backend returned binary data, processing as blob');

                // Get the file blob directly
                const blob = await response.blob();
                console.log('Downloaded blob size:', blob.size, 'bytes');
                console.log('Downloaded blob type:', blob.type);

                // Get filename from Content-Disposition header or use document filename
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = doc.filename;

                if (contentDisposition) {
                    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (match && match[1]) {
                        filename = match[1].replace(/['"]/g, '');
                    }
                }

                console.log('Final filename:', filename);

                // Create download link with blob URL
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Download error:', err);
            alert(`Failed to download file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const handleDownloadAll = async () => {
        try {
            const response = await fetch(`/api/share/${token}/download-all`, {
                headers: {
                    'Content-Type': 'application/json'
                    // Explicitly no Authorization header
                }
            });

            if (!response.ok) {
                throw new Error('Download all failed');
            }

            // Create a blob from the response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `${shareData?.booking.name || 'documents'}_documents.zip`;

            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '');
                }
            }

            link.download = filename;

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download all error:', err);
            alert('Failed to download all files. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background py-4 sm:py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Skeleton */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8" />
                            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
                        </div>
                        <Skeleton className="h-4 w-36 sm:w-48 mx-auto mb-2" />
                        <div className="flex items-center justify-center gap-2">
                            <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
                            <Skeleton className="h-3 w-24 sm:w-32" />
                        </div>
                    </div>

                    {/* Categories Skeleton */}
                    <div className="mb-4 sm:mb-6">
                        <div className="flex flex-wrap gap-2 justify-center px-2">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <Skeleton key={index} className="h-6 w-16 sm:w-20 rounded-full" />
                            ))}
                        </div>
                    </div>

                    {/* Documents Card Skeleton */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
                                </div>
                                <Skeleton className="h-8 w-24 sm:w-32" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <Skeleton className="h-5 w-5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <Skeleton className="h-4 w-32 sm:w-40 mb-2" />
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                                <Skeleton className="h-3 w-12 sm:w-16" />
                                                <div className="flex items-center gap-1">
                                                    <Skeleton className="h-3 w-3" />
                                                    <Skeleton className="h-3 w-16 sm:w-20" />
                                                </div>
                                                <Skeleton className="h-5 w-16 sm:w-20 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                    <Skeleton className="h-8 w-full sm:w-24" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Footer Skeleton */}
                    <div className="text-center mt-6 sm:mt-8 px-4">
                        <Skeleton className="h-3 w-64 sm:w-80 mx-auto mb-1" />
                        <Skeleton className="h-3 w-48 sm:w-60 mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background py-4 sm:py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Alert variant="destructive" className="max-w-md mx-auto">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">{error}</AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        );
    }

    if (!shareData) {
        return (
            <div className="min-h-screen bg-background py-4 sm:py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Alert className="max-w-md mx-auto">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">No data available.</AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        );
    }

    const expiryDate = new Date(shareData.expiresAt);
    const isExpiringSoon = (expiryDate.getTime() - Date.now()) < 24 * 60 * 60 * 1000; // 24 hours

    return (
        <div className="min-h-screen bg-background py-4 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Share2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Shared Documents</h1>
                    </div>
                    <p className="text-base sm:text-lg text-muted-foreground px-2">
                        Documents for <span className="font-semibold break-words">{shareData.booking.name}</span>
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs sm:text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-center">
                            {isExpiringSoon ? 'Expires soon: ' : 'Expires: '}
                            {formatDistanceToNow(expiryDate, { addSuffix: true })}
                        </span>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                    {/* Filter Header */}
                    <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">Filter by Category</h3>
                            {selectedCategories.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-2 text-xs">
                                    {selectedCategories.length} selected
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Tabs Style Filter */}
                    <div className="flex justify-center">
                        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground max-w-fit gap-1">
                            {shareData.allowedCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    className={`
                                        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2.5 sm:px-3 py-1.5 text-sm font-medium
                                        ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                                        ${selectedCategories.includes(category)
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'hover:bg-background/50 hover:text-foreground'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-1 text-[13px]">
                                        <span className={`h-3 w-3 rounded-full ${getCategoryColor(category)}`}></span>
                                        {category}
                                    </div>
                                </button>
                            ))}

                            {/* Clear Button as Tab */}
                            {selectedCategories.length > 0 && (
                                <>
                                    <div className="w-px h-6 bg-border mx-1"></div>
                                    <button
                                        onClick={() => setSelectedCategories([])}
                                        className="
                                            inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2.5 sm:px-3 py-1.5 text-sm font-medium
                                            ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                            focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                                            bg-destructive/5 hover:bg-destructive/15 text-destructive border border-destructive/20
                                        "
                                    >
                                        <div className="flex items-center gap-1 text-[13px]">
                                            <X className="h-3 w-3" />
                                            Clear
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Filter Status */}
                    <div className="text-center mt-4">
                        <p className="text-xs text-muted-foreground">
                            {selectedCategories.length === 0
                                ? `Showing all ${shareData.documents.length} documents`
                                : `Showing ${filteredDocuments.length} of ${shareData.documents.length} documents`
                            }
                        </p>
                    </div>
                </div>

                {/* Documents */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Available Documents ({filteredDocuments.length}
                                {filteredDocuments.length !== shareData.documents.length && (
                                    <span className="text-muted-foreground">/{shareData.documents.length}</span>
                                )})
                            </CardTitle>
                            {filteredDocuments.length > 1 && (
                                <Button
                                    onClick={() => handleDownloadAll()}
                                    variant="default"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download All
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredDocuments.length === 0 ? (
                            <div className="text-center py-6 sm:py-8 text-muted-foreground px-4">
                                <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-base sm:text-lg font-medium">
                                    {shareData.documents.length === 0 ? 'No documents available' : 'No documents match your category filter'}
                                </p>
                                <p className="text-xs sm:text-sm">
                                    {shareData.documents.length === 0
                                        ? 'No documents match the selected categories for this booking.'
                                        : 'Try selecting different categories or clear the filter to see all documents.'
                                    }
                                </p>
                                {shareData.documents.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedCategories([])}
                                        className="mt-4"
                                    >
                                        Clear Filter
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {filteredDocuments.map((document) => (
                                    <div key={document.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="flex-shrink-0">
                                                {getFileIcon(document.filename)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium text-foreground text-sm sm:text-base break-words">
                                                    {document.filename}
                                                </h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                                                    <span className="flex-shrink-0">{formatFileSize(document.size)}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <span className="hidden sm:inline">•</span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-xs self-start sm:self-center ${getCategoryColor(document.category)}`}
                                                    >
                                                        {document.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleDownload(document)}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span className="sm:inline">Download</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Itinerary */}
                {shareData.itineraryUrl && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Safari Itinerary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium text-foreground text-sm sm:text-base">
                                            View Your Safari Itinerary
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                            Click to view your detailed safari itinerary and schedule
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => window.open(shareData.itineraryUrl, '_blank')}
                                    variant="default"
                                    size="sm"
                                    className="flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-shrink-0"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>View Itinerary</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground px-4">
                    <p className="break-words">This is a secure link that will expire on {format(expiryDate, 'PPP')}.</p>
                    <p className="mt-1">Please download any required documents before this date.</p>
                </div>
            </div>
        </div>
    );
}