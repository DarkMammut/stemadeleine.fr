import React from 'react';
import ArticleModule from '@/components/modules/ArticleModule';
import NewsModule from '@/components/modules/NewsModule';
import GalleryModule from '@/components/modules/GalleryModule';
import NewslettersModule, {NewslettersModuleType} from '@/components/modules/NewslettersModule';

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
}

const ModuleRenderer: React.FC<Props> = ({module}) => {
    if (!module) {
        return null;
    }

    const {type} = module;

    switch (type) {
        case 'ARTICLE':
            return <ArticleModule module={module}/>;
        case 'NEWS':
            return <NewsModule module={module}/>;
        case 'GALLERY':
            return <GalleryModule module={module}/>;
        case 'NEWSLETTER':
            return <NewslettersModule module={module as NewslettersModuleType}/>;
        case 'FORM':
            // return <FormModule module={module} />;
            return <div>Form module not implemented yet</div>;
        case 'CTA':
            // return <CTAModule module={module} />;
            return <div>CTA module not implemented yet</div>;
        case 'TIMELINE':
            // return <TimelineModule module={module} />;
            return <div>Timeline module not implemented yet</div>;
        case 'LIST':
            // return <ListModule module={module} />;
            return <div>List module not implemented yet</div>;
        default:
            console.warn(`Unknown module type: ${type}`);
            return (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                        Module de type « {type} » non pris en charge
                    </p>
                </div>
            );
    }
};

export default ModuleRenderer;
