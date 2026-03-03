;(function () {
	"use strict"

	var EMBED_NAME = "embed.js"
	var BTN_ID = "antrail-btn"
	var AUTO_ATTR = "data-antrail-id"
	var DRIVER_JS_URL = "https://cdn.jsdelivr.net/npm/driver.js@1.4.0/dist/driver.js.iife.js"
	var DRIVER_CSS_URL = "https://cdn.jsdelivr.net/npm/driver.js@1.4.0/dist/driver.css"

	function warn(message, error) {
		if (error) {
			console.warn("[AnTrail]", message, error)
			return
		}
		console.warn("[AnTrail]", message)
	}

	function getCurrentScript() {
		if (document.currentScript) return document.currentScript
		var scripts = document.getElementsByTagName("script")
		for (var i = scripts.length - 1; i >= 0; i--) {
			var src = scripts[i] && scripts[i].getAttribute("src")
			if (src && src.indexOf(EMBED_NAME) !== -1) return scripts[i]
		}
		return null
	}

	function parseBaseUrl(src) {
		try {
			var url = new URL(src, window.location.href)
			return url.href.replace(/\/embed\.js(?:\?.*)?$/, "")
		} catch {
			return ""
		}
	}

	function ensureScript(url) {
		return new Promise(function (resolve, reject) {
			var existing = document.querySelector('script[src="' + url + '"]')
			if (existing) {
				if (window.driver && window.driver.js) {
					resolve()
					return
				}
				existing.addEventListener("load", function () {
					resolve()
				})
				existing.addEventListener("error", function () {
					reject(new Error("Failed to load script: " + url))
				})
				return
			}

			var script = document.createElement("script")
			script.src = url
			script.async = true
			script.onload = function () {
				resolve()
			}
			script.onerror = function () {
				reject(new Error("Failed to load script: " + url))
			}
			document.head.appendChild(script)
		})
	}

	function ensureCss(url) {
		return new Promise(function (resolve, reject) {
			var existing = document.querySelector('link[rel="stylesheet"][href="' + url + '"]')
			if (existing) {
				resolve()
				return
			}

			var link = document.createElement("link")
			link.rel = "stylesheet"
			link.href = url
			link.onload = function () {
				resolve()
			}
			link.onerror = function () {
				reject(new Error("Failed to load css: " + url))
			}
			document.head.appendChild(link)
		})
	}

	function normalizePath(path) {
		if (!path) return "/"
		var noQuery = String(path).split("?")[0].split("#")[0]
		if (noQuery.length > 1 && noQuery.charAt(noQuery.length - 1) === "/") {
			return noQuery.slice(0, -1)
		}
		return noQuery || "/"
	}

	function escapeRegex(input) {
		return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
	}

	function routePatternToRegex(pattern) {
		var clean = normalizePath(pattern)
		if (clean === "*") return /^.*$/

		var segments = clean.split("/")
		var regexParts = []
		for (var i = 0; i < segments.length; i++) {
			var seg = segments[i]
			if (!seg) continue
			if (seg === "*") {
				regexParts.push(".*")
				continue
			}
			if (seg.charAt(0) === ":") {
				regexParts.push("[^/]+")
				continue
			}
			regexParts.push(escapeRegex(seg))
		}

		return new RegExp("^/" + regexParts.join("/") + "$")
	}

	function isRouteMatch(pattern, pathname) {
		var target = normalizePath(pathname)
		var patternClean = normalizePath(pattern)
		if (patternClean === target) return true
		try {
			return routePatternToRegex(patternClean).test(target)
		} catch {
			return false
		}
	}

	function getStateKey(token) {
		return "antrail_" + token
	}

	function readState(token) {
		var fallback = { status: "never", lastStep: 0, completedAt: null }
		try {
			var raw = localStorage.getItem(getStateKey(token))
			if (!raw) return fallback

			var parsed = JSON.parse(raw)
			var status = parsed && parsed.status
			if (status !== "never" && status !== "partial" && status !== "completed") return fallback

			var lastStep = Number(parsed.lastStep)
			if (!Number.isFinite(lastStep) || lastStep < 0) lastStep = 0

			return {
				status: status,
				lastStep: lastStep,
				completedAt: parsed.completedAt || null,
			}
		} catch {
			return fallback
		}
	}

	function writeState(token, nextState) {
		try {
			localStorage.setItem(getStateKey(token), JSON.stringify(nextState))
		} catch {
			// Ignore storage errors in host apps with restricted storage.
		}
	}

	function setPartialState(token, stepIndex) {
		writeState(token, {
			status: "partial",
			lastStep: Math.max(0, Number(stepIndex) || 0),
			completedAt: null,
		})
	}

	function setCompletedState(token, finalStepIndex) {
		writeState(token, {
			status: "completed",
			lastStep: Math.max(0, Number(finalStepIndex) || 0),
			completedAt: Date.now(),
		})
	}

	function removeButton() {
		var existing = document.getElementById(BTN_ID)
		if (existing && existing.parentNode) {
			existing.parentNode.removeChild(existing)
		}
	}

	function buttonStyle(isProminent) {
		var base =
			"position:fixed;bottom:24px;right:24px;z-index:999999;border-radius:999px;padding:12px 18px;font:600 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;cursor:pointer;transition:transform 120ms ease,box-shadow 120ms ease,filter 120ms ease;"
		if (isProminent) {
			return (
				base +
				"background:#6ee7b7;color:#000;border:1px solid rgba(110,231,183,0.9);box-shadow:0 10px 24px rgba(16,185,129,0.25),0 0 0 1px rgba(110,231,183,0.25) inset;"
			)
		}
		return (
			base +
			"background:rgba(15,23,42,0.82);color:#e5e7eb;border:1px solid rgba(148,163,184,0.35);box-shadow:0 8px 20px rgba(2,6,23,0.35);"
		)
	}

	function createButton(label, prominent, onClick) {
		removeButton()

		var btn = document.createElement("button")
		btn.id = BTN_ID
		btn.type = "button"
		btn.textContent = label
		btn.setAttribute("style", buttonStyle(prominent))

		btn.addEventListener("mouseenter", function () {
			btn.style.transform = "translateY(-2px)"
		})
		btn.addEventListener("mouseleave", function () {
			btn.style.transform = "translateY(0)"
		})
		btn.addEventListener("click", onClick)

		document.body.appendChild(btn)
	}

	function isElementVisible(el) {
		if (!el || !el.getBoundingClientRect) return false
		var rect = el.getBoundingClientRect()
		if (rect.width <= 0 || rect.height <= 0) return false
		var style = window.getComputedStyle(el)
		if (!style) return false
		return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0"
	}

	function isInternalUiElement(el) {
		if (!el) return true
		if (el.id === BTN_ID) return true
		if (el.id && el.id.indexOf("driver-") === 0) return true
		if (
			el.closest &&
			(el.closest("#" + BTN_ID) || el.closest(".driver-popover") || el.closest(".driver-overlay"))
		) {
			return true
		}
		var cls = typeof el.className === "string" ? el.className : ""
		if (cls.indexOf("driver-") !== -1 || cls.indexOf("antrail-") !== -1) return true
		return false
	}

	function isInteractable(el) {
		if (!el) return false
		if (el.hasAttribute("disabled")) return false
		if (el.getAttribute("aria-disabled") === "true") return false
		if (window.getComputedStyle(el).pointerEvents === "none") return false
		return true
	}

	function splitSelectorCandidates(selector) {
		if (!selector) return []
		return String(selector)
			.split(",")
			.map(function (part) {
				return part.trim()
			})
			.filter(Boolean)
	}

	function findVisibleElements(selector) {
		if (!selector) return null
		try {
			var found = Array.prototype.slice.call(document.querySelectorAll(selector))
			var visible = found.filter(function (el) {
				return isElementVisible(el) && !isInternalUiElement(el)
			})
			return visible
		} catch {
			return []
		}
	}

	function getCandidatesByType(elementType) {
		var map = {
			button: 'button,[role="button"],input[type="button"],input[type="submit"]',
			input: 'input:not([type="hidden"]),textarea,[contenteditable="true"]',
			select: 'select,[role="combobox"]',
			navigation: 'nav a,[role="navigation"] a,header a,.navbar a,.menu a',
			link: 'a,[role="link"]',
			form: 'form,[role="form"]',
			table: 'table,[role="table"],[role="grid"]',
		}
		var selector = map[elementType] || map.button
		try {
			return Array.prototype.slice.call(document.querySelectorAll(selector))
		} catch {
			return []
		}
	}

	function tokenize(input) {
		return String(input || "")
			.toLowerCase()
			.replace(/[^a-z0-9\s_-]/g, " ")
			.split(/\s+/)
			.filter(function (w) {
				return w.length >= 2 && w !== "the" && w !== "and" && w !== "click" && w !== "button"
			})
	}

	function extractQuotedPhrases(input) {
		var text = String(input || "")
		var matches = text.match(/["'`][^"'`]{2,}["'`]/g) || []
		return matches.map(function (m) {
			return m.slice(1, -1).toLowerCase()
		})
	}

	function buildHintWords(step) {
		return tokenize((step.uiElementHint || "") + " " + (step.title || "") + " " + (step.instruction || ""))
	}

	function scoreElementByHint(el, words) {
		if (!el) return 0
		var haystack = (
			(el.textContent || "") +
			" " +
			(el.getAttribute("aria-label") || "") +
			" " +
			(el.id || "") +
			" " +
			(el.getAttribute("name") || "") +
			" " +
			(el.getAttribute("placeholder") || "") +
			" " +
			(el.getAttribute("data-testid") || "")
		).toLowerCase()

		var score = 0
		for (var i = 0; i < words.length; i++) {
			if (haystack.indexOf(words[i]) !== -1) score += 2
		}

		// Favor stable attributes when scores tie.
		if (el.id) score += 1
		if (el.getAttribute("data-testid")) score += 2
		if (el.getAttribute("aria-label")) score += 1

		// De-prioritize disabled elements.
		if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") {
			score -= 3
		}

		return score
	}

	function scoreElementForStep(el, step) {
		if (!el) return -Infinity
		if (!isElementVisible(el)) return -Infinity
		if (isInternalUiElement(el)) return -Infinity

		var words = buildHintWords(step)
		var score = scoreElementByHint(el, words)
		var haystack = (
			(el.textContent || "") +
			" " +
			(el.getAttribute("aria-label") || "") +
			" " +
			(el.getAttribute("title") || "")
		).toLowerCase()
		var phrases = extractQuotedPhrases((step.instruction || "") + " " + (step.uiElementHint || ""))

		for (var i = 0; i < phrases.length; i++) {
			if (haystack.indexOf(phrases[i]) !== -1) {
				score += 4
			}
		}

		if (isInteractable(el)) score += 2
		if (el.tagName && step.elementType === "button" && el.tagName.toLowerCase() === "button") score += 2
		if (
			el.tagName &&
			step.elementType === "input" &&
			(el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "textarea")
		)
			score += 2
		if (el.tagName && step.elementType === "link" && el.tagName.toLowerCase() === "a") score += 2
		return score
	}

	function selectorForElement(el) {
		if (!el || !el.tagName) return null

		if (el.id) {
			return "#" + (window.CSS && window.CSS.escape ? window.CSS.escape(el.id) : el.id)
		}

		var tag = el.tagName.toLowerCase()
		var testId = el.getAttribute("data-testid")
		if (testId) return tag + '[data-testid="' + testId.replace(/"/g, '\\"') + '"]'

		var dataCy = el.getAttribute("data-cy")
		if (dataCy) return tag + '[data-cy="' + dataCy.replace(/"/g, '\\"') + '"]'

		var dataQa = el.getAttribute("data-qa")
		if (dataQa) return tag + '[data-qa="' + dataQa.replace(/"/g, '\\"') + '"]'

		var aria = el.getAttribute("aria-label")
		if (aria) return tag + '[aria-label="' + aria.replace(/"/g, '\\"') + '"]'

		var name = el.getAttribute("name")
		if (name) return tag + '[name="' + name.replace(/"/g, '\\"') + '"]'

		var parts = []
		var node = el
		while (node && node.nodeType === 1 && parts.length < 4) {
			var nodeTag = node.tagName.toLowerCase()
			var parent = node.parentElement
			if (!parent) {
				parts.unshift(nodeTag)
				break
			}

			var siblings = parent.children
			var index = 1
			for (var i = 0; i < siblings.length; i++) {
				if (siblings[i] === node) break
				if (siblings[i].tagName === node.tagName) index += 1
			}

			parts.unshift(nodeTag + ":nth-of-type(" + index + ")")
			node = parent
		}

		return parts.length ? parts.join(" > ") : null
	}

	function ensureNamedElement(el, token, stepIndex) {
		if (!el) return null
		if (el.id || el.getAttribute("data-testid") || el.getAttribute("data-cy") || el.getAttribute("data-qa")) {
			return selectorForElement(el)
		}

		var existing = el.getAttribute(AUTO_ATTR)
		if (existing) {
			return "[" + AUTO_ATTR + '="' + existing + '"]'
		}

		var value = token + "-s" + (stepIndex + 1) + "-" + Math.random().toString(36).slice(2, 8)
		el.setAttribute(AUTO_ATTR, value)
		return "[" + AUTO_ATTR + '="' + value + '"]'
	}

	function pickBestElement(elements, step) {
		var best = null
		var bestScore = -Infinity

		for (var i = 0; i < elements.length; i++) {
			var score = scoreElementForStep(elements[i], step)
			if (score > bestScore) {
				bestScore = score
				best = elements[i]
			}
		}

		if (!best) return null
		if (bestScore < 1) return null
		return best
	}

	function pickBestElementFromSelector(selector, step) {
		var candidates = splitSelectorCandidates(selector)
		if (!candidates.length) return null

		var best = null
		var bestScore = -Infinity

		for (var i = 0; i < candidates.length; i++) {
			var matches = findVisibleElements(candidates[i])
			for (var j = 0; j < matches.length; j++) {
				var score = scoreElementForStep(matches[j], step)
				if (score > bestScore) {
					bestScore = score
					best = matches[j]
				}
			}
		}

		if (!best) return null
		if (bestScore < 1) return null
		return best
	}

	function semanticFallbackElement(step) {
		var candidates = getCandidatesByType(step.elementType)
		return pickBestElement(candidates, step)
	}

	function resolveStepTarget(step, token, stepIndex) {
		if (step.confirmedSelector) {
			var confirmedElement = pickBestElementFromSelector(step.confirmedSelector, step)
			if (confirmedElement) {
				return { selector: ensureNamedElement(confirmedElement, token, stepIndex), element: confirmedElement }
			}
		}

		if (step.suggestedSelector) {
			var suggestedElement = pickBestElementFromSelector(step.suggestedSelector, step)
			if (suggestedElement) {
				return { selector: ensureNamedElement(suggestedElement, token, stepIndex), element: suggestedElement }
			}
		}

		var fallbackElement = semanticFallbackElement(step)
		if (!fallbackElement) return null
		return { selector: ensureNamedElement(fallbackElement, token, stepIndex), element: fallbackElement }
	}

	function buildDriverSteps(rawSteps, token) {
		if (!Array.isArray(rawSteps)) return []
		var mapped = []

		for (var i = 0; i < rawSteps.length; i++) {
			var step = rawSteps[i] || {}
			var target = resolveStepTarget(step, token, i)
			if (!target || !target.element) continue

			mapped.push({
				element: target.element,
				popover: {
					title: step.title || "Step " + (i + 1),
					description: step.instruction || step.uiElementHint || "",
				},
			})
		}

		return mapped
	}

	function fetchTutorial(baseUrl, token) {
		return fetch(baseUrl + "/api/t/" + encodeURIComponent(token), {
			method: "GET",
			headers: { Accept: "application/json" },
		}).then(function (res) {
			if (!res.ok) throw new Error("Failed to fetch tutorial. Status " + res.status)
			return res.json()
		})
	}

	function init() {
		var scriptEl = getCurrentScript()
		if (!scriptEl) {
			warn("Could not find current embed script element.")
			return
		}

		var token = scriptEl.getAttribute("data-token") || ""
		var userId = scriptEl.getAttribute("data-user-id") || ""
		var src = scriptEl.getAttribute("src") || ""
		var baseUrl = parseBaseUrl(src)

		if (!token) {
			warn("Missing data-token on embed script. Exiting.")
			return
		}

		Promise.all([ensureScript(DRIVER_JS_URL), ensureCss(DRIVER_CSS_URL)])
			.then(function () {
				if (!(window.driver && window.driver.js && typeof window.driver.js.driver === "function")) {
					throw new Error("driver.js failed to initialize.")
				}
				return fetchTutorial(baseUrl, token)
			})
			.then(function (project) {
				if (!project || !project.tutorial || !Array.isArray(project.tutorial.steps)) {
					warn("Invalid tutorial payload.")
					return
				}

				var routePattern = project.route || "/"
				var cachedSteps = project.tutorial.steps
				var isRunning = false
				var completionFlag = false
				var lastKnownIndex = 0
				var driverObj = null

				function refreshButton() {
					try {
						if (!isRouteMatch(routePattern, window.location.pathname)) {
							removeButton()
							if (isRunning && driverObj && typeof driverObj.destroy === "function") {
								driverObj.destroy()
							}
							return
						}

						var state = readState(token)
						var isProminent = state.status !== "completed"
						var label = "\u25B6 Take a Tour"
						if (state.status === "partial") label = "\u25B6 Continue Tour"
						if (state.status === "completed") label = "\u21BA Replay Tour"

						createButton(label, isProminent, function () {
							try {
								var normalized = buildDriverSteps(cachedSteps, token)
								if (!normalized.length) {
									warn("No visible tutorial targets found in the current DOM.")
									return
								}

								var currentState = readState(token)
								var startIndex = currentState.status === "partial" ? currentState.lastStep : 0
								if (startIndex >= normalized.length) startIndex = 0

								completionFlag = false
								lastKnownIndex = startIndex
								isRunning = true

								driverObj = window.driver.js.driver({
									showProgress: true,
									animate: true,
									smoothScroll: true,
									stagePadding: 8,
									stageRadius: 8,
									steps: normalized,
									onHighlightStarted: function (element, _step, context) {
										try {
											var activeIndex = context && context.state ? context.state.activeIndex : 0
											lastKnownIndex =
												typeof activeIndex === "number" ? activeIndex : lastKnownIndex

											// If target is hidden/not usable at runtime, skip this step.
											if (
												!element ||
												!isElementVisible(element) ||
												isInternalUiElement(element)
											) {
												if (lastKnownIndex >= normalized.length - 1) {
													completionFlag = true
													setCompletedState(token, normalized.length - 1)
													context.driver.destroy()
													return
												}

												setPartialState(token, lastKnownIndex + 1)
												setTimeout(function () {
													context.driver.moveNext()
												}, 0)
											}
										} catch (err) {
											warn("Failed while skipping hidden step.", err)
										}
									},
									onHighlighted: function (_element, _step, context) {
										try {
											var activeIndex =
												context && context.state ? context.state.activeIndex : null
											if (typeof activeIndex === "number") lastKnownIndex = activeIndex
										} catch {
											// Ignore callback failures from host app DOM changes.
										}
									},
									onNextClick: function (_element, _step, context) {
										try {
											var activeIndex = context && context.state ? context.state.activeIndex : 0
											lastKnownIndex =
												typeof activeIndex === "number" ? activeIndex : lastKnownIndex

											if (lastKnownIndex >= normalized.length - 1) {
												completionFlag = true
												setCompletedState(token, normalized.length - 1)
												context.driver.destroy()
												return
											}

											setPartialState(token, lastKnownIndex + 1)
											context.driver.moveNext()
										} catch (err) {
											warn("Failed during next step transition.", err)
											try {
												context.driver.moveNext()
											} catch {
												// Ignore fallback move errors.
											}
										}
									},
									onDestroyed: function () {
										try {
											if (!completionFlag) {
												var partialIndex = Math.max(
													0,
													Math.min(lastKnownIndex, normalized.length - 1)
												)
												setPartialState(token, partialIndex)
											}
										} catch (err) {
											warn("Failed to persist tour state.", err)
										} finally {
											isRunning = false
											setTimeout(refreshButton, 0)
										}
									},
								})

								driverObj.drive(startIndex)
							} catch (err) {
								warn("Failed to start tour.", err)
							}
						})
					} catch (err) {
						warn("Failed to refresh tour button.", err)
					}
				}

				function onRouteChanged() {
					setTimeout(function () {
						refreshButton()
					}, 100)
				}

				try {
					var originalPushState = history.pushState
					history.pushState = function () {
						var result = originalPushState.apply(history, arguments)
						onRouteChanged()
						return result
					}
				} catch (err) {
					warn("Failed to patch history.pushState.", err)
				}

				try {
					var originalReplaceState = history.replaceState
					history.replaceState = function () {
						var result = originalReplaceState.apply(history, arguments)
						onRouteChanged()
						return result
					}
				} catch (err) {
					warn("Failed to patch history.replaceState.", err)
				}

				window.addEventListener("popstate", onRouteChanged)
				refreshButton()

				void userId
			})
			.catch(function (error) {
				warn("Embed initialization failed.", error)
			})
	}

	try {
		init()
	} catch (error) {
		warn("Unexpected embed error.", error)
	}
})()
