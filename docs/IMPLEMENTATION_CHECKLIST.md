# Implementation Checklist

Single-developer execution order follows the fallback ladder. Each stage should leave the app bootable before moving down the list.

## 1. City Routable In Valhalla

- [ ] Download the Tijuana OSM extract.
- [ ] Build Valhalla tiles locally.
- [ ] Confirm `/route` can call Valhalla with origin and destination coordinates.
- [ ] Render a baseline pedestrian route on `/map`.

## 2. Features In Priority Zones

- [ ] Seed barriers in Zona Rio, Centro, Otay, and Playas.
- [ ] Read live features by bounding box.
- [ ] Render feature markers with icon, label, and severity.
- [ ] Export live features as GeoJSON.

## 3. Citizen Loop

- [ ] Accept a citizen report with location and kind.
- [ ] Persist the report in the live layer.
- [ ] Push new active barriers into hot route excludes.
- [ ] Show the live reroute toast and refresh the route response.

## 4. Impact Matrix Per Profile

- [ ] Wire `resolve_effect` into route scoring.
- [ ] Convert barrier effects to Valhalla hot excludes and penalties.
- [ ] Convert amenity effects to route incentives.
- [ ] Confirm changing profiles changes the selected route.

## 5. Full Accessibility: Voice, Narrator, Haptics

- [ ] Activate speech recognition commands for profile, route, and report flows.
- [ ] Activate speech synthesis for route steps and screen state.
- [ ] Activate vibration patterns for caution and block states.
- [ ] Validate high contrast, text scaling, focus order, and 48px targets.

## 6. Amenities, Transport, Crossings, Auto Preferences, Offline, Compass

- [ ] Add amenity and crossing scoring to route preferences.
- [ ] Add transport stop and route queries.
- [ ] Detect user display and motion preferences.
- [ ] Cache the offline app shell.
- [ ] Add compass guidance for non-visual navigation.

## 7. City Scan

- [ ] Fetch street-level imagery batches.
- [ ] Classify barriers and amenities with the selected vision backend.
- [ ] Enrich OSM tags from accepted detections.
- [ ] Rebuild Valhalla tiles from enriched data.

## 8. Government Dashboard

- [ ] Aggregate feature density by priority zone.
- [ ] Compute repair prioritization scores.
- [ ] Export GeoJSON and CSV.
- [ ] Prepare a desktop dashboard view for municipal review.
