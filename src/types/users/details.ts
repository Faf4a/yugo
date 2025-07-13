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

export interface Details {
	object: string;
	attributes: Attribute;
}