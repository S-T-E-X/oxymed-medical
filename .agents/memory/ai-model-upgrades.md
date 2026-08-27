---
name: AI model upgrades on translation endpoints
description: How to safely swap the OpenAI model used by the admin AI-translation endpoints (slider fields, product page content).
---

# Swapping the model on the AI translation endpoints

**Rule:** never ship a model change to the admin translation endpoints on a
typecheck alone. Replay the endpoint's exact prompt against the live AI
integrations proxy with a realistic payload, and confirm both
`finish_reason: "stop"` and that the endpoint's own validator passes.

**Why:** these endpoints **fail closed**. They structurally validate the model
output — the product page one demands identical array lengths and a non-empty
result for every non-empty source string, the slider one demands every target
locale come back with every non-empty field — and any shortfall becomes a 502
rather than a degraded translation. A model that truncates or drifts therefore
takes admin translation completely offline instead of producing slightly worse
copy. Truncation is the realistic failure: the slider call asks for ~11 locales
in a single response, and reasoning-family models bill reasoning tokens against
the same `max_completion_tokens` budget, so a budget that was generous for a
non-reasoning model can silently stop being enough.

**How to apply:** when changing a model id here, hit
`$AI_INTEGRATIONS_OPENAI_BASE_URL/chat/completions` directly with the endpoint's
system prompt and a real payload (a large real `page_data` row is a good stress
case), then check `usage.completion_tokens_details.reasoning_tokens` and the
headroom left under the configured budget. Raise the budget if headroom is thin.

Both endpoints already pass `max_completion_tokens` and never set `temperature`,
so they are compatible with gpt-5-family models as-is.
