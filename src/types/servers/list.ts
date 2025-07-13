export interface Limit {
	memory: number;
	swap: number;
	disk: number;
	io: number;
	cpu: number;
	threads?: any;
}

export interface Feature_limit {
	databases: number;
	allocations: number;
	backups: number;
}

export interface Environment {
	sERVER_JARFILE: string;
	vANILLA_VERSION: string;
	sTARTUP: string;
	p_SERVER_LOCATION: string;
	p_SERVER_UUID: string;
}

export interface Container {
	startup_command: string;
	image: string;
	installed: boolean;
	environment: Environment;
}

export interface Attribute {
	id: number;
	server: number;
	host: number;
	database: string;
	username: string;
	remote: string;
	max_connections: number;
	created_at: string;
	updated_at: string;
}

export interface Data {
	object: string;
	attributes: Attribute;
}

export interface Database {
	object: string;
	data: Data[];
}

export interface Relationship {
	databases: Database;
}

export interface Attribute {
	id: number;
	external_id: string;
	uuid: string;
	identifier: string;
	name: string;
	description: string;
	suspended: boolean;
	limits: Limit;
	feature_limits: Feature_limit;
	user: number;
	node: number;
	allocation: number;
	nest: number;
	egg: number;
	pack?: any;
	container: Container;
	updated_at: string;
	created_at: string;
	relationships: Relationship;
}

export interface Data {
	object: string;
	attributes: Attribute;
}

export interface Link {}

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