# 企業 / 組織 / 用戶 / 儲存庫缺口雛形報告

**Date:** 2026-07-25
**Snapshot time:** 2026-07-25T12:51:46+08:00
**Scope:** `apps/web/src/modules` 下列子域
`collaboration, commerce, engagement, enterprises, governance, identity, integrations, organizations, platform, projections, repositories`
**Versioned context source:**
- `docs/architecture/module-map.json`
- `docs/architecture/module-map.md`
- 各子域 `README.md`（`apps/web/src/modules/<subdomain>/<context>/README.md`）
- 開發實作檔（`server-api.ts`, `application/*`, `tests/*`）
- `repomix` 跨模組快照（見下）

**執行原則（本次僅為報告）**
- 不新增/修改 runtime 行為、不改 API、不改路由、不改 session API。
- `in-memory-*` 僅視為目前既有暫存前提；**本輪不將其視為阻塞式 P0 缺口**。

## 一、Repomix 上下文索引（本次調查的可重現輸入）

- **命令：** `pack_codebase`
- **範圍：** `apps/web/src/modules`
- **Include pattern：** `**/*.md,**/*.ts,**/*.tsx`
- **輸出檔：** `C:\Users\sup\AppData\Local\Temp\repomix\mcp-outputs\V38yF4\repomix-output.md`
- **outputId：** `7d3c061f65b97c10`
- **SHA-256：** `08CEC56BB18D8302371BFC564133714DFE6B7835A552185E0170205FB3CE8E46`
- **計數（from repomix）：** 383 檔 / 179,157 tokens

## 二、module-map 對照摘要（active / planned）

| 子域 | Context 總數 | Active | Planned |
| --- | --- | ---: | ---: |
| collaboration | 7 | 0 | 7 |
| commerce | 2 | 0 | 2 |
| engagement | 3 | 0 | 3 |
| enterprises | 7 | 3 | 4 |
| governance | 1 | 0 | 1 |
| identity | 4 | 2 | 2 |
| integrations | 6 | 0 | 6 |
| organizations | 6 | 4 | 2 |
| platform | 5 | 4 | 1 |
| projections | 4 | 1 | 3 |
| repositories | 4 | 2 | 2 |

> 備註：`in-memory-*` 是目前所有 active contexts 的預設持久化形式之一，需在下一輪替換為持久化實作（非本輪阻斷）。

## 三、缺口矩陣（聚焦企業 / 組織 / 用戶 / 儲存庫）

欄位定義：
- **現況（Active/Planned）**：依 `module-map.json` 與 context README。
- **缺口（精確缺失）**：已有文檔但未實作、或缺少生命周期/契約。
- **依賴阻塞**：所依賴上下文仍為 planned 或缺失。
- **in-memory 假設下可否暫緩**：本輪仍可暫緩或需先行。
- **下一步最小前置**：建議啟動該缺口前需完成的前置行為。

### 1) identity（用戶）

| Context | 現況（Active/Planned） | 缺口（精確缺失） | 依賴阻塞 | in-memory 假設下可否暫緩 | 下一步最小前置 |
| --- | --- | --- | --- | --- | --- |
| identity/profiles | planned | 無 active use case；`server-api.ts` 不存在；只有設計文件。 | 無（尚未激活） | 可暫緩（P0 不做） | 建立 public entrypoint、domain/service、持久化 adapter 前的 schema/授權與可見性定義。
| identity/social-graph | planned | 無 active use case；僅 README。 | 無（尚未激活） | 可暫緩（P0 不做） | 明確 follow/unfollow + 失敗/重複行為 + 持久化策略與 API 邊界。
| identity/accounts | active（查詢） | 仍為查詢主軸：缺少個人/組織帳號生命週期事件驅動（delete/suspend/change）。
（參考 `apps/web/src/modules/identity/accounts`） | `authentication` 與 `governance` 後續授權/審計流程未完全接續 | 可暫緩 | 建議與企業/組織 offboarding 需求對齊後再補生命週期事件。
| identity/authentication | active（登入/會話） | 專用 runtime 還未生產化（仍為 dev 流程）；已有 in-memory/測試面。
依賴在 `in-memory` adapter | 可暫緩 | 保留現狀；下一輪加入生產 credential/session 實作時以既有 API 不變。

