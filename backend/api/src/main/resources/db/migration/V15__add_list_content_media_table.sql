CREATE TABLE public.list_content_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_content_id UUID NOT NULL,
    media_id UUID NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (list_content_id) REFERENCES public.list_contents(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES public.media(id)
);

CREATE INDEX idx_list_content_media_list_content_id ON public.list_content_media(list_content_id);
CREATE INDEX idx_list_content_media_media_id ON public.list_content_media(media_id);
