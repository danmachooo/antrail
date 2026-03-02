<template>
	<header class="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
		<div class="mx-auto flex h-16 max-w-[1100px] items-center gap-4 px-6">
			<NuxtLink to="/" class="inline-flex items-center gap-3">
				<img src="/antrail-logo.png" alt="AnTrail logo" class="h-11 w-11 object-cover" />
				<span class="text-lg font-bold tracking-tight text-slate-100">
					An<span class="text-emerald-300">Trail</span>
				</span>
			</NuxtLink>

			<span
				class="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-200"
			>
				Beta
			</span>

			<nav class="ml-auto">
				<AppButton variant="ghost" size="sm" @click="store.reset()">
					<RotateCcw class="h-3.5 w-3.5" />
					New Project
				</AppButton>
			</nav>
		</div>
	</header>
</template>

<script setup lang="ts">
import { RotateCcw } from "lucide-vue-next"

import AppButton from "~/components/ui/AppButton.vue"
import { useTutorialStore } from "~/stores/tutorial"

const store = useTutorialStore()
</script>
