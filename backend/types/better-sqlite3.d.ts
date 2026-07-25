declare module 'better-sqlite3' {
  type Statement = {
    all(...params: unknown[]): unknown[]
    get(...params: unknown[]): unknown
    run(...params: unknown[]): { lastInsertRowid: number | bigint; changes: number }
  }

  export default class Database {
    constructor(path: string)
    close(): void
    pragma(source: string): unknown
    prepare(source: string): Statement
    transaction<T extends (...args: never[]) => unknown>(fn: T): T
  }
}
