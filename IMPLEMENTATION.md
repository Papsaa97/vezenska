# Autonoma SDK Integration Checklist

SDK endpoint path: /api/autonoma

## Checklist
- [x] Endpoint `/api/autonoma` mounted and handling discover / up / down
- [x] Factory: `quiz_questions`
- [x] Factory: `user_feedback`
- [x] Teardown implemented for all created entities
- [x] Auth callback implemented
- [x] Maintenance note added to AGENTS.md
- [x] Validation: clean `sdk check` on recipe file (`recipe.json`)
- [x] Validation: full-recipe pass (`sdk up` and `sdk down`)
- [x] Validation: concurrent-instances proof (`sdk up --repeat 3`)
- [x] Pushed branch `autonoma-integration` and pull request / compare URL
- [x] Completion marker written (`.sdk-integration-complete`)
