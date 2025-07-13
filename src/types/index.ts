export type NodesAttribute = import("./nodes/list").Attribute;
export type NodesData = import("./nodes/list").Data;
export type NodesLink = import("./nodes/list").Link;
export type NodesList = import("./nodes/list").List;
export type NodesMeta = import("./nodes/list").Meta;
export type NodesPagination = import("./nodes/list").Pagination;

export type ServersAttribute = import("./servers/list").Attribute;
export type ServersList = import("./servers/list").List;
export type ServersDetails = import("./servers/details").Attribute;

export type UsersAttribute = import("./users/list").Attribute;
export type UsersList = import("./users/list").List;
export type UsersDetails = import("./users/details").Details;

export * as Nodes from "./nodes/list";
export * as Servers from "./servers/list";
export * as ServerDetails from "./servers/details";
export * as Users from "./users/list";
export * as UserDetails from "./users/details";
