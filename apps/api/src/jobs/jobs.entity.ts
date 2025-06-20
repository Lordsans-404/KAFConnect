import { Entity, PrimaryGeneratedColumn, JoinColumn, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from '../users/users.entity';
import { Test, Submission } from '../evaluation/evaluation.entity';

export enum EmploymentType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship'
}

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  requirements: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  position: string;

  @Column({ type: 'enum', enum: EmploymentType })
  employmentType: EmploymentType;

  @Column()
  location: string;

  @Column({ nullable: true })
  salaryRange: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'postedBy' }) // Matches your current column name
  postedByUser: User; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  postedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closingDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Test)
  @JoinColumn({name: 'testId'})
  testId: Test;

  @OneToMany(() => JobApplication, application => application.job)
  applications: JobApplication[];
}

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  WRITTEN_TEST = 'written_test',
  INTERVIEW = 'interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

@Entity()
export class JobApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Job, job => job.applications)
  job: Job;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'applicant_id' })
  userApplicant: User; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  applicationDate: Date;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.SUBMITTED })
  status: ApplicationStatus;

  @Column({ nullable: true })
  resumePath: string;

  @Column('text', { nullable: true })
  coverLetter: string;

  @Column({nullable:true})
  testExpiredAt: Date;

  @Column({default:false})
  isTestExpired: boolean;

  @Column('text', { nullable: true })
  adminNotes: string;

  @OneToOne(() => Submission, submission => submission.totalScore)
  submissionResult: Submission;
}
