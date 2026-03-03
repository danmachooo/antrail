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
					src: process.env.NODE_ENV === "production" ? "https://antrail.vercel.app/embed.js" : "http://localhost:3000/embed.js",
					"data-token": "fff51feb283b",
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

	nitro: {
		storage: {
			published: {
				driver: "fs",
				base: process.env.NODE_ENV === "production" ? "/tmp/antrail/published" : "./.data/kv/published",
			},
		},
	},

	compatibilityDate: "2025-07-15",
})
