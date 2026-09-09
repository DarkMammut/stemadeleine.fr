export type ListContentMedia = {
    id: string;
    fileUrl?: string;
    fileType?: string;
    title?: string;
    altText?: string;
};

export type ListContentItem = {
    id: string;
    contentId?: string;
    title?: string;
    body?: { html?: string } | Record<string, unknown> | null;
    sortOrder?: number;
    isVisible?: boolean;
    linkUrl?: string;
    medias?: ListContentMedia[];
};

export function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

export function getBodyHtml(body: ListContentItem['body']): string {
    if (body && typeof body === 'object' && 'html' in body && typeof (body as { html?: unknown }).html === 'string') {
        return (body as { html: string }).html;
    }
    return '';
}
