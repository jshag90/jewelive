export interface Product {
    id: number;
    seller_id: number;
    title: string;
    description?: string;
    price: number;
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
    images?: string;
    created_at: string;
}
