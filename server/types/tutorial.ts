import { ManualSchemaInput } from "~~/shared/schema/manual.schema"

export interface ExtractRequest {
	text: ManualSchemaInput
	filename?: string
}
