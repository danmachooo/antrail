export default defineNuxtConfig({
	devtools: { enabled: true },

	modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@nuxtjs/google-fonts"],

	googleFonts: {
		families: {
			"IBM+Plex+Mono": [400, 500, 600],
			Syne: [400, 600, 700, 800],
		},
		display: "swap",
	},

	css: ["~/assets/css/main.css"],

	app: {
		head: {
			title: "AnTrail - AI Tutorial Generator",
			script: [
				{
					src: process.env.NUXT_EMBED_URL || "https://antrail.vercel.app/embed.js",
					"data-token": process.env.ANTRAIL_TOKEN || "fa398e01ebf2",
					defer: true,
				},
			],
			meta: [
				{
					name: "description",
					content: "Convert user manuals into interactive walkthroughs automatically.",
				},
			],
		},
	},

	runtimeConfig: {
		apiSecret: process.env.NUXT_GEMINI_API_KEY,
		geminiApiKey: process.env.NUXT_GEMINI_API_KEY,
		groqApiKey: process.env.NUXT_GROQ_API_KEY,
		groqModel: process.env.NUXT_GROQ_MODEL || "llama-3.1-8b-instant",
		selectorProfile: process.env.NUXT_SELECTOR_PROFILE,
		antrailToken: process.env.NUXT_ANTRAIL_TOKEN,
		public: {
			apiBase: process.env.NUXT_PUBLIC_API_BASE,
		},
	},

	compatibilityDate: "2025-07-15",
})
