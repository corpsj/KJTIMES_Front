export interface NavigationLink {
    label: string;
    href: string;
}

export interface Article {
    id: string;
    title: string;
    summary: string;
    thumbnail_url: string;
    created_at: string;
    categories: {
        name: string;
        slug: string;
    } | {
        name: string;
        slug: string;
    }[] | null;
}
