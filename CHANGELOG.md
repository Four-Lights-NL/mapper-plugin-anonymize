

## [1.4.1](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/compare/v1.4.0...v1.4.1) (2024-05-13)


### Features

* allow specifying faker locale when using plugin ([803fcfa](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/803fcfa2e9a13933a3c06cc7f1f461c0c06eb193))

## [1.4.0](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/compare/v1.3.0...v1.4.0) (2024-05-13)


### Features

* allow specifying faker value function ([9a6f936](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/9a6f936d35aa9b206f8e5c8bf8db06311b67df68))

## [1.3.0](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/compare/v1.2.0...v1.3.0) (2024-04-22)


### Features

* add `birthdate` to faker ([bebb00d](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/bebb00dcec253f59d3ed3d5489aac8b78afa0fbf))
* target `@fourlights/mapper` v`1.3.0` ([3b45025](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/3b45025c710b58d30264abbdda9b3a972e121036))

## [1.2.0](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/compare/v1.1.0...v1.2.0) (2024-04-21)


### Features

* add helper `map` function to quickly use the plugin ([fcb2d77](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/fcb2d773cd1c945f205354a3723995599239d0c4))
* handle inline data taxonomy when using `withClassification` ([91f6ac0](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/91f6ac09abe6068d7af439c2bae125342d4a4b32))
* update `@fourlights/mapper` to `1.2.0` ([389f26b](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/389f26be1f1b4185495a6d42be7f9b3e59dacec4))

## [1.1.0](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/compare/v1.0.1...v1.1.0) (2024-04-12)


### Features

* add `traverse` option to allow applying anonymization to objects ([129b168](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/129b168b53befe05ee6cb422c02a2403650bea67))


### Bug Fixes

* export `withClassification` from top-level ([0ec3b7a](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/0ec3b7a2a7b29e26637d82c709b255d1de02c355))
* rename ambiguous exported types ([9d916b6](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/9d916b6fd137db8e8f1eb4240ea79d4e6faf6b19))

## [1.0.1](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/compare/v1.0.0...v1.0.1) (2024-04-11)


### Features

* add `withClassification` for easier usage with existing mapper configs ([2894135](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/2894135a52ba6a4301bfc92207165a0bf1fb3498))
* allow using string values as seed ([00cb609](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/00cb6097da456c0ab55d5ed136760cd218cfb88a))


### Bug Fixes

* prevent fuzzy matching from matching very short keys ([bd96d39](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/bd96d39323709f7f072841261c93ed5a362090ea))

## 1.0.0 (2024-04-11)


### Features

* add configuration for anonymization methods ([0c101ca](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/0c101ca65670a4f37450aeb735605c941780908d))
* implement anonymize plugin ([09a5938](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/09a59382ec0398f8d60121fb898669b4dcf01f41))
* use `fuzzysort` instead of `fuse.js` ([a955dd5](https://github.com/Four-Lights-NL/mapper-plugin-anonymize/commit/a955dd5d4033eccf15bcc8c6800ced47f2b5742a))
