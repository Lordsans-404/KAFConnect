import { Entity, PrimaryGeneratedColumn, Column, Unique, AfterUpdate, BeforeUpdate } from 'typeorm';

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
  
  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifyToken: string;

  @Column({ nullable: true })
  verificationTokenExpires: Date;

  @BeforeUpdate() // Tambahkan Expire Date Jika User Sudah Diverifikasi
  updateExpire(){
    this.verificationTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}