import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, Unique, AfterUpdate, BeforeUpdate, OneToOne } from 'typeorm';

export enum UserLevel {
  BASIC = 'basic',
  ADMIN = 'admin',
  STAFF = 'staff',
  SUPER_ADMIN = 'super_admin',
}

@Entity("users")
@Unique(['email']) // Ensure email is unique
export class User {
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

@Entity('user_profiles')
@Unique(['idCardNumber','user'])
export class UserProfile {
  @PrimaryGeneratedColumn()
  profile_id: number;

  @OneToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user: User;

  @Column({length: 15})
  phoneNumber: string;

  @Column({length: 16})
  idCardNumber: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  stateProvince: string;

  @Column({ length: 5, nullable: true})
  postalCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bio: string;

}