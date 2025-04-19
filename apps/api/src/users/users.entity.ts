import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

export enum UserLevel {
  BASIC = 'basic',
  ADMIN = 'admin',
  STAFF = 'staff',
  SUPER_ADMIN = 'super_admin',
}

@Entity()
@Unique(['email']) // Ensure email is unique
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserLevel,
    default: UserLevel.BASIC,
  })
  level: UserLevel;
}