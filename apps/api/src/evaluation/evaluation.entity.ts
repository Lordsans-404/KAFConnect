import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => User)
  createdBy: User;

  @OneToMany(() => Question, question => question.test, { cascade: true })
  questions: Question[];
}

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @ManyToOne(() => Test, test => test.questions)
  test: Test;

  @OneToMany(() => Choice, choice => choice.question, { cascade: true })
  choices: Choice[];
}

@Entity()
export class Choice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ default: false })
  isCorrect: boolean;

  @ManyToOne(() => Question, question => question.choices)
  question: Question;
}

@Entity()
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Test)
  test: Test;

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => Answer, answer => answer.submission, { cascade: true })
  answers: Answer[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;
  
  @Column({default:0})
  totalScore:number;
}

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Submission, submission => submission.answers)
  submission: Submission;

  @ManyToOne(() => Question)
  question: Question;

  @ManyToOne(() => Choice)
  selectedChoice: Choice;
}
