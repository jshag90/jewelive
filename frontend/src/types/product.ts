export interface User {
    id: number;
    nickname?: string;
    email?: string;
}

export interface Product {
    id: number;
    seller_id: number;
    seller?: User;
    title: string;
    description?: string;
    price: number;
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
    images?: string;
    category_main?: string;
    category_medium?: string;
    category_small?: string;
    condition?: string;
    tags?: string;
    views: number;
    likes: number;
    chat_count: number;
    created_at: string;
    updated_at: string;
}
