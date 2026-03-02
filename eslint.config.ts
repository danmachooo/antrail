// eslint.config.ts
import js from "@eslint/js"
import prettierConfig from "eslint-config-prettier"
import vue from "eslint-plugin-vue"
import globals from "globals"
import tseslint from "typescript-eslint"
import vueParser from "vue-eslint-parser"
import { defineConfig } from "eslint/config"

const nuxtGlobals = {
	$fetch: "readonly",
	computed: "readonly",
	defineEmits: "readonly",
	defineExpose: "readonly",
	defineNuxtPlugin: "readonly",
	defineNuxtRouteMiddleware: "readonly",
	defineProps: "readonly",
	navigateTo: "readonly",
	nextTick: "readonly",
	onMounted: "readonly",
	onUnmounted: "readonly",
	reactive: "readonly",
	ref: "readonly",
	storeToRefs: "readonly",
	useCookie: "readonly",
	useFetch: "readonly",
	useHead: "readonly",
	useLazyFetch: "readonly",
	useRuntimeConfig: "readonly",
	useState: "readonly",
	watch: "readonly",
}

export default defineConfig([
	{
		ignores: [".nuxt/**", ".output/**", "dist/**", "node_modules/**"],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...vue.configs["flat/recommended"],
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...nuxtGlobals,
			},
		},
	},
	{
		files: ["**/*.vue"],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				ecmaVersion: "latest",
				parser: tseslint.parser,
				sourceType: "module",
			},
		},
		rules: {
			"vue/multi-word-component-names": "off",
		},
	},
	{
		files: ["**/*.{ts,mts,cts,vue}"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
	{
		files: ["app/components/JsonPanel.vue"],
		rules: {
			"vue/no-v-html": "off",
		},
	},
	prettierConfig,
])