### 2) enterprises（企業）

| Context | 現況（Active/Planned） | 缺口（精確缺失） | 依賴阻塞 | in-memory 假設下可否暫緩 | 下一步最小前置 |
| --- | --- | --- | --- | --- | --- |
| enterprises/enterprises | active | 只實作 `get-enterprise-by-slug` 與 `list-enterprise-organizations`；缺少建立、profile、suspend、reinstate、刪除、link/unlink lifecycle。 | `enterprise-memberships`、`organization-teams`、`enterprises/enterprise-policies` 作為後續關係 | 可暫緩（P0 不做） | 先定義 enterprise lifecycle 事件契約再補持久化。
| enterprises/enterprise-memberships | active | 目前僅 `list-active-enterprise-affiliations-for-account`；缺 `invitation` lifecycle、guest 狀態、offboard/撤銷、`enterprise-member` 邊界。 | `organizations/organization-memberships`（計畫關係）、`organization-memberships` 尚未支援完整 invitation | 可暫緩 | 先補 `invitation + membership source` 狀態機，再接續 offboarding。
| enterprises/enterprise-roles | active | 僅 `authorize-enterprise-administration`；缺 custom role、role 指派/撤回流程與變更事件。
> README 已列出 `EnterpriseRoleDefined/Updated/Deleted/Assigned/Revoked` 為規劃。 | `enterprise-memberships` active；`enterprise-teams` planned（可作為指派主體）| 可暫緩（角色定義屬P0但不阻塞本輪） | 補齊 roles 定義與指派事件前置流程。
| enterprises/enterprise-policies | planned | 目前文檔無 active use case；只有政策概念（`EnterprisePolicy`, `EnterprisePolicyEnforcement`）與規劃事件。 | `organizations/organization-policies` 設計聯動 | 可暫緩 | 首先完成 Organization/Repository policy 齊全契約，再回填 enterprise policy 分層。
| enterprises/enterprise-teams | planned | 目前無實作檔與 `server-api.ts`；README 僅保留規劃。 | 依賴 enterprise 成員/身份前置未完成 | 可暫緩 | 僅在 enterprise-memberships 與 enterprise-roles 的主體責任完成後啟動。

### 3) organizations（組織）

| Context | 現況（Active/Planned） | 缺口（精確缺失） | 依賴阻塞 | in-memory 假設下可否暫緩 | 下一步最小前置 |
| --- | --- | --- | --- | --- | --- |
| organizations/organizations | active | 只做 `get-organization-by-login`、`get-organization-reference-by-id`；缺 `create/update/rename/lifecycle`、verified domain。
  （README 中規劃 `OrganizationCreated` 等事件） | `organizations/organization-memberships` active（但僅活躍查詢），`repositories/repositories` 待接收 policy 影響 | 可暫緩 | 完成 Organization identity 對 membership/entitlement 的邊界定義後補 lifecycle。 |
