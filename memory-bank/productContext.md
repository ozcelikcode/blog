# Product Context

## Why It Exists

The project is a focused, developer-facing publication. It needs the reading experience of a calm editorial site and the operational clarity of a lightweight admin panel, without the maintenance burden of a traditional CMS.

## User Experience Goals

- Fast server-rendered public pages with narrow reading width
- Minimal, dark editorial admin experience aligned with the public brand
- Predictable content operations for drafts, scheduling, publishing, and taxonomy management
- Accessible forms, navigation, search, and pagination
- Secure server-side admin auth with no client-side auth shortcuts

## Editorial Model

- Content is canonical in SQLite, not filesystem collections
- Post bodies are Markdown stored in the database
- Drafts stay hidden from public routes
- Scheduled posts remain hidden until their publish time
- Featured content is managed through the admin post editor
- Settings, media, subscribers, and activity logs are manageable from the admin surface
