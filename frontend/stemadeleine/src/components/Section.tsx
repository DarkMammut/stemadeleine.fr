import React from 'react';

type ContentItem = {
  html?: string;
  text?: string;
  [key: string]: any;
};

type SectionProps = {
  sectionId?: string;
  mediaId?: string | number;
  variant?: string;
  title?: string;
  contents?: ContentItem[];
  className?: string;
};

export default function Section({
                                  sectionId,
                                  mediaId,
                                  variant,
                                  title,
                                  contents,
                                  className = '',
                                }: SectionProps) {
  return (
    <section className={'container mx-auto px-4 py-6 ' + className}>
      {title && <h3 className="text-2xl font-semibold mb-4">{title}</h3>}
      {contents && contents.length > 0 ? (
        <div className="space-y-4">
          {contents.map((c: ContentItem, idx: number) => (
            <div key={idx} className="prose">
              {/* If content is HTML stored as string, dangerouslySetInnerHTML could be used */}
              {c.html ? (
                <div dangerouslySetInnerHTML={{ __html: c.html }} />
              ) : (
                <p>{c.text || JSON.stringify(c)}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Aucun contenu.</p>
      )}
    </section>
  );
}
