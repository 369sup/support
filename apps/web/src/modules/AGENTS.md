# Modules 結構規則

## 模組邊界

- 所有模組必須位於 `apps/web/src/modules/<subdomain>/<bounded-context>/`。
- `<subdomain>` 與 `<bounded-context>` 必須使用 lowercase kebab-case，並與 module-map.json 完全一致。
- Route、頁面、資料表、供應商、畫面或組織團隊不得直接作為 bounded context 的劃分依據。
- 每個 bounded context 必須具有唯一責任、明確擁有的業務概念與明確排除的責任。
- 每項業務規則與資料只能有一個 owning bounded context。

## 生命週期

- Planned context 只能包含 `README.md`。
- Planned context 不得包含原始碼、架構層、fixture、公開入口或區域 AGENTS.md。
- Active context 必須至少具有一個已核准且已實作的 use case。
- Active context 必須至少具有一個被實際 consumer 使用的公開入口。
- 只建立 active use case 實際需要的目錄，不得建立空層或預留目錄。

## Context Root

Context root 只允許包含：

- `README.md`
- `server-api.ts`
- `browser-ui.ts`
- `server-actions.ts`
- `integration-contracts.ts`
- `domain/`
- `application/`
- `contracts/`
- `adapters/`
- `composition/`
- `tests/`

Context root 不得包含 `index.ts`、`client.ts`、`actions.ts`、`public.ts`、`shared`、`common`、`utils` 或其他自訂入口。

每個公開入口只有在存在真實 consumer 時才能建立。

## Public Entrypoints

- `server-api.ts` 只公開 server-side application capabilities。
- `browser-ui.ts` 只公開 browser-safe UI、型別與瀏覽器能力。
- `server-actions.ts` 只公開明確的 Next.js Server Actions。
- `integration-contracts.ts` 只公開 framework-free 的跨 context contracts 與 integration events。
- 公開入口不得暴露 aggregate、entity、handler、port、adapter、ORM record、provider type 或 composition root。
- App 與跨 context import 必須經由 context root 的公開入口。
- 同一 bounded context 內的 import 必須使用相對路徑。

## Domain Layer

- `domain/` 只能包含純業務模型與純業務規則。
- Aggregate 必須位於 `domain/aggregates/`，檔名使用 `.aggregate.ts`。
- Entity 必須位於 `domain/entities/`，檔名使用 `.entity.ts`。
- Value Object 必須位於 `domain/value-objects/`，檔名使用 `.value-object.ts`。
- Domain Service 必須位於 `domain/services/`，檔名使用 `.domain-service.ts`。
- Domain Policy 必須位於 `domain/policies/`，檔名使用 `.policy.ts`。
- Domain Event 必須位於 `domain/events/`，檔名使用 `.domain-event.ts`。
- Domain Error 必須位於 `domain/errors/`，檔名使用 `.domain-error.ts`。
- Domain layer 不得依賴 Next.js、React、ORM、provider SDK、Node API、環境變數、adapter 或 composition。
- Domain Service 只能包含無法自然放入 entity、aggregate 或 value object 的純業務規則。
- Domain Service 不得負責 use case orchestration、持久化、外部服務呼叫或 transaction coordination。

## Application Layer

- `application/` 只允許包含：
  - `commands/`
  - `queries/`
  - `ports/inbound/`
  - `ports/outbound/`
- `application/services/` 不得作為新架構的慣例建立；僅得保留既有 legacy 檔案，且不得新增 service 檔名為新的實作單元。
- 既有 legacy `application/services/` 後續改動需逐步遷移至
  `commands/`、`queries/` 與對應 `ports`，不再新增功能到 legacy 目錄。
- `application/mappers/` 目前僅在少數既有 context（如 media-storage）使用做 boundary 映射；
  除必要遷移外維持 legacy，不新增 mapper 新功能。
