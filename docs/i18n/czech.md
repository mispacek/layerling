# Czech interface translation

The Czech catalogue is `apps/web/src/lib/messages.cs.ts`. It is a complete
`Record<MessageKey, string>` alongside English and German. The language code
is `cs` (BCP 47 `cs-CZ`); `cz` is a country code, not a language code.
The language switch, browser detection, persisted preference and HTML `lang`
attribute use the same path as the other languages.

## CAD terminology

| Source term | Czech | Meaning in layerling |
| --- | --- | --- |
| Workplane | Pracovní rovina | Plane for placement and sketching; distinct from the print plate. |
| Build plate | Tisková podložka | Printer's physical build area. |
| Sketch | Náčrt | Editable 2D profile, not a rough preview of the finished body. |
| Group | Sloučit | Builds combined geometry and subtracts cutting bodies. |
| Bundle | Seskupit | Holds independent bodies together and retains colours. |
| Hole | Výřez / odečítací těleso | Negative geometry used for subtraction; an actual bore is an otvor. |
| Fillet / chamfer | Zaoblení / zkosení | Distinct rounded and planar edge treatments. |
| Hollow | Vytvořit dutinu | Keeps the exterior and creates inward walls. |
| Loft | Propojení profilů | Connects bottom and top profiles. |
| Extrude / revolve | Vysunout / rotovat profil | Different ways of building a body from a sketch. |
| Mesh | Polygonová síť | Triangulated representation, distinct from exact CAD geometry. |
| Gear pressure angle | Úhel záběru | Tooth contact geometry, not air or material pressure. |
| Gear backlash | Boční vůle | Clearance between mating teeth. |
| Thread pitch | Rozteč | Distance between neighbouring thread turns. |
| Counterbore / countersink | Válcové / kuželové zahloubení | Seats for different screw heads. |
| Bent tube roll | Natočení roviny ohybu | Orientation of the next bend about the current tube axis. |

Plural-count messages use wording such as `Počet tvarů: {count}` where one
English plural key covers all Czech plural forms. Tokens, axes, keyboard
shortcuts, standards, file extensions and stored identifiers are retained.
Previously saved user names are not renamed on language changes.

All bundled release highlights in `whatsNew.json` also have Czech text.
Network previews from older upstream versions without Czech fall back to
English. The full illustrated manual, README, external support pages and
third-party videos currently retain their existing English/German editions;
the in-app welcome guide, quick guide and shortcut reference are Czech.

## Checks

Use Node.js 24 for the current dependencies:

```text
npm run typecheck
npm test -- tests/unit/i18n.test.ts tests/unit/userErrors.test.ts tests/unit/guide.test.ts tests/unit/whatsNew.test.ts tests/unit/newVersionWatch.test.ts
npm run export
```

Check the dashboard, editor, shape library, properties, sketch mode, quick
guide, shortcuts and settings with CS selected. Reload to verify persistence,
then switch back to English and German. New keys must be added to all catalogues;
the tests verify key coverage and interpolation tokens.
