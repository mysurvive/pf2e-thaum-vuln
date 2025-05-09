# Changelog

## [Unreleased]

## [0.20.3] - 2025-05-09

### Fixed

- Fixed an issue where the regalia implement wouldn't grant the correct bonus at legendary proficiency.

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
