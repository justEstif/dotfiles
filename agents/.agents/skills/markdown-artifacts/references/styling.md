# Mermaid Styling Reference

## Use frontmatter config

Mermaid directives like `%%{init: ...}%%` are deprecated in Mermaid v10.5+. Use frontmatter config inside the Mermaid fence.

```mermaid
---
config:
  theme: base
  themeVariables:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    primaryColor: '#eef6ff'
    primaryTextColor: '#172554'
    primaryBorderColor: '#2563eb'
    lineColor: '#64748b'
    secondaryColor: '#fff7ed'
    tertiaryColor: '#f8fafc'
---
flowchart LR
  A[Client] --> B[API]
```

`theme: base` is required for custom `themeVariables`; Mermaid's other built-in themes are not customizable.

## Approved class vocabulary

Use these classes consistently across flowcharts.

```mermaid
flowchart LR
  API[API Gateway]:::primary
  Auth[Auth Service]:::primary
  DB[(User DB)]:::data
  Legacy[Legacy Path]:::risk
  SaaS[External Provider]:::external

  API --> Auth --> DB
  API -.-> SaaS
  Auth --> Legacy

  classDef primary fill:#eef6ff,stroke:#2563eb,color:#172554,stroke-width:1px;
  classDef data fill:#fff7ed,stroke:#ea580c,color:#431407,stroke-width:1px;
  classDef risk fill:#fef2f2,stroke:#dc2626,color:#450a0a,stroke-width:1px;
  classDef success fill:#ecfdf5,stroke:#059669,color:#064e3b,stroke-width:1px;
  classDef neutral fill:#f8fafc,stroke:#64748b,color:#0f172a,stroke-width:1px;
  classDef external fill:#f8fafc,stroke:#64748b,color:#0f172a,stroke-dasharray:4 4;
```

Class meanings:

| Class | Use |
| --- | --- |
| `primary` | first-party services/components |
| `data` | databases, queues, object stores |
| `risk` | fragile, legacy, blocked, or dangerous paths |
| `success` | target state, completed path, validated branch |
| `neutral` | supporting nodes |
| `external` | third-party systems or outside boundaries |

## Layout rules

- Use `flowchart LR` for architecture and data flow.
- Use `flowchart TD` for decision trees and processes.
- Use subgraphs for ownership/boundaries, not decoration.
- Keep edge labels short: 1–4 words.
- Prefer semantic node IDs (`AuthService`) and readable labels (`Auth Service`).
- Split diagrams that require crossing edges to understand.

## Subgraph pattern

```mermaid
flowchart LR
  subgraph Client[Client]
    Browser[Browser]:::external
  end

  subgraph Platform[Platform]
    API[API Gateway]:::primary
    Auth[Auth Service]:::primary
  end

  subgraph Data[Data]
    Users[(Users DB)]:::data
  end

  Browser --> API --> Auth --> Users

  classDef primary fill:#eef6ff,stroke:#2563eb,color:#172554,stroke-width:1px;
  classDef data fill:#fff7ed,stroke:#ea580c,color:#431407,stroke-width:1px;
  classDef external fill:#f8fafc,stroke:#64748b,color:#0f172a,stroke-dasharray:4 4;
```

## Accessibility

Add `accTitle` and `accDescr` for diagrams that will be shared broadly.

```mermaid
flowchart LR
  accTitle: Auth request path
  accDescr: Request flows from client to API, then auth service, then users database.
  Client --> API --> Auth --> Users[(Users DB)]
```

## Avoid

- More than six colors.
- Multiple class vocabularies in one document.
- Long paragraphs inside nodes.
- HTML labels unless required by the renderer.
- Styling every edge individually.
