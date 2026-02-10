# Changelog

## [Unreleased]

## [1.3.0] - 2026-02-10

### Fixed

- Fix an issue where Breached Defenses was showing all resistances instead of just the highest bypassable
- Fix an issue where Tome implement skill preparation was not working properly
- Fix Thaumaturge Dedication check (@xyzzy42)
- Fix issue with null sourceId and Sympathetic Vulnerabilities (@xyzzy42)

### Changed

- Minimum PF2e System Version is 7.6.0
- Stop using jquery in tome render chat message hook (@xyzzy42)

## [1.2.3] - 2025-11-25

### Fixed

- Change class detection to work with translation modules better (@xyzzy42)

### Added

- French localizations (@RadicalBlue)

## [1.2.2] - 2025-09-21

### Fixed

- Address several v13 deprecation warnings.

## [1.2.1] - 2025-09-09

### Fixed

- Fixed several lingering core.sourceId flags that were causing mayhem (@xyzzy42)

## [1.2.0] - 2025-08-29

### Added

- Add additional localization strings (@Cuingamehtar)
- Add Esoteric Lore localization setting (@Cuingamehtar)

### Fixed

- Only send regalia reminders if at least one actor is frightened (@maplealmond)

### Changed

= Use the new custom weakness in the system for Personal Antithesis (@xyzzy42)

## [1.1.0] - 2025-07-16

### Added

- Added Divine Disharmony action (@xyzzy42)

### Fixed

- Allow implement assignment to work with localized implements (@Cuingamehtar)

### Changed

- Various localization updates

## [1.0.0] - 2025-06-03

### Changed

- Foundry VTT v13/PF2e v7.1.0 only support
- Add buttons to apply tome adept Recall Knowledge bonus to other Recall Knowledge rolls - @xyzzy42

### Fixed

- Cleanup and bug fixes around the process for deleting EV effects when EV ends - @xyzzy42
- Remove roll options for tome skill selection - @xyzzy42
- Only apply Twin Weakness to the EV target - @xyzzy42

## [1.0.0-alpha1] - 2025-05-04

### Changed

- Foundry VTT v13/PF2e v7.0.0+ only support

### Fixed

- Error in Ephemeral Effects caused Exploit Vulnerability's special resource to not be used, this was fixed by adding alterations: []

## [0.20.2] - 2025-05-01

### Changed

- Removed error logging that was a little too verbose for unlinked tokens. This is sometimes intentional and the level of logging made the console a little too chatty. The module now silently continues without warning you of issues with your scene.

## [0.20.1] - 2025-04-30

### Fixed

- Added additional error checking for implements that weren't managed (they would silently throw errors).
- Added error checking for potential corrupted tokens/actors on a scene.
- Added error checking for the strange scenario where socketlib or libwrapper get turned off, but PF2e Exploit Vulnerability does not.

## [0.20.0] - 2025-04-03

### Added

- Allow "Reroll using Hero Point" on Exploit Vulnerability macro

## [0.19.4] - 2025-02-26

### Fixed

- Missed changing when flags were set for Personal Antithesis in 0.19.4, fixed this.

## [0.19.3] - 2025-02-25

### Fixed

- Changed when flags are set for the different EV modes so that the EV Target effect is set properly.
- Fixed an issue where exact same MW targets wouldn't get MW effect

## [0.19.2] - 2025-02-18

### Changed

- Replaced every instance of the mention of "Glimpse Weakness" with "Glimpse Vulnerability"

## [0.19.1] - 2025-02-18

### Fixed

- A number of issues with Thaumaturge Dedication getting implement benefits without Implement Initiate feat

## [0.19.0] - 2025-02-18

### Added

- Thaumaturge Archetype
- PL Translations

### Changed

- Updated the checks.yml github workflow
- Start following SemVer properly

## [0.18.2] - 2025-02-15

### Fixed

- Issue with beneficiaries of Share Weakness not properly updating weaknesses
- Issue with EV Dialog providing too much information on success

### Added

- Handling versatile vials for alchemists who benefit from Share Weakness
- Automated Foundry VTT package deployment
- Automated changelog management

### Security

- Removed/replaced a number of deprecated NPM packages
