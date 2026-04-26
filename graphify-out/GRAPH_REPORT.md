# Graph Report - Smart-Resource-Allocation  (2026-04-26)

## Corpus Check
- 33 files · ~35,984 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 443 nodes · 1629 edges · 13 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `i()` - 61 edges
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
  mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js → mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js  _Bridges community 0 → community 5_
- `t()` --calls--> `i()`  [EXTRACTED]
  mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js → mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js  _Bridges community 0 → community 4_
- `na()` --calls--> `t()`  [EXTRACTED]
  mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js → mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js  _Bridges community 0 → community 3_
- `ko()` --calls--> `t()`  [EXTRACTED]
  mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js → mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js  _Bridges community 0 → community 1_
- `qf()` --calls--> `t()`  [EXTRACTED]
  mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js → mobile\android\app\src\main\assets\public\assets\index-BcaU_X4f.js  _Bridges community 0 → community 2_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (71): $(), ae(), an(), at(), bn(), Bt(), ce(), cn() (+63 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (44): ad(), bl(), ca(), Cr(), Ed(), fr(), Gd(), gr() (+36 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (56): a(), ap(), Au(), bd(), bu(), cd(), ci(), cp() (+48 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (51): aa(), Ac(), ao(), bc(), be(), c(), cc(), Do() (+43 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (49): cl(), componentDidCatch(), Cu(), d(), dc(), dl(), Du(), ec() (+41 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (37): as(), b(), Bo(), bs(), cs(), dd(), ds(), es() (+29 more)

### Community 6 - "Community 6"
Cohesion: 0.23
Nodes (27): af(), cf(), df(), dt(), ef(), Ei(), ff(), gf() (+19 more)

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (8): bi(), ep(), Ha(), hi(), Ka(), uf(), xi(), yi()

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (1): ExampleInstrumentedTest

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): BridgeActivity, MainActivity

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (1): ExampleUnitTest

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (1): App()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (1): LoginPage()

## Knowledge Gaps
- **Thin community `Community 15`** (3 nodes): `ExampleInstrumentedTest`, `.useAppContext()`, `ExampleInstrumentedTest.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `BridgeActivity`, `MainActivity`, `MainActivity.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (3 nodes): `ExampleUnitTest`, `.addition_isCorrect()`, `ExampleUnitTest.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `App()`, `App.jsx`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `LoginPage()`, `LoginPage.jsx`, `LoginPage.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `i()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `pc()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 5`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `wc()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._