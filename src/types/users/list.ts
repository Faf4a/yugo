export interface Attribute {
    id: number;
    external_id: string;
    uuid: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    language: string;
    root_admin: boolean;
    "2fa": boolean;
    created_at: string;
    updated_at: string;
}

export interface Data {
    object: string;
    attributes: Attribute;
}

export interface Link { }

export interface Pagination {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
    links: Link;
}

export interface Meta {
    pagination: Pagination;
}

export interface List {
    object: string;
    data: Data[];
    meta: Meta;
}