<template>
	<section
		class="fade-up overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-[0_12px_40px_rgba(2,6,23,0.45)]"
	>
		<header class="flex flex-wrap items-center gap-3 border-b border-slate-800 px-6 py-4">
			<div
				class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-300 to-cyan-400 text-xs font-bold text-slate-950"
			>
				{{ step }}
			</div>
			<div>
				<h2 class="text-sm font-semibold text-slate-100">{{ title }}</h2>
				<p v-if="subtitle" class="mt-0.5 font-mono text-[11px] text-slate-400">{{ subtitle }}</p>
			</div>
			<slot name="header-right" />
		</header>
		<div class="px-6 py-6">
			<slot />
		</div>
	</section>
</template>

<script setup lang="ts">
defineProps<{
	step: string | number
	title: string
	subtitle?: string
}>()
</script>
