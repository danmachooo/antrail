import { randomUUID } from "node:crypto"
import type { TutorialData } from "#shared/types/tutorial.types"

export interface PublishedTutorial {
	token: string
	route: string
	tutorial: TutorialData
	createdAt: number
}

const STORAGE_KEY_PREFIX = "published:tutorial:"

function storageKey(token: string): string {
	return `${STORAGE_KEY_PREFIX}${token}`
}

function generateToken(): string {
	return randomUUID().replace(/-/g, "").slice(0, 12)
}

export async function savePublishedTutorial(route: string, tutorial: TutorialData): Promise<PublishedTutorial> {
	const token = generateToken()
	const record: PublishedTutorial = {
		token,
		route,
		tutorial,
		createdAt: Date.now(),
	}

	await useStorage("data").setItem(storageKey(token), record)
	return record
}

export async function getPublishedTutorial(token: string): Promise<PublishedTutorial | null> {
	const record = await useStorage("data").getItem<PublishedTutorial>(storageKey(token))
	return record ?? null
}
