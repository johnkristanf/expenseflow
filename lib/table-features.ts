import {
  tableFeatures,
  createPaginatedRowModel,
  rowPaginationFeature,
} from "@tanstack/react-table"

/**
 * Single shared features registry used by every table in this app.
 * Both column definitions and DataTable must reference the same object
 * so their `typeof features` generics resolve to identical types.
 */
export const tableConfig = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})
