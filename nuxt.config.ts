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
		public: {
			apiBase: process.env.NUXT_PUBLIC_API_BASE,
		},
	},

	compatibilityDate: "2025-07-15",
})
