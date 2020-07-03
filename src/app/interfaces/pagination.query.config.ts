export interface PaginationQueryConfig {
    path: string; //  path to collection
    field: string; // field to orderBy
    limit: number; // limit per query
    reverse: boolean; // reverse order?
    prepend: boolean; // prepend to source?
}
