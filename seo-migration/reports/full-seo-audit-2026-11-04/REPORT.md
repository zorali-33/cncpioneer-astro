# CNCPioneer 全站 SEO 与技术 SEO 检测

检测日期：2026-11-04。对象：本地 Astro 构建与 https://www.cncpioneer.com 的线上公开版本。本轮只新增诊断与报告，不修改网站页面、样式、路由或生产配置。

## 总体判断

**基础抓取条件正常，但有需要优先整改的 URL 一致性和发布问题，不能判定为“SEO 全部没有问题”。** 评级为“需整改”；这不是搜索引擎评分，也不代表已发生排名下降。

- 本地检查 330 个 HTML 页面，其中 328 个允许索引，搜索页和 404 页不允许索引。
- 抓取线上 sitemap 与本地全部 328 个可索引地址：跟随跳转后全部返回 200；其中 **327 个发生 URL 跳转**。200 可访问不等于已被 Google 收录。
- 本地发布验收 11/11 通过，其中自动回归测试 55/55 通过。静态测试不会替代生产服务器响应、真实搜索数据或人工文案审核。
- 本地和线上均未发现完全相同的标题或描述；本地无坏内链、坏锚点、孤立页。线上 HTML 链接与现有路由/文件清单对照也未发现无法解析的站内目标。
- 未获得 GSC 实际收录、点击、关键词、Google 选定 canonical、人工措施或 CrUX 数据；不据此推断流量升降或处罚。

## 优先级与处理清单

| 编号 | 优先级 | 问题与范围 | 建议与验收方式 |
|---|---|---|---|
| 1 | P1 | 327 个 sitemap 地址发生跳转，最终地址与 HTML canonical 的尾斜杠格式冲突 | 统一服务器、canonical、sitemap、内链格式；选定的规范地址应直接 200，其他格式一次永久跳转到它 |
| 2 | P1／品牌与发布 | 线上首页和车铣服务页仍引用 `headwayer` 图片，本地清理没有在线上生效 | 发布已验收的本地版本，清理明确废弃的线上旧资产并刷新相关缓存；重新抓取两页，确认引用及旧图都已处理 |
| 3 | P2 | non-www、`index.html` 等重复入口仍直接 200 | 在上述 URL 规范方案内统一域名与默认文档入口，保留参数，避免循环或多跳 |
| 4 | P2 | 至少 9 页 meta description 在 `and` / `and.` 处断句；38 页匹配模板描述模式 | 完整重写问题摘要，体现该页面的材料、工艺或选择依据；逐页读通顺，不按字符数生硬截断 |
| 5 | P2／需业务复核 | 本地配置 82 个历史 URL 带替代目标，却统一返回 404；生产抽查 3 个为真实 404 | 仅对有等价替代内容的旧页评估 301；没有替代内容的删除页继续 404/410。先结合历史流量、外链和下线意图确认 |
| 6 | P2／性能配置 | 88 篇文章中 40 篇的首张 main 图片为 lazy；另有页面大量正文图片默认立即加载 | 用实际视口和 LCP 测量确定首屏关键图片，关键图片避免 lazy，屏外正文图片使用 lazy；不要把所有图片改成 high |
| 7 | P2／发布可靠性 | `/brand-theme.css`、`/site-search.js`、`/navigation-accessibility.js` URL 固定，但线上缓存 604800 秒 | 给可变资源增加构建版本或指纹；或采用可验证更新的缓存策略，避免发布后老访客一周仍使用旧资源 |
| 8 | P3／需人工分类 | 4 篇文章中出现 58 个空 alt 图片元素，对应 29 个不同图片 URL | 为承载信息的图片补充准确英文 alt；纯装饰或同一图片的隐藏重复实例不强行补关键词 |
| 9 | P3／优化机会 | 6 篇博客从首页最短需要 4 次链接跳转 | 给有业务价值的文章补充相关主题正文链接或专题入口；不是孤立页，不需要为减少层级修改 URL |