| organizations/organization-memberships | active | 僅 membership eligibility/list；缺 invitation lifecycle、成員角色變更、suspended/reinstated、offboarding、former-member 邏輯。 | 計畫關係 `enterprise-memberships` + `organization-policies` 與 `repositories` 權限 | 可暫緩 | 先補 `OrganizationInvitation*`、`MembershipState` 與 role-transition contract。
| organizations/organization-roles | active | 已有固定角色列表與指派/撤回；缺 custom role 管理、Repository policy 細分、`organization role catalog` 生效邏輯的完整事件擴充。
（README 顯示 role 事件多數為 planned） | 依賴 `organization-memberships`, `organization-teams`, `organization-policies` | 可暫緩 | 同步補齊 organization-policy + members 邊界。
| organizations/organization-teams | active | 已有完整 team CRUD + 會員/maintainer/階層；缺 `TeamCreationPolicy` 來源整合（預留於 organization-policies）與 IdP managed mode。 | `organization-memberships` active + `organization-policies` planned | 可暫緩 | 先落實 organization-membership offboarding 再補 policy 連動。
| organizations/organization-policies | planned | 無 active use case；缺 repository/team 創建 policy 等核心策略與 repository base permission。
README 僅含規劃欄位（`RepositoryCreationPolicy` 等）。 | `enterprise-policies` planned | 可暫緩 | 先以 repository/enterprise 共同策略模型為前置後再啟動。

### 4) repositories（儲存庫）

| Context | 現況（Active/Planned） | 缺口（精確缺失） | 依賴阻塞 | in-memory 假設下可否暫緩 | 下一步最小前置 |
| --- | --- | --- | --- | --- | --- |
| repositories/repositories | active | 僅提供公開/可信代理查詢（owner/name/list）；缺 `create/update profile/rename/visibility/transfer/lifecycle/restore`。 | `organization-policies`、`commerce/entitlements` 規劃關係 | 可暫緩（P0 不做） | 先補 policy/entitlement 設計後補 repository lifecycle 用例。
| repositories/repository-access | active（team grant + effective permission） | README 已宣稱 ownership `RepositoryInvitation` 等，但程式尚未有 invitation、direct grant、outside collaborator 的指令。
缺 `RepositoryRedirect` 後續授權與 `delete/restore` 對 grant 影響一致性。 | `organization-policies`、`enterprise-roles`、`enterprise-teams`、repository lifecycle events 計畫中
（`repositories/repositories` 的 `RepositoryLifecycleEvents` 尚未提供）| 可暫緩 | 先補 repository 邊界事件（Delete/Restore/Transfer）與 invitation/direct/grant pipeline。
| repositories/repository-features | planned | 規格待啟：無 active use case。 | 依賴 repository lifecycle + entitlements | 可暫緩 | 依序對齊 `repositories/repositories` lifecycle 後再啟。
| repositories/repository-metadata | planned | 規格待啟：metadata 權限與存取變更未實作。 | `repositories/repositories`, `platform/media-storage` | 可暫緩 | 等 repository role/admin 決策明確化與 media reference 合約。

### 5) 其他子域（本輪只做 README 級別一致性）

| 子域 | 現況 | 缺口摘要 |
| --- | --- | --- |
| collaboration | planned（全部 context） | 僅有 README，缺全部入口/handler/測試與持久化實作。
依賴關係會影響社交事件鏈，暫不啟。
 |
| commerce | planned（billing, entitlements） | 僅 README；尚未有 account/org 用量、賬單管理與 entitlement 實作，影響 enterprise/organization/儲存庫授權。 |
| engagement | planned | 僅 README；未有 stars/subscriptions/notifications 的實際 handler。
 |
| integrations | planned | 僅 README；尚未有 webhook/授權/registration/autolink pipeline。
 |
| governance | planned（audit-logs） | 以基礎事件紀錄 scaffold 為主，缺完整 audit trace 與 retention 實作。
 |
| platform/projections | 混合：audit-storage/event-publication/media-storage/search-index/dashboard active；其他 planned | active contexts 已有測試/handler，其他仍為文件；
`notification-channels`, `projections/search/activity-feed/repository-insights` 僅 README，仍待 activation。
 |

## 四、in-memory 前提與「非阻塞」判定

以下 contexts 明確出現 `in-memory-*` adapter（或明確描述為 process Map）但本輪不阻塞：

