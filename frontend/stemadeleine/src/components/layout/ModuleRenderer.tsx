import React from 'react';
import ArticleModule from '@/components/modules/ArticleModule';
import NewsModule from '@/components/modules/NewsModule';
import GalleryModule from '@/components/modules/GalleryModule';
import ListModule from '@/components/modules/ListModule';
import NewslettersModule, {NewslettersModuleType} from '@/components/modules/NewslettersModule';
import CTAModule, {CTAModuleType} from '@/components/modules/CTAModule';

type ModuleType = {
    id: string;
    type: string;
    title?: string;
    name?: string;
    isVisible?: boolean;
    sortOrder?: number;
    [key: string]: unknown;
};

interface Props {
    module: ModuleType | null | undefined;
    isDark?: boolean;
}

const ModuleRenderer: React.FC<Props> = ({module, isDark}) => {
    if (!module) {
        return null;
    }

    const {type} = module;

    switch (type) {
        case 'ARTICLE':
            return <ArticleModule module={module} isDark={isDark}/>;
        case 'NEWS':
            return <NewsModule module={module} isDark={isDark}/>;
        case 'GALLERY':
            return <GalleryModule module={module} isDark={isDark}/>;
        case 'NEWSLETTER':
            return <NewslettersModule module={module as NewslettersModuleType} isDark={isDark}/>;
        case 'FORM':
            // return <FormModule module={module} />;
            return <div>Form module not implemented yet</div>;
        case 'CTA':
            return <CTAModule module={module as CTAModuleType} isDark={isDark}/>;
        case 'TIMELINE':
            // return <TimelineModule module={module} />;
            return <div>Timeline module not implemented yet</div>;
        case 'LIST':
            return <ListModule module={module} isDark={isDark}/>;
        default:
            console.warn(`Unknown module type: ${type}`);
            return (
                <div className="p-4 bg-accent-dark border-secondary rounded-lg">
                    <p className="text-text-mid">
                        Module de type « {type} » non pris en charge
                    </p>
                </div>
            );
    }
};

export default ModuleRenderer;
