<template>
	<PanelShell step="5" title="Export Integration Snippet" subtitle="Ready to embed into your app">
		<div class="space-y-4">
			<div class="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
				<button
					v-for="tab in tabs"
					:key="tab.id"
					class="rounded-md px-4 py-1.5 font-mono text-xs font-semibold transition"
					:class="
						activeTab === tab.id ? 'bg-slate-800 text-emerald-200' : 'text-slate-400 hover:text-slate-100'
					"
					@click="activeTab = tab.id"
				>
					{{ tab.label }}
				</button>
			</div>

			<div v-if="store.tutorial" class="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
				<button
					class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
					@click="copy"
				>
					<component :is="copied ? Check : Copy" class="h-3.5 w-3.5" />
					{{ copied ? "Copied" : "Copy" }}
				</button>
				<pre
					class="max-h-[400px] overflow-auto px-4 pb-4 pt-12 font-mono text-xs leading-7 text-slate-300"
				><code>{{ activeCode }}</code></pre>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<AppButton data-testid="download-driver-button" @click="download">
					<Download class="h-4 w-4" />
					Download {{ activeTab === "json" ? "JSON" : "JS" }}
				</AppButton>
				<AppButton data-testid="copy-snippet-button" variant="secondary" @click="copy">
					<component :is="copied ? Check : Copy" class="h-4 w-4" />
					{{ copied ? "Copied" : "Copy Snippet" }}
				</AppButton>
			</div>

			<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
				<h4 class="mb-3 font-mono text-xs uppercase tracking-wide text-slate-300">Publish Embed</h4>
				<div class="flex flex-col gap-3">
					<label for="publish-route-input" class="font-mono text-[11px] text-slate-400">
						Route Pattern (supports /orders/:id and /reports/*)
					</label>
					<input
						id="publish-route-input"
						v-model="publishRoute"
						data-testid="publish-route-input"
						type="text"
						placeholder="/inventory"
						class="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 outline-none transition focus:border-emerald-400/60"
					/>
					<div class="flex flex-wrap items-center gap-3">
						<AppButton
							data-testid="publish-embed-button"
							:disabled="isPublishing || !store.tutorial"
							@click="publish"
						>
							<Loader2 v-if="isPublishing" class="h-4 w-4 animate-spin" />
							<Globe v-else class="h-4 w-4" />
							{{ isPublishing ? "Publishing..." : "Publish & Generate Script Tag" }}
						</AppButton>
						<p v-if="publishedToken" class="font-mono text-[11px] text-emerald-300">
							Token: {{ publishedToken }}
						</p>
					</div>
				</div>

				<p v-if="publishError" class="mt-3 text-xs text-rose-300">{{ publishError }}</p>

				<div
					v-if="embedScriptTag"
					class="relative mt-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950"
				>
					<button
						data-testid="copy-tag-button"
						class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
						@click="copyEmbedTag"
					>
						<component :is="embedCopied ? Check : Copy" class="h-3.5 w-3.5" />
						{{ embedCopied ? "Copied" : "Copy Tag" }}
					</button>
					<pre
						class="overflow-auto px-4 pb-4 pt-12 font-mono text-xs leading-7 text-slate-300"
					><code>{{ embedScriptTag }}</code></pre>
				</div>
			</div>

			<NoticeBox>
				<template #icon>
					<CircleHelp class="h-4 w-4 text-cyan-300" />
				</template>
				Place the snippet in
				<code class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-cyan-200">main.js</code> or include it in
				a script tag. Trigger
				<code class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-cyan-200">tutorialDriver.drive()</code>
				when users need guidance.
			</NoticeBox>
		</div>
	</PanelShell>
</template>

<script setup lang="ts">
import { Check, CircleHelp, Copy, Download, Globe, Loader2 } from "lucide-vue-next"

import { useExporter } from "~/composables/useExporter"
import { useTutorialStore } from "~/stores/tutorial"
import AppButton from "~/components/ui/AppButton.vue"
import NoticeBox from "~/components/ui/NoticeBox.vue"
import PanelShell from "~/components/ui/PanelShell.vue"

const store = useTutorialStore()
const { generateDriverSnippet, generateShepherdSnippet, generateJSON, copyToClipboard, downloadFile, publishTutorial } =
	useExporter()

const activeTab = ref<"driver" | "shepherd" | "json">("driver")
const copied = ref(false)
const embedCopied = ref(false)
const isPublishing = ref(false)
const publishError = ref("")
const publishedToken = ref("")
const embedScriptTag = ref("")
const publishRoute = ref("/inventory")

onMounted(() => {
	if (window.location.pathname) {
		publishRoute.value = window.location.pathname
	}
})

const tabs: Array<{ id: "driver" | "shepherd" | "json"; label: string }> = [
	{ id: "driver", label: "driver.js" },
	{ id: "shepherd", label: "shepherd.js" },
	{ id: "json", label: "raw json" },
]

const activeCode = computed(() => {
	if (!store.tutorial) return ""
	if (activeTab.value === "driver") return generateDriverSnippet(store.tutorial)
	if (activeTab.value === "shepherd") return generateShepherdSnippet(store.tutorial)
	return generateJSON(store.tutorial)
})

async function copy() {
	await copyToClipboard(activeCode.value)
	copied.value = true
	setTimeout(() => {
		copied.value = false
	}, 2200)
}

function download() {
	const isJson = activeTab.value === "json"
	downloadFile(
		activeCode.value,
		isJson ? "tutorial.json" : `tutorial-${activeTab.value}.js`,
		isJson ? "application/json" : "text/javascript"
	)
}

async function publish() {
	if (!store.tutorial) return

	isPublishing.value = true
	publishError.value = ""
	publishedToken.value = ""

	try {
		const route = publishRoute.value.trim() || "/"
		const result = await publishTutorial(route, store.tutorial)
		publishedToken.value = result.token
		embedScriptTag.value = result.scriptTag
	} catch (error) {
		const apiError = error as { data?: { message?: string }; message?: string }
		publishError.value = apiError.data?.message ?? apiError.message ?? "Failed to publish tutorial."
	} finally {
		isPublishing.value = false
	}
}

async function copyEmbedTag() {
	if (!embedScriptTag.value) return
	await copyToClipboard(embedScriptTag.value)
	embedCopied.value = true
	setTimeout(() => {
		embedCopied.value = false
	}, 2200)
}
</script>
