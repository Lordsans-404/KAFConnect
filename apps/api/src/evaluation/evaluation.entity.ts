import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Job, JobApplication } from '../jobs/jobs.entity';
import { User } from '../users/users.entity';

@Entity()
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => User)
  createdBy: User;

  @Column({ default: 0 }) // Total possible score for the test
  totalScore: number;

  @OneToMany(() => EssayQuestion, question => question.test, { cascade: true })
  questions: EssayQuestion[];
}

@Entity()
export class EssayQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  createdBy: User;

  @Column('text')
  prompt: string; // The essay question text

  @Column({ nullable: true })
  wordLimit: number; // Optional word limit

  @ManyToOne(() => Test, test => test.questions)
  test: Test;
}

@Entity()
export class TestSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Test)
  test: Test;

  @ManyToOne(() => User) // User Yang Menjawab Pertanyaan
  applicant: User;

  @OneToMany(() => EssayAnswer, answer => answer.submission, { cascade: true })
  answers: EssayAnswer[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
}

@Entity()
export class EssayAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  answer: string;

  @Column({ nullable: true })
  score: number;

  @Column('text', { nullable: true })
  feedback: string;

  @ManyToOne(() => EssayQuestion)
  question: EssayQuestion;

  @ManyToOne(() => TestSubmission, submission => submission.answers)
  submission: TestSubmission;
}


// Interview Results
export enum InterviewResult {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  HOLD = 'hold'
}

@Entity()
export class Interview {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JobApplication, application => application.interview)
  application: JobApplication;

  @ManyToOne(() => User)
  interviewer: User;

  @Column({ type: 'timestamp' })
  scheduledTime: Date;

  @Column()
  durationMinutes: number;

  @Column()
  location: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: InterviewResult, default: InterviewResult.PENDING })
  result: InterviewResult;
}