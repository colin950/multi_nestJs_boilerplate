import { InternalServerErrorException } from '@nestjs/common'
import { Err } from '../errors/err'
import { EntityManager, EntityTarget } from 'typeorm'

export type FindOneAndUpdateOption = {
  increase?: Record<string, number>
  customFilter?: string
  customSet?: string
  insertOrder: string[]
}

export interface FindOneAndUpdateParams<Entity> {
  entity: EntityTarget<Entity>
  manager: EntityManager
  filter: (keyof Entity)[]
  updateColumns: Partial<Entity>
  insertValues: Partial<Entity>
  options?: {
    increase?: Record<string, number> // 추가됨
    customSet?: string
    customFilter?: string
  }
}

export function jsonb<T>(input: any): T {
  return JSON.stringify(input) as unknown as T
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function transformToSnakeCase(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      acc[camelToSnake(key)] = value
      return acc
    },
    {} as Record<string, any>,
  )
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

function transformToCamelCase<T>(obj: Record<string, any>): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [snakeToCamel(key), val]),
  ) as T
}

export async function findOneAndUpdate<Entity>({
  entity,
  manager,
  filter,
  updateColumns,
  insertValues,
  options,
}: FindOneAndUpdateParams<Entity>): Promise<Entity | null> {
  const tableName = manager.getRepository(entity).metadata.tableName

  const snakeInsertValues = transformToSnakeCase(insertValues)
  const snakeUpdateValues = transformToSnakeCase(updateColumns)

  // ✅ filter는 insertValues에서 직접 WHERE에 대입
  const whereClause = filter
    .map((col) => {
      const key = camelToSnake(String(col))
      const value = snakeInsertValues[key]
      if (value === undefined) {
        throw new Error(
          `Missing filter column "${String(col)}" in insertValues`,
        )
      }
      return `"${key}" = '${value}'`
    })
    .join(' AND ')

  // ✅ update SET
  const updateKeys = Object.keys(snakeUpdateValues)
  const updateValues = updateKeys.map((key) => snakeUpdateValues[key])
  const updateSet = updateKeys.map((key, idx) => `"${key}" = $${idx + 1}`)

  if (options?.increase) {
    for (const [col, val] of Object.entries(options.increase)) {
      updateSet.push(`"${camelToSnake(col)}" = "${camelToSnake(col)}" + ${val}`)
    }
  }

  if (updateSet.length === 0 && !options?.customSet) {
    throw new InternalServerErrorException(Err.EmptyUpdate)
  }

  // ✅ insert용
  const entries = Object.entries(snakeInsertValues)
  const insertCols = entries.map(([key]) => `"${key}"`).join(', ')
  const insertParams = entries
    .map((_, i) => `$${updateValues.length + i + 1}`)
    .join(', ')
  const insertValuesList = entries.map(([, val]) => val)

  const query = `
    WITH updated AS (
      UPDATE "${tableName}"
      SET ${options?.customSet ?? updateSet.join(', ')}
      WHERE ${options?.customFilter ?? whereClause}
      RETURNING *
    ),
    inserted AS (
      INSERT INTO "${tableName}" (${insertCols})
      SELECT ${insertParams}
      WHERE NOT EXISTS (SELECT 1 FROM updated)
      RETURNING *
    )
    SELECT * FROM updated
    UNION ALL
    SELECT * FROM inserted
    LIMIT 1;
  `

  const params = [...updateValues, ...insertValuesList]
  // console.log(query, params)

  try {
    const result = await manager.query(query, params)
    if (!result) {
      return null
    }

    return transformToCamelCase<Entity>(result[0])
  } catch (err) {
    const text = err?.toString()
    if (text?.includes('duplicate')) {
      // retry one more
      const result = await manager.query(query, params)
      if (!result) {
        return null
      }

      return transformToCamelCase<Entity>(result[0])
    } else {
      throw err
    }
  }
}

export async function findOneOrInsert<Entity>(
  entity: new () => Entity,
  manager: EntityManager,
  filter: string[],
  values: Record<string, any>,
  customFilter?: string,
): Promise<Partial<Entity> | null> {
  const tableName = manager.getRepository(entity).metadata.tableName

  const whereClause = filter
    .map((col, i) => `"${col}" = $${i + 1}`)
    .join(' AND ')
  const whereValues = filter.map((col) => values[col])

  const insertKeys = Object.keys(values)
  const insertCols = insertKeys.map((k) => `"${k}"`).join(', ')
  const insertParams = insertKeys
    .map((_, i) => `$${whereValues.length + i + 1}`)
    .join(', ')
  const insertValues = insertKeys.map((k) => values[k])

  const query = `
    WITH existing AS (
      SELECT * FROM "${tableName}"
      WHERE ${customFilter ? customFilter : whereClause}
      LIMIT 1
    ),
    inserted AS (
      INSERT INTO "${tableName}" (${insertCols})
      SELECT ${insertParams}
      WHERE NOT EXISTS (SELECT 1 FROM existing)
      RETURNING *
    )
    SELECT * FROM existing
    UNION ALL
    SELECT * FROM inserted
    LIMIT 1;
  `

  const result = await manager.query(query, [...whereValues, ...insertValues])
  if (!result) {
    return undefined
  }

  const repo = manager.getRepository(entity)
  return repo.create(result[0])[0]
}

export async function deleteWhere<Entity>(
  entity: new () => Entity,
  manager: EntityManager,
  whereRawSql: string,
): Promise<void> {
  await manager
    .createQueryBuilder()
    .delete()
    .from(entity)
    .where(whereRawSql)
    .execute()
}