P1 为优先处理的确定问题；P2 为下一批处理或复核项；P3 为内容与体验优化。历史 URL、alt 的适用性以及实际性能影响均不能仅凭静态规则下结论。

## 三项主要风险

### 1. 规范地址与服务器跳转方向冲突

328 个 sitemap 地址中，除首页外的 327 个都在抓取后变成带尾斜杠的最终 URL。典型例子：

```text
声明与 sitemap：https://www.cncpioneer.com/services/swiss-machining
生产响应抽查：301 → https://www.cncpioneer.com/services/swiss-machining/
最终页 canonical：https://www.cncpioneer.com/services/swiss-machining
```

`/about-us`、博客文章、作者归档和产品页面也存在同一模式。无尾斜杠 canonical 又指回需要跳转的入口；站内点击同样增加额外请求。Google 可以自行选择规范页，但目前不同信号方向相反，应统一。这里没有证明页面无法收录，也没有证明已损失排名。

优先保留项目当前已声明的规范格式，在生产服务器正确提供无尾斜杠地址的 200；若决定整体采用尾斜杠，则必须同步修改全部相关信号。切勿只改 canonical 或只加一条跳转规则而形成循环。

证据：[327 个逐页对照](./followup.json)、[原始 HTTP 跳转链](./live-http-probes.json)。依据：[Google 规范 URL 指南](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)。

### 2. 本地品牌清理尚未在线上生效

本轮直接 HTTP 抓取的线上 HTML 仍包含：

- 首页：`headwayer-factory-cnc-machining-centers.webp`、`headwayer-factory-cnc-mill-turn.webp`、`headwayer-quality-cmm-inspection.webp`。
- `/services/cnc-turning-and-milling`：`headwayer-quality-optical-measurement.webp`。

这是线上旧版本残留，本地已替换的设备示意图没有体现在这两个线上页面。应把“本地清理完成”和“生产已清理”分开验收。这里主要影响品牌一致性与可信度，不能把文件名直接认定为 Google 排名处罚。

发布时应核对 HTML、对应图片资产与缓存，避免只上传新页面却把明确废弃的原图继续留在生产公共目录。检测报告保存了旧引用作为证据，报告中的文字不属于网站页面残留。

证据：[线上逐页记录的 other_brand_filename 项](./live-crawl.json)、[本次抓取首页 HTML](./live-home.html)。

### 3. 有替代内容的历史 URL 被统一 404：需要确认迁移意图

`src/data/siteUrls.mjs` 保留 82 个旧 URL 与新目标的关系，但 `pageRedirects` 为空；构建的移除规则覆盖 99 个下线地址及其变体。当前自动测试明确要求这些旧入口为 404，因此测试通过并不代表迁移策略已优化。

生产抽查：

| 旧地址，当前 404 | 配置中的替代页面 |
|---|---|
| `/blog/cnc-machining-defense` | `/blog/cnc-milling-and-turning-defense` |
| `/blog/medical-swiss-machining` | `/industries/medical-swiss-machining` |
| `/blog/cnc-locating-pinsi` | `/blog/cnc-locating-pins` |

若是等价内容搬迁或合并，且旧页有历史流量或外链，建议永久跳转到准确替代页；若是主动删除无价值或不相关页面，404 可以是正确策略。不要把 99 个地址全部跳转到首页，也不能在不知道下线原因时一律恢复跳转。本轮未更改既有下线决定，未声称已经发生流量损失。

