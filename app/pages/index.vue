<template>
	<div>
		<section class="mb-10 max-w-3xl">
			<p class="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-emerald-300/90">AI Tutorial Builder</p>
			<h1 class="mb-4 text-[clamp(2.1rem,5vw,3.6rem)] font-bold leading-tight tracking-tight text-slate-50">
				Turn product docs into
				<span class="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent"
					>guided in-app walkthroughs</span
				>
			</h1>
			<p class="max-w-2xl text-base leading-7 text-slate-400">
				Upload your manual, review extracted steps, test the flow in a live preview, and export production-ready
				snippets.
			</p>
		</section>

		<PipelineBar class="mb-8" />

		<template v-if="stage === 'upload' || stage === 'extracting'">
			<UploadPanel />
		</template>

		<template v-if="hasData">
			<Transition name="panel-slide">
				<div v-if="stageGte('json')" class="mt-6">
					<JsonPanel />
				</div>
			</Transition>

			<Transition name="panel-slide">
				<div v-if="stageGte('steps')" class="mt-6">
					<StepsPanel />
				</div>
			</Transition>

			<Transition name="panel-slide">
				<div v-if="stageGte('preview')" class="mt-6">
					<PreviewPanel />
				</div>
			</Transition>

			<Transition name="panel-slide">
				<div v-if="stageGte('export')" class="mt-6">
					<ExportPanel />
				</div>
			</Transition>
		</template>
	</div>
</template>

<script setup lang="ts">
import { PIPELINE_ORDER } from "~/constants/pipeline"
import { useTutorialStore } from "~/stores/tutorial"
import type { PipelineStage } from "~/stores/tutorial"

const store = useTutorialStore()
const { stage, hasData } = storeToRefs(store)

function stageGte(target: PipelineStage): boolean {
	return PIPELINE_ORDER.indexOf(stage.value) >= PIPELINE_ORDER.indexOf(target)
}
</script>

<style scoped>
.panel-slide-enter-active {
	animation: fadeUp 0.35s ease both;
}

.panel-slide-leave-active {
	animation: fadeUp 0.2s ease reverse;
}
</style>