- `identity/accounts`: `in-memory-account-query.adapter.ts`
- `identity/authentication`: `in-memory-browser-session-set.adapter.ts`, `in-memory-development-credential.adapter.ts`
- `enterprises/enterprise-memberships`: `in-memory-enterprise-membership-query.adapter.ts`
- `enterprises/enterprise-roles`: `in-memory-enterprise-role-assignment.adapter.ts`
- `enterprises/enterprises`: `in-memory-enterprise-query.adapter.ts`
- `organizations/organization-memberships`: `in-memory-organization-membership-query.adapter.ts`
- `organizations/organization-roles`: in-memory assignment/id-generator/outbox adapters
- `organizations/organization-teams`: in-memory team store/outbox/id-generator adapters
- `organizations/organizations`: `in-memory-organization-query.adapter.ts`
- `repositories/repositories`: `in-memory-repository-query.adapter.ts`
- `repositories/repository-access`: in-memory grant/grant-id/outbox adapters
- `platform/*` active contexts also carry in-memory adapters（目前主要作為穩定性中介）

> 以上不改為阻塞式缺口。若以產品可用性定義優先順序，該條件只屬「技術成熟度」缺口。

## 五、影響鏈（High-impact chain）

1. **`enterprises/enterprise-memberships`（會員關係）→ `organizations/organization-memberships`（組織會員）→ `organizations/organization-roles/organization-teams`（權限/群組）→ `repositories/repository-access`（有效權限）**
   - 當企業會員生命周期未完成前，組織權限與 repository access 的「來源真實性」難證。

2. **`repositories/repositories`（查詢/候選）→ `repositories/repository-access`（授權決策）→ `engagement/stars/subscriptions`（待啟）**
   - repository 生命週期（刪除/歸檔/恢復）若未定義，後續協作能力會產生不一致。

3. **`organizations/organization-policies`（計畫）→ `repositories/repository-access`（base permission / outside collaborator policy）**
   - 策略缺口會直接讓實際授權模型退化為 active 部分邏輯。

## 六、實作序列建議（不改既有邊界）

1. **identity 邊界補齊（email / authentication recovery / managed-user capability）**
   - 目標：維持 current behavior 不變的前提下，補齊 `identity/profiles`、`identity/social-graph` 的入口與資料邏輯先導規格。
   - 前置：建立明確 account 能力分類（personal/managed）與 auth recovery 視圖。

2. **enterprise-memberships / organization-memberships 邀請與 offboard 生命周期**
   - 目標：先補 `OrganizationInvitation` / `EnterpriseInvitation` 狀態機與 offboarding 協調。
   - 前置：先補兩個 use case 對應事件（`OrganizationMemberAdded/Removed/Revoked`、`EnterpriseMemberAdded/Removed`）。

3. **repository-access 來源完整化（team/direct/outside + enterprise membership）**
   - 目標：補 direct person grant、outside collaborator、repository invitation event contract，並接上 enterprise role/team 來源。
   - 前置：完成步驟 2 以穩定 membership 狀態。

4. **repository lifecycle consequence（rename redirect, delete/restore）**
   - 目標：先補 `rename` redirect、`RepositoryDeleted/Restored/Archived` 對 access 決策的後處理。
   - 前置：步驟 3 的 access event contract 與 repository identity policy 完成。

## 七、雛形故事清單（可直接切換為 backlog）

| 上下文 | 缺口 | 輸入/輸出 | 影響模組 | 完成條件 |
| --- | --- | --- | --- | --- |
| identity/profiles | Activate profile context | Input: profile/profile-status/pinned；Output: profile snapshot + visibility event | identity/accounts | 服務對外公開、契約與測試完整、event contract 完整
 |
| identity/social-graph | Activate follow context | Input: follow/unfollow 命令；Output: follow relation、notification token（未來） | identity/accounts、organizations/organizations | follow event、授權邊界、持久化與刪除策略
 |
| identity/social-graph | managed-user capability contract | Input: account mode；Output: capability policy | identity/accounts | 非人類帳號行為限制可測試
 |
