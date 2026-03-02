<template>
	<PanelShell step="2" title="Structured Extraction" subtitle="GPT-4o -> JSON schema">
		<div class="space-y-4">
			<NoticeBox tone="success">
				<template #icon>
					<CheckCircle2 class="h-4 w-4 text-emerald-300" />
				</template>
				Extracted
				<strong class="text-emerald-200">{{ store.tutorial?.totalSteps }}</strong>
				steps from
				<span class="font-mono text-cyan-200">{{ store.tutorial?.extractedFrom }}</span>
			</NoticeBox>

			<div
				class="max-h-[420px] overflow-auto rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs leading-7 text-slate-300"
				v-html="highlighted"
			/>

			<div class="flex flex-wrap items-center gap-3">
				<AppButton @click="store.setStage('steps')">
					<ListChecks class="h-4 w-4" />
					View Step Cards
				</AppButton>
				<AppButton variant="ghost" size="sm" @click="copyJSON">
					<component :is="copied ? Check : Copy" class="h-3.5 w-3.5" />
					{{ copied ? "Copied" : "Copy JSON" }}
				</AppButton>
			</div>
		</div>
	</PanelShell>
</template>

<script setup lang="ts">
import { Check, CheckCircle2, Copy, ListChecks } from "lucide-vue-next"

import { useTutorialStore } from "~/stores/tutorial"
import AppButton from "~/components/ui/AppButton.vue"
import NoticeBox from "~/components/ui/NoticeBox.vue"
import PanelShell from "~/components/ui/PanelShell.vue"

const store = useTutorialStore()
const copied = ref(false)

const highlighted = computed(() => {
	if (!store.tutorial) return ""
	return syntaxHighlight(JSON.stringify(store.tutorial, null, 2))
})

function syntaxHighlight(json: string) {
	return json.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
		match => {
			let tokenClass = "jn"
			if (/^"/.test(match)) tokenClass = /:$/.test(match) ? "jk" : "js"
			else if (/true|false/.test(match)) tokenClass = "jb"
			else if (/null/.test(match)) tokenClass = "jnull"
			return `<span class="${tokenClass}">${match}</span>`
		}
	)
}

async function copyJSON() {
	if (!store.tutorial) return
	await navigator.clipboard.writeText(JSON.stringify(store.tutorial, null, 2))
	copied.value = true
	setTimeout(() => {
		copied.value = false
	}, 2000)
}
</script>
