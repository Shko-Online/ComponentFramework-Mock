/*
	Unless explicitly acquired and licensed from Licensor under another
	license, the contents of this file are subject to the Reciprocal Public
	License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
	and You may not copy or use this file in either source code or executable
	form, except in compliance with the terms and conditions of the RPL.

	All software distributed under the RPL is provided strictly on an "AS
	IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
	LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
	LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
	PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
	language governing rights and limitations under the RPL. 
*/

const path = require("path");

/**  @type {import('ts-jest').InitialOptionsTsJest}  */
module.exports = {
	moduleNameMapper:{
 		'@fluentui/react':'<rootDir>/node_modules/@fluentui/react',
		'@fluentui/date-time-utilities/(.*)': "<rootDir>/node_modules/@fluentui/date-time-utilities/$1"
	},
	preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
      // transform files with ts-jest
      "^.+\\.(jsx?|tsx?)$": ["ts-jest", {
		tsconfig: {
			// allow js in typescript
			allowJs: true,
		},
	},]
    },	
    coveragePathIgnorePatterns : [
      "/node_modules/"
    ],
	testMatch: [ "<rootDir>/__tests__/**/*.[jt]s?(x)", "<rootDir>/?(*.)+(spec|test).[jt]s?(x)" ],
	setupFiles: [path.resolve(path.join(__dirname, 'setup-tests.ts'))],
    coverageReporters: ['cobertura', "text","html"]
}