import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { oracleConnection } from 'src/connection/oracleConnection';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    const connection = await oracleConnection();
    const { firstName, lastName, email, password } = createUserDto;
    console.log('createUserDto', createUserDto);
    try {
      const result = await connection.execute(
        'INSERT INTO users (first_name, last_name, email, password) VALUES (:firstName, :lastName, :email, :password)',
        { firstName, lastName, email, password },
        {
          autoCommit: true,
        },
      );
      return {
        message: `The user add to db`,
        rowsAffected: result.rowsAffected,
      };
    } catch (error) {
      console.log('error', error);
    }
  }

  async findAll() {
    const connection = await oracleConnection();
    try {
      const result = await connection.execute('SELECT * FROM users', [], {
        outFormat: 4002,
      });
      return result.rows;
    } catch (error) {
      console.log('error', error);
    }
  }

  async findOne(id: number) {
    const connection = await oracleConnection();
    try {
      const result = await connection.execute(
        'SELECT * FROM users WHERE id = :id',
        [id],
        {
          outFormat: 4002,
        },
      );
      if (result.rows.length) {
        return result.rows[0];
      }
      throw new NotFoundException(`User with id ${id} not found`);
    } catch (error) {
      return { message: `Error: ${error}` };
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    this.findOne(id);
    const connection = await oracleConnection();
    try {
      let query = 'UPDATE users SET ';

      for (const [key, value] of Object.entries(updateUserDto)) {
        if (value !== undefined) {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          query += `${dbKey} = :${key}, `;
        }
      }
      query += 'update_date = CURRENT_TIMESTAMP, ';
      query = query.slice(0, -2); // Remove the last comma and space
      query += ' WHERE id = :id';
      const result = await connection.execute(
        query,
        { ...updateUserDto, id },
        {
          autoCommit: true,
        },
      );
      return {
        message: `The user with id ${id} has been updated`,
        rowsAffected: result.rowsAffected,
      };
    } catch (error) {
      return { message: `Error: ${error}` };
    }
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    this.findOne(id);
    const connection = await oracleConnection();
    try {
      const result = await connection.execute(
        'DELETE FROM users WHERE id = :id',
        [id],
        {
          autoCommit: true,
        },
      );
      return {
        message: `The user with id ${id} has been deleted`,
        rowsAffected: result.rowsAffected,
      };
    } catch (error) {
      return { message: `Error: ${error}` };
    }
  }
}
