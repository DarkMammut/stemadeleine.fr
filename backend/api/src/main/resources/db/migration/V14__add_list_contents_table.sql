CREATE TABLE public.list_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL,
    title VARCHAR(255),
    body JSONB,
    sort_order INTEGER,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    link_url VARCHAR(1000),
    list_id UUID NOT NULL,
    CONSTRAINT fk_list_contents_list_id FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE
);

CREATE INDEX idx_list_contents_list_id ON public.list_contents(list_id);
CREATE INDEX idx_list_contents_content_id ON public.list_contents(content_id);
