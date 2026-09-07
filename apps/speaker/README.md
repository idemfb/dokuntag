# DOKUNTAG Speaker

Minimal, offline-first speaker utility for Android/iOS.

## v0.1 scope

- Water Eject: 30-second low-frequency sweep intended to help move trapped water from the speaker grille.
- Speaker Test: short 440 Hz tone.
- Left / Right channel test.
- TR / EN UI.
- No account, ads, analytics, API, or network dependency.

## Product rule

This app intentionally does one job well. Equalizer, music player, sound library, dB meter, cloud sync, subscriptions, and unrelated utilities are out of scope for v0.1.

## Safety / claims

The app does not claim to repair hardware, waterproof a device, or guarantee water removal. Users are told to keep volume at a comfortable level.

## Development

```bash
npm install
npm run dev
npm run build
```

Native shells can be added later with:

```bash
npm run cap:add
npm run cap:sync
```

App ID: `com.dokuntag.speaker`