| enterprises/enterprise-memberships | Invitations/offboarding | Input: 邀請、撤回、suspend/resume；Output: affiliation/guest 狀態 | enterprises/enterprises、organizations/organization-memberships | 邀請事件鏈完整、enterprise->org 轉移不致污染狀態
 |
| enterprises/enterprise-policies | policy contract | Input: policy type + scope；Output: policy decision + enforcement | organizations/organization-policies | 覆蓋 repository creation/deletion/visibility/outside-collab。
 |
| organizations/organization-memberships | Membership invitation lifecycle | Input: invitation payload；Output: membership state transitions | organizations/organizations、repositories/repository-access | 邀請/到期/撤銷事件與 offboarding 可追蹤
 |
| organizations/organization-memberships | Former member + ownership continuity | Input: former-member restore/deny；Output: 還原結果 + 影響記錄 | repositories/repository-access、organization-roles | 還原流程明確、對權限與內容可預期
 |
| repositories/repositories | rename redirect + tombstone | Input: rename/delete/archive/restore | repositories/repository-access、platform/event-publication | redirect 失效規則與 restore 影響定義完成
 |
| repositories/repository-access | direct/outside collaboration path | Input: account 邀請/授權；Output: effective permission | organizations/organization-memberships、organization-roles、enterprise-* | 影響決策與事件（accepted/revoked/declined）可追蹤
 |
| repositories/repository-access | enterprise membership contribution | Input: enterprise membership/grant source；Output: permission decision | enterprises/enterprise-roles | enterprise 來源對 internal repo 決策一致
 |

## 八、可驗證證據索引（報告引用）

- `docs/architecture/module-map.json`（狀態/依賴/事件）
- `docs/architecture/module-map.md`（導出總覽）
- `apps/web/src/modules/identity/profiles/README.md`
- `apps/web/src/modules/identity/social-graph/README.md`
- `apps/web/src/modules/enterprises/enterprise-memberships/README.md`
- `apps/web/src/modules/enterprises/enterprise-memberships/server-api.ts`
- `apps/web/src/modules/enterprises/enterprise-roles/README.md`
- `apps/web/src/modules/enterprises/enterprise-roles/server-api.ts`
- `apps/web/src/modules/enterprises/enterprise-roles/tests/authorize-enterprise-administration.test.ts`
- `apps/web/src/modules/enterprises/enterprise-policies/README.md`
- `apps/web/src/modules/organizations/organizations/README.md`
- `apps/web/src/modules/organizations/organizations/server-api.ts`
- `apps/web/src/modules/organizations/organization-memberships/README.md`
- `apps/web/src/modules/organizations/organization-memberships/server-api.ts`
- `apps/web/src/modules/organizations/organization-roles/README.md`
- `apps/web/src/modules/organizations/organization-roles/tests/organization-role.service.test.ts`
- `apps/web/src/modules/organizations/organization-teams/README.md`
- `apps/web/src/modules/organizations/organization-teams/tests/organization-team.service.test.ts`
- `apps/web/src/modules/repositories/repositories/README.md`
- `apps/web/src/modules/repositories/repositories/server-api.ts`
- `apps/web/src/modules/repositories/repositories/tests/server-api.test.ts`
- `apps/web/src/modules/repositories/repository-access/README.md`
- `apps/web/src/modules/repositories/repository-access/tests/team-repository-access.service.test.ts`
- `apps/web/src/modules/repositories/repository-access/tests/resolve-effective-repository-permission.test.ts`

## 其它驗證記錄

- `repomix` 快照輸出與 hash 已核對（見上方索引）。
- `Serena JetBrains` 在本環境未提供穩定 symbol 服務；本輪以 `rg`、module-map、README 與實作檔存在性作為交叉證據來源。

---

## 九、驗證（本輪）

- 僅文件輸出。
- 已使用 `rg` + 檔案快照確認上述 evidence。
- 已完成 repomix 快照（可重現）並記錄 output/hash。
- 未執行 `pnpm architecture`（除非進入程式碼變更提交流程）。
