# agents.md — Smart Resource Allocation (SRA)

---

## Source of Truth

`SRA-PRD-v1.0.md` is the only authority on what this product is, what it does, and how it behaves. Read the relevant PRD section before every task. If your implementation instinct conflicts with the PRD, the PRD is right and your instinct is wrong. Do not invent requirements. Do not build anything listed in PRD §15.

---

## Project Identity

| | |
|---|---|
| GCP Project | `PROJECT_ID` |
| Region | `asia-south1` |
| Stack | Flutter (mobile) · React (web) · TypeScript (backend) |

---

## Team & Access

Four developers share one GCP project. Each person authenticates independently using their own Google account via `gcloud auth login` and `gcloud auth application-default login`. No one shares API keys directly. All secrets live in GCP Secret Manager and are read at runtime. Each developer's local environment pulls secrets from there using their own IAM-granted credentials.

The project owner adds teammates as IAM members with `roles/editor`. The owner retains `roles/owner` alone. When someone leaves, the owner removes their IAM binding — no key rotation needed.

---

## Collaboration

Everyone works on `main`. There are no long-lived feature branches.

When a merge conflict arises, the agent resolves it by treating the PRD as the referee. The agent reads both conflicting versions, identifies which one more faithfully implements the PRD's intent for that section, and keeps that version. If both versions are equally valid, the agent picks the one that is simpler. If the conflict touches a human approval gate (see below), the agent pauses and flags it instead of resolving autonomously.

---

## Tools

If in case any MCP is not available in user's device then move forward wihout it. 

**UI Design** — used for all UI work. Before implementing any screen or component, refer to `wisprflow.ai-DESIGN.md` for this app's UI design guidance. Never design from scratch.

**Context7 MCP** — used before writing any integration code. Always fetch current docs for the library before touching it. APIs change; training data does not update.

**gcloud CLI** — used for all infrastructure. No resource is created by clicking the console. Everything goes through the terminal so it is reproducible.

---

## Thought Pattern for Every Task

1. Read the PRD section that governs this task.
2. Read `wisprflow.ai-DESIGN.md` if the task involves UI.
3. Fetch Context7 docs if the task involves an external library or API.
4. Implement strictly what the PRD describes.
5. If something feels like a good addition, check whether it is in scope. If not in PRD, do not build it.
6. Before finishing, verify the output behaves the way the PRD describes it, not the way it feels natural to build it.

---

## Merge Conflict Resolution Pattern

1. Read both conflicting versions in full.
2. Open the PRD and find the section that governs the conflicting code.
3. Ask: which version is closer to what the PRD specifies?
4. Keep that version. Discard the other.
5. If neither version matches the PRD, rewrite to match the PRD.
6. If the conflict involves a human approval gate, stop and flag it.

---

## Human Approval Gates

Stop and wait for a human before proceeding if the task involves:

- Deploying Firestore security rules
- Assigning or changing IAM roles
- Promoting anything to production
- Changing a Gemini system prompt
- Modifying the matching engine weights
- Any destructive database operation

Flag format:
> ⏸ Gate: [name] · Action blocked: [what you were about to do] · Reason: [one sentence] · Files involved: [list]

---