- 每個 command 或 query 必須對應一個明確的使用者或系統意圖。
- Command handler 必須位於 `application/commands/`。
- Query handler 必須位於 `application/queries/`。
- Handler 檔名必須使用 `<use-case>.handler.ts`。
- 每個 active use case 必須具有對應的 inbound port。
- Inbound port 必須位於 `application/ports/inbound/`，檔名使用 `<use-case>.use-case.ts`。
- Outbound repository port 必須位於 `application/ports/outbound/`，檔名使用 `.repository.port.ts`。
- Outbound gateway port 必須位於 `application/ports/outbound/`，檔名使用 `.gateway.port.ts`。
- Handler 必須直接承擔該 use case 的流程協調責任，不得退化成只轉呼叫大型 application service 的 wrapper。
- 可重用的純業務判斷必須移至 domain service 或 domain policy。
- Application layer 不得直接依賴 adapter、ORM、provider SDK、Next.js、React、Node API 或環境變數。
- Application layer 所需的外部能力必須透過 outbound port 表達。

## Contracts

- `contracts/` 只放 context boundary 使用的 DTO、snapshot、reference、input、output 或公開資料契約。
- Contracts 必須保持 framework-free 與 implementation-free。
- Contracts 不得包含業務流程、持久化行為或 adapter 實作。
- Contracts 不得直接暴露 domain object、ORM record 或 provider type。
- Domain object、DTO、persistence record、provider type、domain event 與 integration event 必須視為不同契約。

## Adapters

- Inbound adapter 必須位於 `adapters/inbound/`。
- Server inbound adapter 必須位於 `adapters/inbound/server/`。
- React inbound adapter 必須位於 `adapters/inbound/react/`。
- Next route adapter 必須位於 `adapters/inbound/next/`。
- Next route handler 必須位於 `adapters/inbound/next/route-handlers/`。
- Outbound adapter 必須位於 `adapters/outbound/`。
- Persistence adapter 必須位於 `adapters/outbound/persistence/`。
- 跨 context 或外部系統整合 adapter 必須位於 `adapters/outbound/integration/`。
- Adapter 檔名必須使用 `.adapter.ts`。
- Adapter 只能負責邊界轉換與技術實作，不得成為業務規則的 owner。
- Inbound adapter 與 outbound adapter 不得直接相互依賴。
- Outbound adapter 必須實作既有 outbound port，不得自行定義 application policy。

## Composition

- `composition/` 只負責建立、組裝與連接 handler、port 與 adapter。
- Composition root 檔名必須使用 `<bounded-context>.composition.ts`。
- Composition root 不得包含業務規則、輸入驗證或持久化邏輯。
- Composition root 必須保持 private，不得由公開入口直接重新匯出。

## Use Case Traceability

- 每個 active use case 必須保持以下完整追蹤鏈：
  - `activationScope` → `Designed use case` → `UseCase interface` → `operation()` → `handler` → `public entrypoint`
- Use case 名稱必須使用 kebab-case。
- Use case interface 必須使用 `<PascalCaseUseCase>UseCase`。
- Use case operation 必須使用對應的 camelCase 名稱。
- Handler 不得使用 `execute`、`handle`、`process` 或 `run` 等泛用 operation 名稱。
- `activationScope`、README 中的 active designed use cases 與實際 handler 必須完全一致。
- Planned use case 不得存在 inbound port、handler 或公開入口實作。

## Dependency Rules

- Domain 只能依賴同一 context 的 domain。
- Application 只能依賴同一 context 的 application、domain 與 contracts。
- Inbound adapter 可以依賴 application 與 contracts。
- Outbound adapter 可以依賴 outbound ports、domain 與 contracts。
- Composition 可以依賴 application、adapters 與 contracts。
- 跨 context 同步依賴必須同時具有：
  - 公開入口；
  - module-map.json 中的 synchronous dependency。
- plannedRelationships 不得授權 runtime import。
- Active context 的 runtime dependency 只能指向 active context。
- Domain context 不得依賴 projection context。
- Source dependency graph 必須保持無循環。

## Naming

- 所有目錄與原始碼檔名必須使用 lowercase kebab-case。
- Class、type、interface 與 React component 必須使用 PascalCase。
- Function 與 variable 必須使用 camelCase。
- Boolean 名稱必須使用 `is`、`has`、`can`、`should`、`was` 或 `did` 等 predicate prefix。
- 不得使用 `utils`、`helpers`、`common`、`shared`、`service`、`manager`、`processor`、`types`、`models`、`interfaces`、`handlers` 或 `constants` 等模糊名稱。
- 普通模組檔案只能有一個主要 runtime export。
- 不得使用 wildcard export 或多層 barrel export。

