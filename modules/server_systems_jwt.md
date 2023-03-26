---
title: Athena.systems.jwt
outline: [1,3]
order: 0
---

# {{ $frontmatter.title }}


## Functions

### create

::: Tip
Athena.systems.jwt.**create**(`account`): `Promise`<`undefined` \| `string`\>
:::

Creates a JWT token with basic account id inside of it.

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | [`Account`](../interfaces/server_interface_iAccount_Account.md) |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[server/systems/jwt.ts:60](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/systems/jwt.ts#L60)

___

### fetch

::: Tip
Athena.systems.jwt.**fetch**(`player`): `Promise`<`string` \| ``null``\>
:::

#### Parameters

| Name | Type |
| :------ | :------ |
| `player` | `Player` |

#### Returns

`Promise`<`string` \| ``null``\>

#### Defined in

[server/systems/jwt.ts:103](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/systems/jwt.ts#L103)

___

### override

::: Tip
Athena.systems.jwt.**override**(`functionName`, `callback`): `any`
:::

Used to override jwt functions.

**`Export`**

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"create"`` |
| `callback` | (`account`: [`Account`](../interfaces/server_interface_iAccount_Account.md)) => `Promise`<`undefined` \| `string`\> |

#### Returns

`any`

#### Defined in

[server/systems/jwt.ts:159](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/systems/jwt.ts#L159)

::: Tip
Athena.systems.jwt.**override**(`functionName`, `callback`): `any`
:::

Used to override jwt functions.

**`Export`**

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"verify"`` |
| `callback` | (`data`: `string`) => `Promise`<`string` \| `undefined`\> |

#### Returns

`any`

#### Defined in

[server/systems/jwt.ts:160](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/systems/jwt.ts#L160)

::: Tip
Athena.systems.jwt.**override**(`functionName`, `callback`): `any`
:::

Used to override jwt functions.

**`Export`**

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"fetch"`` |
| `callback` | (`player`: `Player`) => `Promise`<`string` \| ``null``\> |

#### Returns

`any`

#### Defined in

[server/systems/jwt.ts:161](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/systems/jwt.ts#L161)

___

### verify

::: Tip
Athena.systems.jwt.**verify**(`data`): `Promise`<`string` \| `undefined`\>
:::

Verifies a compact JWT string is valid.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` |

#### Returns

`Promise`<`string` \| `undefined`\>

#### Defined in

[server/systems/jwt.ts:85](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/systems/jwt.ts#L85)