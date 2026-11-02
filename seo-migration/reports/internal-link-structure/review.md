# 全站内链结构审计

本文件保留优化前的基线结果；优化后数据见 optimization.md、audit.json 和 pages.csv。

范围：当前 dist 的 330 个 HTML 页面，其中 328 个可索引页面。仅审计本地生产构建；未进行线上 HTTP 抓取，未改动网站或部署。统计排除自链接，入链数按独立来源页面计数。查询参数不作为独立页面。

## 核心结果

| 指标 | 结果 |
| --- | ---: |
| 可索引页面 | 328 |
| 可索引页面中的站内链接出现次数 | 33,339 |
| 失效站内链接 / 失效锚点 | 0 / 0 |
| 空链接名称（计入图片 alt） | 0 |
| 无入链孤立页 / 首页不可达页面 | 0 / 0 |
| 绝对链接使用非 canonical 主机、协议或 index.html | 0 |
| 仅有一个来源页面的页面 | 12 |

点击深度按首页起算：0 次 1 页；1 次 62 页；2 次 147 页；3 次 101 页；4 次 17 页。其中深度 4 的 6 页为作者分页、11 页为博客文章。最大深度 4，不存在超过 4 层的可索引页面。

## 优先处理：入口单一的页面

这些页面仍可正常抓取，不是死链或孤立页。建议在内容相关的材料、工艺、行业或产品页面自然增加入口，并逐条人工核对主题相关性。

- /materials/nylon-66-cnc-machining — 1 个来源，深度 3
- /materials/peek-cnc-turning-and-milling — 1 个来源，深度 2
- /custom-cnc-parts/5-axis-cnc-machining-mechanical-parts — 1 个来源，深度 3
- /custom-cnc-parts/cnc-custom-aluminum-shift-knob — 1 个来源，深度 3
- /custom-cnc-parts/cnc-turning-precision-washers — 1 个来源，深度 3
- /custom-cnc-parts/radar-systems-parts-machining — 1 个来源，深度 3
- /custom-cnc-parts/robotic-machining-cells — 1 个来源，深度 3
- /custom-cnc-parts/satellite-connectors — 1 个来源，深度 3
- /custom-cnc-parts/screw-threaded-sleeve — 1 个来源，深度 3
- /custom-cnc-parts/semiconductor-probe-pin — 1 个来源，深度 2
- /industries/oil-gas-swiss-machining — 1 个来源，深度 3
- /industries/defense-swiss-machining — 1 个来源，深度 2

## 第二优先级：主题入口与较深文章

Inconel 600 有 2 个来源，Nylon 66 有 1 个来源；二者均未发现导航、面包屑以外的内容入链。应优先检查 Inconel 和 Nylon 父级材料页是否可增加合适的牌号比较入口。

以下 11 篇文章点击深度为 4，可从博客主题入口或相关工艺、行业页增加自然链接，尽量降至 3。此项是结构优化机会，不代表索引故障：

- /blog/cnc-machining-for-furniture-industry
- /blog/cnc-machining-for-renewable-energy
- /blog/cnc-metalworks
- /blog/cnc-services-for-startups
- /blog/cnc-near-me-vs-online-cnc-machining
- /blog/cnc-vs-sheet-metal
- /blog/zero-waste-cnc-machining
- /blog/cnc-boring
- /blog/cnc-drilling
- /blog/3d-printing-vs-cnc-machining
- /blog/casting-vs-cnc-machining

Resources 总览页深度 2、仅有 2 个来源，且没有内容入链。若继续保留其入口页角色，可在首页资源区或合适的服务页增加入口。

## 正常项与限制

About Us 和 Industries 总览均有 327 个来源，依靠全站导航覆盖，不能因为内容入链为零而判断为薄弱页面。分页依靠分页导航连接是正常结构。

“内容入链”口径排除 header、footer、nav 和面包屑，包含卡片、CTA、相关推荐；不等同于纯文章段落内链，不能据此证明语义相关性或衡量搜索引擎实际权重。此轮未使用 GSC 数据，也未检查线上重定向链、429、抓取和收录状态。文件存在性检查覆盖生成链接及其目标锚点。

完整逐页数据：pages.csv。机器可读结果：audit.json。可复查命令：node scripts/audit-internal-link-structure.mjs。
