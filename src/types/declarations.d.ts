// 为 better-sqlite3 和 jsonwebtoken 提供简易类型声明
// better-sqlite3 是原生模块，无官方 @types 包

declare module "better-sqlite3" {
  interface Statement {
    run(...params: any[]): { changes: number; lastInsertRowid: number };
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  interface Database {
    prepare(sql: string): Statement;
    pragma(sql: string): any;
    exec(sql: string): void;
    close(): void;
    defaultSafeIntegers(): void;
  }

  const Database: new (path: string, options?: { verbose?: (sql: string) => void }) => Database;
  export default Database;
}

declare module "jsonwebtoken" {
  export function sign(payload: any, secret: string, options?: { expiresIn: string }): string;
  export function verify(token: string, secret: string): any;
  export function decode(token: string): any;
}
