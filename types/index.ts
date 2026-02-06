export interface NavigationLink {
    label: string;
    href: string;
}

export interface ArticleCategory {
    name: string;
    slug: string;
}

export interface ArticleAuthor {
    full_name: string | null;
}

export interface Article {
    id: string;
    title: string;
    sub_title?: string | null;
    summary?: string | null;
    excerpt?: string | null;
    thumbnail_url?: string | null;
    created_at: string;
    published_at?: string | null;
    updated_at?: string | null;
    slug?: string | null;
    views?: number | null;
    categories: ArticleCategory | ArticleCategory[] | null;
    author?: ArticleAuthor | null;
}
