<template>
	<button :class="buttonClass" v-bind="$attrs">
		<slot />
	</button>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
	defineProps<{
		variant?: "primary" | "secondary" | "ghost" | "danger"
		size?: "md" | "sm"
	}>(),
	{
		variant: "primary",
		size: "md",
	}
)

const baseClass =
	"inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-50"

const sizeClass = computed(() => (props.size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"))

const variantClass = computed(() => {
	if (props.variant === "secondary") {
		return "border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500"
	}

	if (props.variant === "ghost") {
		return "border-transparent bg-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900/70 hover:text-slate-100"
	}

	if (props.variant === "danger") {
		return "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
	}

	return "border-emerald-300/20 bg-emerald-400 text-slate-950 hover:bg-emerald-300"
})

const buttonClass = computed(() => [baseClass, sizeClass.value, variantClass.value].join(" "))
</script>
