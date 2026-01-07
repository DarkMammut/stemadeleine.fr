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

export interface NewsletterPublication {
    id: string;
    newsletterId: string;
    name: string;
    title: string;
    description?: string;
    isVisible: boolean;
    status: PublishingStatus;
    publishedDate?: string;
    media?: Media;
    author?: User;
    contents?: Content[];
    createdAt: string;
    updatedAt: string;
}

export interface NewsletterModule {
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

