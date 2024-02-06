import * as oracledb from 'oracledb';

export const oracleConnection = async () => {
  try {
    const connection = await oracledb.getConnection({
      user: 'system',
      password: 'abc123',
      connectString: 'localhost:1521/xe',
    });
    return connection;
  } catch (error) {
    console.log('error', error);
  }
};
