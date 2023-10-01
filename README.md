# ComponentFramework Mock ![NPM Downloads](https://img.shields.io/npm/dt/@shko.online%2Fcomponentframework-mock)
This library mocks the entire ComponentFramework library and enables users to write tests and stories for their PCF components.

Explore the endless possibilities in the following Storybook [https://main--64b05f276a7d4d8ef73a9dd8.chromatic.com/](https://main--64b05f276a7d4d8ef73a9dd8.chromatic.com/)
![ComponentFramework-Mock Storybook](https://github.com/Shko-Online/ComponentFramework-Mock/assets/11160171/04fa5e16-c43e-40bd-aa0f-c6683f99a2e5)


# Quick Start
First step is to add our package as a development dependency on your project. 

`* Examples will reference the OwnerLookup control in this repository.`

`npm`
```cmd
npm install -D @shko.online/componentframework-mock
```

`yarn`
```cmd
yarn add -D @shko.online/componentframework-mock
```

In your test or story you should import your component and `IInputs`, `IOutputs`. ex:

```typescript
import { OwnerLookup } from '../__sample-components__/OwnerLookup';
import { IInputs, IOutputs } from '../__sample-components__/OwnerLookup/generated/ManifestTypes';
```

Also you should import `ComponentFrameworkMockGenerator` or `ComponentFrameworkMockGeneratorReact` and the necessary property mocks.

```typescript
import { ComponentFrameworkMockGenerator, LookupPropertyMock } from '@shko.online/componentframework-mock';
```

The first parameter to the generator is your component, and the second parameter is the mapping between your component parameters and the propery mock. The third parameter is required only for `ComponentFrameworkMockGenerator`, because the virtual components return a ReactElement and don't use the container element. You should create an instance of the generator in your code like this:
```typescript
let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs> = new ComponentFrameworkMockGenerator(
    OwnerLookup,
    {
        value: LookupPropertyMock,
    },
    container,
);
```

You can initialize/bind the state of the in-memory database using the following method:

```typescript
mockGenerator.context._SetCanvasItems({
    value: {
        entityType: 'team',
        id: 'guid1',
        name: 'Shko Online',
    },
});
```

You should call excatly once `ExecuteInit` and at least once `ExecuteUpdate` which control the system updates:

```typescript
mockGenerator.ExecuteInit();
mockGenerator.ExecuteUpdateView();
```

`*` Check our sample tests in the ComponentFramework-Mock/\_\_tests\_\_/Components folder for more details and inspiration.

`*` Also check https://github.com/Shko-Online/ComponentFramework-Mock-Tests and https://github.com/Shko-Online/ComponentFramework-Mock-React-Tests for tests and stories written against PowerApps samples and PowerCAT code components.

## UPDATE 2022-12-17!
We are changing the license of this library from `RPL-1.5` to `MIT` to boost adoption. The owners of the license are Betim Beja and Shko Online LLC. If you want to help with the development of this library and all the other Open Source products by Betim Beja (under the brand AlbanianXrm) and Shko Online LLC you can buy consulting services by contacting us at sales[@](https://shko.online/contact-us)shko.online

## Contributing
Contributions are welcome. Before contributing please check that you don't violate any IP, and consider that your contribution will be public, but you would be transfering ownership of the code to us.

## Code of Conduct
We welcome friendly contributors. Being a library that improves a Microsoft product, we have chosen to follow the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
