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
	p_SERVER_ALLOCATION_LIMIT: number;
}

export interface Container {
	startup_command: string;
	image: string;
	installed: boolean;
	environment: Environment;
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
}

export interface Details {
	object: string;
	attributes: Attribute;
}