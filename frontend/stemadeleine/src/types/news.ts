export interface Media {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    altText?: string;
    caption?: string;
}

export interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
}

export interface Content {
    id: string;
    contentId: string;
    type: string;
    data: string;
    sortOrder: number;
}

export enum PublishingStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    DELETED = 'DELETED'
}

export interface NewsPublication {
    id: string;
    newsId: string;
    name: string;
    title: string;
    description?: string;
    isVisible: boolean;
    status: PublishingStatus;
    publishedDate?: string;
    startDate?: string;
    endDate?: string;
    media?: Media;
    author?: User;
    contents?: Content[];
    createdAt: string;
    updatedAt: string;
}

export interface NewsModule {
    id: string;
    moduleId: string;
    sectionId: string;
    name: string;
    type: string;
    variant: string;
    description?: string;
    detailPageUrl?: string;
    sortOrder: number;
    status: string;
    isVisible: boolean;
    version: number;
    media?: Media;
    contents?: Content[];
}

