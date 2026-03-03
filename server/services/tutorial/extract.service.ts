import { getLLMService } from "#server/services/llm/index.service"
import { buildTutorialPrompt } from "#server/services/tutorial/prompt.service"
import { ensureTutorialSelectors } from "#server/services/tutorial/selector.service"
import type { ManualSchemaInput } from "#shared/schema/manual.schema"
import type { TutorialData } from "#shared/types/tutorial.types"

export async function extractTutorial(manual: ManualSchemaInput): Promise<TutorialData> {
	const llm = getLLMService("groq")
	const tutorial = await llm.generateJSON<TutorialData>(buildTutorialPrompt(manual))

	const config = useRuntimeConfig()
	const selectorProfile = String(config.selectorProfile ?? "generic")
	return ensureTutorialSelectors(tutorial, selectorProfile)
}