证据：[完整 82 项映射](./local-diagnostic.json)、[生产抽查](./live-http-probes.json)。依据：[Google 对删除页和搬迁页的区分](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)、[永久跳转指南](https://developers.google.com/search/docs/crawling-indexing/301-redirects)。

## 三项主要优化机会

### 1. 修复摘要的完整性与信息量

38 个页面匹配通用描述模板；20 个描述被文本规则标为需要人工复核，其中以下 9 个确定在连接词处结束：

| 页面 | 当前摘要结尾 |
|---|---|
| `/blog/anodized-aluminum-vs-stainless-steel` | `safety, and` |
| `/blog/beveled-edges-cnc-machining` | `applications , and` |
| `/blog/choose-cnc-machining-company` | `manufacturing tips, and.` |
| `/blog/cnc-drilling` | `manufacturing tips, and.` |
| `/blog/fastener-machining` | `manufacturing tips, and.` |
| `/blog/shaft-machining` | `manufacturing tips, and.` |
| `/blog/swiss-machining` | `manufacturing tips, and.` |
| `/custom-cnc-parts/5-axis-cnc-machining-aerospace-components` | `finishing, inspection, and` |
| `/materials/metal-cnc-machining` | `quality control, and.` |

例如材料页摘要应说明提供的材料范围、适用零件与选材依据，而不是套入通用关键词列表。Google 可能根据查询改写摘要；修复描述属于展示质量优化，不保证点击率提升。本轮没有把标题超过 60 字符或描述超过某一长度认定为技术错误。

证据：[逐页描述清单](./local-diagnostic.json)。依据：[Google 摘要质量指南](https://developers.google.com/search/docs/appearance/snippet)。

### 2. 按首屏实际内容调整图片优先级与发布缓存

- 首页主图 `eager + fetchpriority=high` 正常；字体为本地 woff2，并有预加载。
- 88 篇文章中 40 篇的 main 首图为 lazy。桌面 1440×1000 抽查 `/blog/what-is-cnc`，图片 y=615、宽 800，在首屏范围内，却为 `loading=lazy` 且无高优先级。这是潜在 LCP 优化项；没有测得它一定是 LCP，也没有给出 CWV 不合格结论。手机 390×844 下同图 y=969，说明应结合视口判断。
- `/blog/5-axis-cnc-machining-manufacturers-in-china` 包含 24 个 eager 或未声明 lazy 的图片元素，`bronze-cnc-machining` 有 15 个。元素可能包含 picture/响应式的重复实例，不能把元素数当作实际网络请求数；仍建议检查屏外图片的加载策略。
- 抽查线上 22 个 CSS、JS、字体和图片资源全部 200；文本资源有 Brotli 压缩。缓存普遍为 `public, max-age=604800`，有哈希的 `_astro` 资源适合缓存，固定名称的可变资源应有版本策略。

证据：[资源响应头与图片配置](./followup.json)、[视口观察记录](./browser-checks.json)。依据：[Google web.dev LCP 优化指南](https://web.dev/articles/optimize-lcp/)。

### 3. 完善信息图片与相关主题内链

空 alt 分布在 4 页：

- `/blog/5-axis-cnc-machining-manufacturers-in-china`
- `/blog/brass-cnc-machining`
- `/blog/china-humanoid-robot-companies`
- `/blog/robot-hands`

共 58 个图片元素、29 个不同图片 URL；部分是网站截图或技术图片，需结合上下文判断。没有缺失 alt 属性的问题，发现的是 `alt=""`。不要给装饰性图片和隐藏重复实例机械填充关键词。依据：[Google 图片说明指南](https://developers.google.com/search/docs/appearance/google-images)。

首页深度分布：0 层 1 页，1 层 62 页，2 层 161 页，3 层 92 页，4 层 12 页。4 层包含 6 个作者分页及以下 6 篇博客：

- `/blog/cnc-machining-for-furniture-industry`
- `/blog/cnc-machining-for-renewable-energy`
- `/blog/cnc-metalworks`
- `/blog/cnc-services-for-startups`
- `/blog/cnc-near-me-vs-online-cnc-machining`
- `/blog/cnc-vs-sheet-metal`

这些页面都有入链，不是孤立页。应根据内容相关性和业务价值补充正文链接；未读取查询数据，不能判定这些页面正在关键词内耗。

证据：[图片逐项列表](./followup.json)、[全站链接深度与入链](../internal-link-structure/audit.json)。

## 重复入口的生产响应

| 请求 | 实际结果 | 判断 |
|---|---|---|
| `http://www.cncpioneer.com/` | 301 → HTTPS www 首页 | HTTPS 跳转正常 |
| `http://cncpioneer.com/` | 301 → HTTPS non-www 首页，最终 200 | 尚未归并到 www |
| `https://cncpioneer.com/` | 200 | 与 www 重复入口；canonical 可帮助归并，但永久跳转更一致 |
| `/index.html` | 200 | 默认文档重复入口 |
| `/services/swiss-machining/index.html` | 200 | 内页默认文档重复入口 |
| `/services/swiss-machining/` | 200，canonical 为无尾斜杠 | 与当前服务器跳转方向不一致 |
| `/services/swiss-machining?utm_source=seo-audit` | 301 → 带斜杠地址，保留参数 | 参数保留正常；仍存在格式不一致 |
| 随机不存在地址 | 404 | 不是将不存在页面全部返回 200 的 soft 404 模式 |
| `/search?q=cnc` | 跳转后 200 | 本地搜索页 noindex，且不在 sitemap 中 |

以上为本次网络环境下的公开响应，不代表 Googlebot 地区或 CDN 所有边缘节点的结果。

## 已通过与不应误报的项目

| 项目 | 本次结果与范围 |
|---|---|
| Robots / sitemap | 生产二者均 200；robots 允许抓取并声明 sitemap；328 个 sitemap URL 与本地集合一致 |
| 标题、描述、H1 | 本地与抓取的线上页面标题/描述无完全重复；本地 H1、必要 SEO 标签通过现有检查，线上 328 页每页一个 H1 |
| Canonical 标签 | 标签存在、项目内统一；生产尾斜杠响应冲突单独列为问题，不能用静态通过覆盖它 |
| 站内路径与锚点 | 本地 33,691 次站内链接：坏链接 0、坏 fragment 0、空锚文本 0、非规范格式链接 0；无孤立页、无首页不可达页 |
| 内容重复 | 88 篇博客正文共比较 3,828 对：完全重复 0，5 词组 Jaccard ≥30% 为 0，跨文章至少 30 词的完全重复段落为 0；不等于已排除相同搜索意图 |
| 图片基础 | 本地 4,451 个 img 元素均有宽高与 alt 属性；空 alt 另列人工复核；图像格式与严格 100KB 上限检查通过 |
| JavaScript / CSS / 字体依赖 | 本地引用与文件依赖检查通过；生产 22 个代表资源抽查均 200；不是全站每个线上图片都请求过 |
| 结构化数据 | JSON-LD 解析与项目关系检查通过，无 JSON 语法错误；不等于已通过 Google 所有富结果资格验证 |
| FAQ 结构化数据 | 31 页含 FAQPage。制造业网站不应期待政府/医疗类 FAQ 富结果展示；保留合规标记不属于错误。参见 [Google FAQ 展示政策](https://developers.google.com/search/blog/2023/08/howto-faq-changes) |
| 分页 | 博客 10 页、产品归档 6 页、两位作者分别 3/8 页；分页连续、页内项目与 prev/next 检查通过；不要把所有分页 canonical 到第一页 |
| lastmod | 从修订记录或内容日期生成，不按每次 build 自动刷新；未知日期可以省略。未来发布重要内容变更时应更新对应修订记录 |
| 手机适配 | 390×844 抽查首页、Swiss 服务、博客、材料、产品、报价 6 类页面：未见根页面横向溢出或已加载破图，H1 单一且正常换行 |
| 桌面适配 | 1440×1000 抽查首页、博客、产品 3 页：未见根页面横向溢出或已加载破图；不是全部 328 页逐一人工截图验收 |
| SEO 常见误报 | 没有多语言版本的英文站不因缺少 hreflang 自动判错；没有零售固定售价的定制加工业务不强加价格/评分 Schema；字数少的下载目录页不直接判为低质页 |

## 执行顺序与工作量

1. **先处理生产 URL 一致性（中）**：保留选定的 canonical 规则；统一尾斜杠、www、index.html；用 GET 而不只用 HEAD 验收 sitemap 全部地址直接 200，检查旧格式到新格式不超过一次跳转。
2. **发布本地品牌清理（小至中）**：以完整构建为发布单元，核对旧图移除范围，版本化共享资源；重新验收首页与车铣服务页。
3. **修复 9 个确定断句摘要，再复核 38 个模板摘要（中）**：描述完整、准确且体现各页差异。同步更新有实质改动页面的内容修订记录。
4. **逐项复核 82 个历史映射（中）**：有替代且应保留迁移关系的才使用 301；保留无替代删除页的正确 404。若改变该既定策略，应同步调整目前明确要求 404 的测试。
5. **优化图片加载与 alt（中）**：优先测博客/高价值落地页的首屏；补充信息图片说明，保留装饰图空 alt。
6. **完善相关主题入链（小）**：先考虑有业务价值的 6 篇深层博客。恢复 GSC 数据访问后，再按真实查询、流量和外链确定投入顺序。

## 数据缺口与技能约束

使用了 GSC Wizard 的 [site-audit 技能](C:/Users/HP/.codex/plugins/cache/openai-curated-remote/app-6a258ab1e0908191aa647c33299ad14c/3.0.6/skills/site-audit/SKILL.md)。其错误处理要求：

> If any call fails with an authentication or subscription error, stop

`list_sites` 返回 `payment_required / subscription_required`，明确提示试用结束或没有有效订阅，故停止 GSC 调用，并继续独立的本地/公开 HTTP 检测。补充该部分需要有效 GSC Wizard 订阅或试用、已连接 Google Search Console；如仍无法访问，再从应用/连接器设置重新连接。**本轮没有购买订阅或改变连接设置。**

公共 PageSpeed API 请求连接超时；线上浏览器导航也超时。生产网站本身的直接 HTTP 抓取成功，不能据此认定网站宕机。浏览器适配抽查使用本地版本，生产检查使用 HTTP。没有生成 Lighthouse 分数，也没有把本地加载速度冒充线上 Core Web Vitals。

尚未验证：真实索引覆盖、Google 选定 canonical、人工措施/安全问题报告、真实关键词排名与内耗、外链价值、GA4 转化、CrUX LCP/INP/CLS、服务器 Googlebot 日志、所有外站引用链接及所有线上媒体资源。报价邮件未提交测试，SMTP 投递不属于本轮 SEO 验收结论。

## 可复查证据

- [本轮发布验收汇总](./release-acceptance.json)，对应 `acceptance-1.log` 至 `acceptance-11.log`。
- [本地 330 页完整诊断](./local-diagnostic.json)。
- [生产 328 页抓取](./live-crawl.json)，保存最终 URL、HTTP 状态、响应头和页面元数据。
- [HTTP 入口和下线页抽查](./live-http-probes.json)。
- [跳转、代表资源和图片补充检查](./followup.json)。
- [手机与桌面检查记录及测量限制](./browser-checks.json)。
- [本轮生产 robots](./live-robots.txt)、[本轮生产 sitemap](./live-sitemap.xml)。
- [站内链接结构](../internal-link-structure/audit.json)、[博客正文重复检测](../blog-duplicates/audit.json)。

复现命令（在项目根目录执行；只生成报告，diagnostic/followup 会请求公开生产 URL）：

```powershell
node scripts/release-acceptance.mjs dist seo-migration/reports/full-seo-audit-2026-11-04
node scripts/audit-internal-link-structure.mjs
node scripts/audit-blog-duplicates.mjs
node seo-migration/reports/full-seo-audit-2026-11-04/diagnostic.mjs
node seo-migration/reports/full-seo-audit-2026-11-04/followup.mjs
```