## Tests

- Domain tests 不得依賴 framework、database、network 或 adapter。
- Use case tests 必須以 fake 或 stub 控制所有 outbound ports。
- Adapter tests 必須驗證實際技術契約與邊界轉換。
- Public entrypoint 必須具有 contract test。
- 測試檔必須放在 context 的 tests/ 中，除非測試框架規則明確要求 colocated test。
- 測試名稱必須對應 use case、entrypoint、adapter 或 contract，不得使用模糊名稱。

## README 與 Catalog

- 每個 context 必須具有一個且僅有一個 `README.md`。
- README 的 ownership、exclusions、dependencies、activation scope、events 與 module-map.json 必須一致。
- README 的 Context content tree 必須引用所有 owned concepts、activation scopes 與 published events。
- Active context README 必須包含完整的 authorization、persistence、data、retention、event 與 failure decisions。
- Planned context README 不得描述 active capability。
- README 不得作為機器規則的唯一執行方式；可機械驗證的規則必須由 architecture checker、ESLint 或測試執行。

## Enforcement

- Architecture checker 必須驗證 context root 與所有 nested layer path。
- 未列入 allowlist 的 nested directory 必須視為違規。
- `.service.ts` 不得作為未定義架構角色繞過檢查。
- 新增或修改結構規則時，必須同步更新：
  - canonical architecture 文件；
  - machine-readable policy；
  - checker 或 ESLint；
  - positive fixture；
  - negative fixture。
- 架構例外必須登記於正式 exception registry，並具有範圍、原因、風險與到期日。
- 永久、未使用、過期或超出範圍的架構例外不得存在。

## AGENTS.md

須有標準結構樹作為參照：

```text
apps/web/src/modules/
├─ AGENTS.md
└─ <subdomain>/
   └─ <bounded-context>/
      ├─ README.md
      │
      ├─ server-api.ts                 # optional：server-side facade
      ├─ browser-ui.ts                 # optional：browser-safe UI/API
      ├─ server-actions.ts             # optional：Next.js Server Actions
      ├─ integration-contracts.ts      # optional：cross-context contracts/events
      │
      ├─ domain/
      │  ├─ aggregates/
      │  │  └─ <name>.aggregate.ts
      │  ├─ entities/
      │  │  └─ <name>.entity.ts
      │  ├─ value-objects/
      │  │  └─ <name>.value-object.ts
      │  ├─ services/
      │  │  └─ <name>.domain-service.ts
      │  ├─ policies/
      │  │  └─ <name>.policy.ts
      │  ├─ events/
      │  │  └─ <name>.domain-event.ts
      │  └─ errors/
      │     └─ <name>.domain-error.ts
      │
      ├─ application/
      │  ├─ commands/
      │  │  └─ <use-case>.handler.ts
      │  ├─ queries/
      │  │  └─ <use-case>.handler.ts
      │  └─ ports/
      │     ├─ inbound/
      │     │  └─ <use-case>.use-case.ts
      │     └─ outbound/
      │        ├─ <capability>.repository.port.ts
      │        └─ <capability>.gateway.port.ts
      │
      ├─ contracts/
      │  └─ <boundary-contract>.ts
      │
      ├─ adapters/
      │  ├─ inbound/
      │  │  ├─ server/
      │  │  │  └─ <use-case>.adapter.ts
      │  │  ├─ react/
      │  │  │  └─ <component>.tsx
      │  │  └─ next/
      │  │     └─ route-handlers/
      │  │        └─ <operation>.handler.ts
      │  └─ outbound/
      │     ├─ persistence/
      │     │  └─ <technology-or-scope>.adapter.ts
      │     └─ integration/
      │        └─ <target-context>.adapter.ts
      │
      ├─ composition/
      │  └─ <bounded-context>.composition.ts
      │
      └─ tests/
         ├─ <use-case>.test.ts
         ├─ <entrypoint>.test.ts
         └─ <adapter-or-contract>.test.ts
```
