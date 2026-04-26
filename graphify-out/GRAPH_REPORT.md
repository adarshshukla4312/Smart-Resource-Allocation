# Graph Report - Smart-Resource-Allocation  (2026-04-26)

## Corpus Check
- 44 files · ~46,324 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 453 nodes · 1642 edges · 19 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `i()` - 62 edges
2. `pc()` - 50 edges
3. `wc()` - 34 edges
4. `bc()` - 32 edges
5. `t()` - 27 edges
6. `z()` - 26 edges
7. `wd()` - 26 edges
8. `hc()` - 25 edges
9. `hu()` - 23 edges
10. `dt()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `n()` --calls--> `t()`  [EXTRACTED]
  mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js → mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js  _Bridges community 4 → community 0_
- `t()` --calls--> `i()`  [EXTRACTED]
  mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js → mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js  _Bridges community 4 → community 2_
- `na()` --calls--> `t()`  [EXTRACTED]
  mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js → mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js  _Bridges community 4 → community 3_
- `qf()` --calls--> `t()`  [EXTRACTED]
  mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js → mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js  _Bridges community 4 → community 1_
- `n()` --calls--> `i()`  [EXTRACTED]
  mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js → mobile\android\app\src\main\assets\public\assets\index-BgZ_Znhr.js  _Bridges community 0 → community 2_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (92): ae(), as(), b(), bi(), Bo(), bs(), ca(), ce() (+84 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (65): a(), ad(), ap(), Au(), bd(), bu(), cd(), cp() (+57 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (56): $(), an(), bn(), cn(), d(), dn(), Ed(), en() (+48 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (54): aa(), Ac(), ao(), bc(), be(), c(), cc(), Do() (+46 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (45): af(), at(), Bt(), cf(), ct(), df(), di(), dt() (+37 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (31): bl(), cl(), dl(), el(), fl(), gc(), gl(), Hf() (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.4
Nodes (2): TaskFeed(), timeAgo()

### Community 8 - "Community 8"
Cohesion: 0.47
Nodes (3): MyReports(), StatusBadge(), timeAgo()

### Community 9 - "Community 9"
Cohesion: 0.47
Nodes (3): AppStatusBadge(), MyApplications(), timeAgo()

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (2): SeverityBadge(), TaskDetail()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (1): App()

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (1): ExampleInstrumentedTest

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (2): BridgeActivity, MainActivity

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (1): ExampleUnitTest

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (1): LoginPage()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (1): CreateReport()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (1): Profile()

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (1): SubmitProof()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (1): TaskView()

## Knowledge Gaps
- **Thin community `Community 7`** (6 nodes): `TaskFeed.jsx`, `CategoryBadge()`, `SeverityBadge()`, `TaskFeed()`, `timeAgo()`, `TaskFeed.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (5 nodes): `SeverityBadge()`, `StatusBadge()`, `TaskDetail()`, `TaskDetail.jsx`, `TaskDetail.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (4 nodes): `App()`, `ProtectedRoute()`, `App.jsx`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (3 nodes): `ExampleInstrumentedTest`, `.useAppContext()`, `ExampleInstrumentedTest.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (3 nodes): `BridgeActivity`, `MainActivity`, `MainActivity.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `ExampleUnitTest`, `.addition_isCorrect()`, `ExampleUnitTest.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (3 nodes): `LoginPage()`, `LoginPage.jsx`, `LoginPage.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `CreateReport()`, `CreateReport.jsx`, `CreateReport.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `Profile.jsx`, `Profile()`, `Profile.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `SubmitProof.jsx`, `SubmitProof()`, `SubmitProof.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `TaskView.jsx`, `TaskView()`, `TaskView.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `i()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `pc()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `wc()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._