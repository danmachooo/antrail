<template>
	<div class="fade-up overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
		<div class="flex min-w-[640px] items-center">
			<template v-for="(step, index) in PIPELINE_STEPS" :key="step.id">
				<div class="flex min-w-[110px] flex-1 flex-col items-center gap-2">
					<div
						:class="[
							'flex h-10 w-10 items-center justify-center rounded-xl border transition',
							isActive(step.id)
								? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,0.08)]'
								: isDone(step.id)
									? 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200'
									: 'border-slate-700 bg-slate-900 text-slate-500',
						]"
					>
						<component :is="step.icon" class="h-4 w-4" />
					</div>
					<span
						:class="[
							'text-[11px] font-semibold tracking-wide',
							isActive(step.id)
								? 'text-emerald-200'
								: isDone(step.id)
									? 'text-cyan-200'
									: 'text-slate-500',
						]"
					>
						{{ step.label }}
					</span>
				</div>

				<ChevronRight v-if="index < PIPELINE_STEPS.length - 1" class="mx-1 h-4 w-4 flex-none text-slate-600" />
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next"

import { PIPELINE_ORDER, PIPELINE_STEPS } from "~/constants/pipeline"
import { useTutorialStore } from "~/stores/tutorial"

const store = useTutorialStore()

function isActive(id: string) {
	const current = store.stage === "extracting" ? "json" : store.stage
	return current === id
}

function isDone(id: string) {
	const currentIndex = PIPELINE_ORDER.indexOf(store.stage)
	const stepIndex = PIPELINE_ORDER.indexOf(id as (typeof PIPELINE_ORDER)[number])
	return stepIndex < currentIndex && !isActive(id)
}
</script>
