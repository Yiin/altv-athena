---
title: Athena.controllers.itemDrops
outline: [1,3]
order: 0
---

# {{ $frontmatter.title }}


## Functions

### append

::: Tip
Athena.controllers.itemDrops.**append**(`itemDrop`): `string`
:::

Append item drop information to the server.

Do not use this for creating item drops the players can pickup.

These are mostly visual. Refer to `Athena.systems.inventory.drops` to make actual item drops.

Returns a uid or generates one if not specified.

#### Parameters

| Name | Type |
| :------ | :------ |
| `itemDrop` | `ItemDrop` |

#### Returns

`string`

#### Defined in

[server/controllers/itemDrops.ts:37](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/controllers/itemDrops.ts#L37)

___

### override

::: Tip
Athena.controllers.itemDrops.**override**(`functionName`, `callback`): `any`
:::

Used to override any item drop streamer functionality.

**`Export`**

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"append"`` |
| `callback` | (`itemDrop`: `ItemDrop`) => `string` |

#### Returns

`any`

#### Defined in

[server/controllers/itemDrops.ts:74](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/controllers/itemDrops.ts#L74)

::: Tip
Athena.controllers.itemDrops.**override**(`functionName`, `callback`): `any`
:::

Used to override any item drop streamer functionality.

**`Export`**

#### Parameters

| Name | Type |
| :------ | :------ |
| `functionName` | ``"remove"`` |
| `callback` | (`id`: `string`) => `boolean` |

#### Returns

`any`

#### Defined in

[server/controllers/itemDrops.ts:75](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/controllers/itemDrops.ts#L75)

___

### remove

::: Tip
Athena.controllers.itemDrops.**remove**(`id`): `boolean`
:::

Removes an item drop in-world.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`boolean`

#### Defined in

[server/controllers/itemDrops.ts:53](https://github.com/Stuyk/altv-athena/blob/6013452/src/core/server/controllers/itemDrops.ts#L53)