# Graph Report - Smart-Resource-Allocation  (2026-04-26)

## Corpus Check
- 26 files · ~19,627 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 67 nodes · 43 edges · 2 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `App()` - 2 edges
2. `LoginPage()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 7 - "Community 7"
Cohesion: 0.67
Nodes (1): App()

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (1): LoginPage()

## Knowledge Gaps
- **Thin community `Community 7`** (3 nodes): `App()`, `App.jsx`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (3 nodes): `LoginPage()`, `LoginPage.jsx`, `LoginPage.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._