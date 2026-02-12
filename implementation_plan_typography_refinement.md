---
title: Refining Typography for Premium Feel
description: Adjusting font sizes to achieve a balanced, readable, yet premium aesthetic (smaller than previous update, larger than original).
---

The user found the recent font size increase to be excessive and "less premium". The goal is to find a middle ground that improves readability and UX without sacrificing the elegant, minimal aesthetic.

## Proposed Font Sizing (Middle Ground)

### Home.jsx Typography

| Element | Original Size | Recent Size | Proposed Size | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Subtitle** (A personal curation...) | `0.55rem` | `0.75rem` | `0.65rem` | Elegant but legible. |
| **Section Headers** (ViCINO A TE, NOVITA) | `0.5rem` | `0.75rem` | `0.6rem` | Stronger presence but not shouting. |
| **Visualizza tutti** (Link) | `0.5rem` | `0.75rem` | `0.6rem` | Consistent with headers. |
| **Place Name** (Cards) | `0.9rem` | `1.05rem` | `0.95rem` | Needs to be the primary focus. |
| **Place City/Subtext** (Cards) | `0.55rem` | `0.7rem` | `0.6rem` | Secondary information. |
| **Badges** (Category/Price) | `0.45rem` | `0.65rem` | `0.55rem` | Subtle but readable. |
| **Map Button** (APRI MAPPA) | `0.5rem` | `0.75rem` | `0.6rem` | Clear call to action. |

### PlaceDetails.jsx Typography

| Element | Original Size | Recent Size | Proposed Size | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Badge** (Curated/Category) | `0.5rem` | `0.7rem` | `0.6rem` | Subtle indicator. |
| **Tags** | `0.5rem` | `0.7rem` | `0.6rem` | Informational tags. |
| **Address/Details** | `0.7rem` | `0.95rem` | `0.8rem` | Key practical info. |
| **Body Text** (Description) | `1.1rem` | `1.15rem` | `1.1rem` | Already good, maybe slight tweak if needed. |
| **Info Labels** | `0.5rem` | `0.7rem` | `0.6rem` | Small caps aesthetic. |
| **Info Values** | `0.9rem` | `1.05rem` | `0.95rem` | Clear data points. |
| **Button** (Website) | `0.7rem` | `0.9rem` | `0.8rem` | Main action. |

## Implementation Steps

1.  **Refine `Home.jsx`**: Apply the proposed sizes to headers, subtitles, and place cards.
2.  **Refine `PlaceDetails.jsx`**: Apply the proposed sizes to details, badges, and layout elements.
