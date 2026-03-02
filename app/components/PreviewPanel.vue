<template>
	<PanelShell step="4" title="Interactive Preview" subtitle="Simulated in-app overlay">
		<div class="space-y-4">
			<NoticeBox>
				<template #icon>
					<Info class="h-4 w-4 text-cyan-300" />
				</template>
				This preview simulates how your onboarding tour will appear in production.
			</NoticeBox>

			<div ref="imsRef" class="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-100">
				<div class="flex items-center gap-5 bg-slate-900 px-5 py-3">
					<span class="text-sm font-bold text-cyan-300">InvenTrack</span>
					<nav class="flex gap-6 text-xs font-medium text-slate-400">
						<button
							v-for="item in navItems"
							:key="item.id"
							class="transition hover:text-white"
							:class="{ 'text-white': activeNav === item.id }"
							@click="activeNav = item.id"
						>
							{{ item.label }}
						</button>
					</nav>
				</div>

				<div class="flex min-h-[320px]">
					<aside class="w-48 border-r border-slate-200 bg-white p-3">
						<p class="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Menu</p>
						<button
							v-for="item in sidebarItems"
							:id="item.id"
							:key="item.id"
							class="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-semibold transition"
							:class="
								item.id === 'sidebar-inventory'
									? 'bg-cyan-50 text-cyan-700'
									: 'text-slate-600 hover:bg-slate-100'
							"
						>
							<component :is="item.icon" class="h-3.5 w-3.5" />
							{{ item.label }}
						</button>
					</aside>

					<main class="flex-1 p-5">
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-base font-bold text-slate-900">Inventory Items</h3>
							<button
								id="ims-add-btn"
								class="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700"
							>
								Add Item
							</button>
						</div>

						<div
							id="ims-table"
							class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
						>
							<table class="w-full border-collapse text-xs">
								<thead>
									<tr
										class="border-b border-slate-200 bg-slate-50 text-left text-[10px] uppercase tracking-wider text-slate-500"
									>
										<th class="px-3 py-2">Item Name</th>
										<th class="px-3 py-2">SKU</th>
										<th class="px-3 py-2">Qty</th>
										<th class="px-3 py-2">Status</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="item in IMS_ITEMS"
										:key="item.sku"
										class="border-b border-slate-100 last:border-b-0"
									>
										<td class="px-3 py-2 text-slate-700">{{ item.name }}</td>
										<td class="px-3 py-2 font-mono text-slate-500">{{ item.sku }}</td>
										<td class="px-3 py-2 text-slate-700">{{ item.qty }}</td>
										<td class="px-3 py-2">
											<span
												class="rounded px-2 py-0.5 text-[11px] font-semibold"
												:class="
													item.status === 'In Stock'
														? 'bg-emerald-100 text-emerald-700'
														: 'bg-amber-100 text-amber-700'
												"
											>
												{{ item.status }}
											</span>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</main>
				</div>

				<div
					v-if="tourActive && highlightStyle"
					class="pointer-events-none absolute z-10 rounded-lg shadow-[0_0_0_3px_rgba(16,185,129,1),0_0_0_7px_rgba(16,185,129,0.2)] transition-all duration-300"
					:style="highlightStyle"
				/>

				<Transition name="tt">
					<div
						v-if="tourActive && currentTourStep"
						class="absolute z-20 w-64 rounded-xl border border-emerald-300/40 bg-slate-950 p-4 shadow-2xl"
						:style="tooltipStyle"
					>
						<div class="mb-3 h-1 overflow-hidden rounded-full bg-slate-800">
							<div class="h-full bg-emerald-300 transition-all" :style="{ width: `${progressPct}%` }" />
						</div>
						<p class="mb-1 font-mono text-[10px] uppercase tracking-wider text-emerald-200">
							Step {{ currentTourStep.stepNumber }} of {{ store.steps.length }}
						</p>
						<h4 class="text-sm font-semibold text-slate-100">{{ currentTourStep.title }}</h4>
						<p class="mt-1 text-xs leading-6 text-slate-300">{{ currentTourStep.instruction }}</p>

						<div class="mt-4 flex items-center gap-2">
							<AppButton v-if="tourIndex > 0" variant="secondary" size="sm" @click="tourPrev">
								<ArrowLeft class="h-3.5 w-3.5" />
								Back
							</AppButton>

							<AppButton size="sm" @click="tourNext">
								<component
									:is="tourIndex >= store.steps.length - 1 ? Check : ArrowRight"
									class="h-3.5 w-3.5"
								/>
								{{ tourIndex >= store.steps.length - 1 ? "Finish" : "Next" }}
							</AppButton>

							<AppButton variant="ghost" size="sm" class="ml-auto" @click="endTour">
								<X class="h-3.5 w-3.5" />
							</AppButton>
						</div>
					</div>
				</Transition>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<AppButton @click="startTour">
					<component :is="tourActive ? RotateCcw : Play" class="h-4 w-4" />
					{{ tourActive ? "Restart Tour" : "Start Tutorial" }}
				</AppButton>
				<AppButton variant="secondary" @click="store.setStage('export')">
					<ArrowRight class="h-4 w-4" />
					Continue to Export
				</AppButton>
			</div>
		</div>
	</PanelShell>
