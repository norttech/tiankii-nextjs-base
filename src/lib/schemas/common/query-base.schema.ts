import type { z } from "zod";

import { PaginationSchema } from "./pagination.schema";
import { SearchSchema } from "./search.schema";
import { SortingSchema } from "./sorting.schema";

// A combined base schema that every List API route can reuse
export const QueryBaseSchema = PaginationSchema.extend(SortingSchema).extend(SearchSchema);

// Types
export type QueryBaseType = z.infer<typeof QueryBaseSchema>;
