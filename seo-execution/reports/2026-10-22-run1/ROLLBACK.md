# 回滚说明

备份：C:/Users/HP/Documents/Codex/2026-10-15/http-127-0-0-1-4321-3/work/seo-backup-20261022

1. 查看 source-changes.json 的 scope；本轮外同步差异不要还原。
2. 比较待恢复文件当前 SHA-256 与 after 值；不一致说明后续又有修改，必须逐段合并。即使一致，共享数据/组件中也可能含并行修改，不能整份恢复以免丢失。
3. 本轮覆盖层为 blogSeoOverrides、blogContentAmendments、englishSeoContent；恢复调用这些层的源码及三个生成器相应片段。新增适配层未接入生产，可单独移除其调用/文件；确认无引用后再操作。
4. 构建后运行重点 URL 审计、redirect 映射和手机检查。不得恢复用户要求无 301 的 sensor 旧地址。
5. 若未来上线后回滚，使用托管平台上一部署版本及配套规则，清理相应缓存，保留新旧发布记录；本次没有在线版本可回滚。
