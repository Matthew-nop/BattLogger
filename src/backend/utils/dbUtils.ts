import * as sqlite3 from 'sqlite3';

export const stmtRunAsync = (stmt: sqlite3.Statement, params: any[] = []): Promise<sqlite3.RunResult> => {
  return new Promise((resolve, reject) => {
    stmt.run(params, function(this: sqlite3.RunResult, err: Error | null) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};