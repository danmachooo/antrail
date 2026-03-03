<template>
	<PanelShell step="1" title="Upload Documentation" subtitle="POST /api/upload -> /api/extract">
		<div class="space-y-5">
			<div
				class="group rounded-xl border-2 border-dashed px-6 py-10 text-center transition"
				:class="
					isDragging
						? 'border-emerald-300/70 bg-emerald-400/10'
						: 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
				"
				data-testid="upload-button"
				@dragover.prevent="isDragging = true"
				@dragleave.prevent="isDragging = false"
				@drop.prevent="onDrop"
				@click="fileInput?.click()"
			>
				<input
					ref="fileInput"
					data-testid="manual-file-input"
					type="file"
					accept=".txt,.md,.pdf,.docx"
					class="hidden"
					@change="onFileChange"
				/>

				<div
					class="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200"
				>
					<FileUp class="h-5 w-5" />
				</div>

				<h3 class="text-sm font-semibold text-slate-100">
					{{ fileName || "Drop your manual here" }}
				</h3>
				<p class="mt-2 text-xs text-slate-400">
					{{ fileName ? "File loaded. Drop another file to replace it." : "or click to browse your files" }}
				</p>

				<div class="mt-4 flex flex-wrap items-center justify-center gap-2">
					<span
						class="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200"
						>.txt</span
					>
					<span
						class="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-200"
						>.md</span
					>
					<span
						class="rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200"
						>.pdf</span
					>
					<span
						class="rounded-md border border-rose-400/30 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200"
						>.docx</span
					>
				</div>
			</div>

			<div class="flex items-center gap-3 text-xs text-slate-500">
				<div class="h-px flex-1 bg-slate-800" />
				<span>or paste your manual text</span>
				<div class="h-px flex-1 bg-slate-800" />
			</div>

			<textarea
				v-model="manualText"
				data-testid="manual-textarea"
				rows="10"
				class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-xs leading-7 text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
				placeholder="Paste your user manual text here...

Example:
# Adding a New Inventory Item
1. Navigate to the Inventory section in the left sidebar
2. Click the Add Item button in the top-right corner
3. Fill in the Item Name field
4. Enter the SKU code
5. Set the Quantity
6. Click Save to confirm"
			/>

			<div v-if="store.isLoading" class="space-y-2">
				<p class="font-mono text-xs text-emerald-200">{{ store.loadingMessage }}</p>
				<div class="h-1.5 overflow-hidden rounded-full bg-slate-800">
					<div
						class="h-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all"
						:style="{ width: `${store.loadingProgress}%` }"
					/>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<AppButton
					data-testid="extract-button"
					:disabled="store.isLoading || (!manualText.trim() && !selectedFile)"
					@click="handleExtract"
				>
					<Loader2 v-if="store.isLoading" class="h-4 w-4 animate-spin" />
					<Bot v-else class="h-4 w-4" />
					{{ store.isLoading ? "Extracting..." : "Extract Steps with AI" }}
				</AppButton>

				<AppButton
					data-testid="load-sample-button"
					variant="secondary"
					:disabled="store.isLoading"
					@click="loadSample"
				>
					<FileText class="h-4 w-4" />
					Load Sample Manual
				</AppButton>
			</div>
		</div>
	</PanelShell>
</template>

<script setup lang="ts">
import { Bot, FileText, FileUp, Loader2 } from "lucide-vue-next"
import AppButton from "~/components/ui/AppButton.vue"
import PanelShell from "~/components/ui/PanelShell.vue"

import { useExtractor } from "~/composables/useExtractor"
import { SAMPLE_MANUAL } from "~/data/mock"
import { useTutorialStore } from "~/stores/tutorial"

const store = useTutorialStore()
const { extract, extractFromText } = useExtractor()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const fileName = ref("")
const manualText = ref("")
const selectedFile = ref<File | null>(null)

function loadSample() {
	manualText.value = SAMPLE_MANUAL
	fileName.value = "inventory-manual.txt"
	selectedFile.value = null
	if (fileInput.value) fileInput.value.value = ""
}

function onFileChange(event: Event) {
	const file = (event.target as HTMLInputElement).files?.[0]
	if (file) {
		void readFile(file)
	}
}

function onDrop(event: DragEvent) {
	isDragging.value = false
	const file = event.dataTransfer?.files[0]
	if (file) {
		void readFile(file)
	}
}

function isBinaryManual(file: File): boolean {
	const lowerName = file.name.toLowerCase()
	return (
		file.type === "application/pdf" ||
		file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
		lowerName.endsWith(".pdf") ||
		lowerName.endsWith(".docx")
	)
}

async function readFile(file: File): Promise<void> {
	fileName.value = file.name

	if (isBinaryManual(file)) {
		selectedFile.value = file
		manualText.value = ""
		return
	}

	manualText.value = await file.text()
	selectedFile.value = null
}

async function handleExtract() {
	if (selectedFile.value) {
		await extract(selectedFile.value)
		return
	}

	const text = manualText.value.trim()
	if (text) {
		await extractFromText(text, fileName.value || "manual.txt")
	}
}
</script>
