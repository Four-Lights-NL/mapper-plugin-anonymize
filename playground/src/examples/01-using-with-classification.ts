import type { MapperConfig } from '@fourlights/mapper'
import { map } from '@fourlights/mapper'
import AnonymizePlugin, { withClassification } from '@fourlights/mapper-plugin-anonymize'

import { user } from './input'

export default (seed = 69) => {
	// First, we define a MapperConfig for the user object with short-form syntax
	const config: MapperConfig<typeof user, {}> = {
		firstName: (d) => d.firstName,
		lastName: (d) => d.lastName,
		fullName: (d) => `${d.firstName} ${d.lastName}`,
	}

	// Next we use the `withClassification` utility to add classification to some of the properties
	const classifiedConfig = withClassification(config, {
		firstName: 'pii',
		lastName: 'pii',
		fullName: 'pii',
	})

	console.log(map(user, classifiedConfig, { plugins: [new AnonymizePlugin({ seed })] }))
}
