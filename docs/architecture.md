# Architecture

Senda uses two map layers with separate latency and durability goals. The live layer powers the citizen loop immediately; the routing layer turns validated data into Valhalla routing behavior.

```mermaid
flowchart LR
  User[Mobile web user] --> Web[Next.js PWA]
  Web --> API[FastAPI contracts]
  Web --> Live[Live map view]

  API --> Route[Route endpoint]
  API --> Report[Report endpoint]
  API --> Features[Feature endpoint]
  API --> Transport[Transport endpoint]

  Report --> Firestore[(Firestore live layer)]
  Features --> Firestore
  Firestore --> Live
  Firestore --> Hot[Hot excludes]

  Route --> Matrix[Impact matrix resolver]
  Matrix --> Hot
  Hot --> Valhalla[Valhalla over OSM]
  Valhalla --> Route

  Scan[City scan pipeline] --> OSM[Enriched OSM extract]
  OSM --> Tiles[Cold tile rebuild]
  Tiles --> Valhalla

  Firestore --> Dashboard[Government dashboard]
```

## Contracts

- The web shell calls typed API functions that currently return shaped mock data.
- FastAPI endpoints return mock responses and expose stub modules for external integration work.
- Valhalla, Firestore, Gemini, Street View, and analytics calls are represented by typed boundaries only.
