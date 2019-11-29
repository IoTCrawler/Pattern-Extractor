import { ProblemDetails } from "../../ngsi/datatypes/problemDetails";

export interface BulkOperationResult {
    success: string[];
    errors: {
        entityId: string;
        error: ProblemDetails;
    }[];
}