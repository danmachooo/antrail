import { randomUUID } from "node:crypto"
import type { TutorialData } from "#shared/types/tutorial.types"

export interface PublishedTutorial {
	token: string
	route: string
	tutorial: TutorialData
	createdAt: number
}

const STORAGE_KEY_PREFIX = "published:tutorial:"
const FALLBACK_MEMORY = new Map<string, PublishedTutorial>()

function storageKey(token: string): string {
	return `${STORAGE_KEY_PREFIX}${token}`
}

function generateToken(): string {
	return randomUUID().replace(/-/g, "").slice(0, 12)
}

function getPublishedStorage() {
	return useStorage("published")
}

export async function savePublishedTutorial(route: string, tutorial: TutorialData): Promise<PublishedTutorial> {
	const token = generateToken()
	const record: PublishedTutorial = {
		token,
		route,
		tutorial,
		createdAt: Date.now(),
	}

	try {
		await getPublishedStorage().setItem(storageKey(token), record)
	} catch (error) {
		console.warn("[publish] Failed to persist tutorial in storage mount 'published'. Using in-memory fallback.", error)
		FALLBACK_MEMORY.set(token, record)
	}

	return record
}

export async function getPublishedTutorial(token: string): Promise<PublishedTutorial | null> {
	const inMemory = FALLBACK_MEMORY.get(token)
	if (inMemory) return inMemory

	try {
		const record = await getPublishedStorage().getItem<PublishedTutorial>(storageKey(token))
		return record ?? null
	} catch (error) {
		console.warn("[publish] Failed to read tutorial from storage mount 'published'.", error)
		return null
	}
}