</template>

<script setup lang="ts">
import {
	ArrowLeft,
	ArrowRight,
	Box,
	Check,
	FileBarChart2,
	Info,
	LayoutDashboard,
	Play,
	RotateCcw,
	ShoppingCart,
	X,
} from "lucide-vue-next"

import { IMS_ITEMS } from "~/data/mock"
import { useTutorialStore } from "~/stores/tutorial"
import AppButton from "~/components/ui/AppButton.vue"
import NoticeBox from "~/components/ui/NoticeBox.vue"
import PanelShell from "~/components/ui/PanelShell.vue"

const store = useTutorialStore()

const imsRef = ref<HTMLElement | null>(null)
const activeNav = ref("inventory")
const tourActive = ref(false)
const tourIndex = ref(0)

const navItems = [
	{ id: "dashboard", label: "Dashboard" },
	{ id: "inventory", label: "Inventory" },
	{ id: "reports", label: "Reports" },
	{ id: "settings", label: "Settings" },
]

const sidebarItems = [
	{ id: "sidebar-inventory", label: "Inventory", icon: Box },
	{ id: "sidebar-orders", label: "Orders", icon: ShoppingCart },
	{ id: "sidebar-suppliers", label: "Suppliers", icon: LayoutDashboard },
	{ id: "sidebar-reports", label: "Reports", icon: FileBarChart2 },
]

const targetIds = ["sidebar-inventory", "ims-add-btn", "ims-table", "ims-table", "ims-table", "ims-add-btn"]

const currentTourStep = computed(() => store.steps[tourIndex.value] ?? null)
const progressPct = computed(() => {
	if (!store.steps.length) return 0
	return ((tourIndex.value + 1) / store.steps.length) * 100
})

const highlightStyle = ref<Record<string, string> | null>(null)
const tooltipStyle = ref<Record<string, string>>({})

function startTour() {
	if (!store.steps.length) return
	tourActive.value = true
	tourIndex.value = 0
	nextTick(positionTour)
}

function endTour() {
	tourActive.value = false
	highlightStyle.value = null
}

function tourNext() {
	if (tourIndex.value >= store.steps.length - 1) {
		endTour()
		store.setStage("export")
		return
	}

	tourIndex.value += 1
	nextTick(positionTour)
}

function tourPrev() {
	if (tourIndex.value <= 0) return
	tourIndex.value -= 1
	nextTick(positionTour)
}

function positionTour() {
	if (!imsRef.value) return

	const targetId = targetIds[tourIndex.value] ?? "ims-add-btn"
	const target = imsRef.value.querySelector<HTMLElement>(`#${targetId}`)
	if (!target) return

	const parentRect = imsRef.value.getBoundingClientRect()
	const rect = target.getBoundingClientRect()
	const top = rect.top - parentRect.top
	const left = rect.left - parentRect.left

	highlightStyle.value = {
		top: `${top - 5}px`,
		left: `${left - 5}px`,
		width: `${rect.width + 10}px`,
		height: `${rect.height + 10}px`,
	}

	const tooltipWidth = 260
	const spaceRight = parentRect.width - (left + rect.width)
	const tooltipLeft = spaceRight > tooltipWidth + 16 ? left + rect.width + 12 : left - tooltipWidth - 12

	tooltipStyle.value = {
		top: `${Math.max(top, 8)}px`,
		left: `${Math.max(tooltipLeft, 8)}px`,
	}
}
</script>

<style scoped>
.tt-enter-active,
.tt-leave-active {
	transition: all 0.2s ease;
}

.tt-enter-from,
.tt-leave-to {
	opacity: 0;
	transform: scale(0.95);
}
</style>
