import { Injectable,
ConflictException, 
UnauthorizedException,
NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test, Submission, Question, Choice, Answer } from './evaluation.entity';
import { CreateTestDto, CreateChoiceDto, CreateQuestionDto } from './dto/create-test.dto' 
import { SubmitTestDto, AnswerDto } from './dto/submit-test.dto' 
import { User } from '../users/users.entity'


@Injectable()
export class EvaluationService {
	constructor(
		@InjectRepository(Test)
		private readonly testRepository: Repository<Test>,
		@InjectRepository(Submission)
		private readonly submissionRepository: Repository<Submission>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(Choice)
		private readonly choiceRepository: Repository<Choice>,
		@InjectRepository(Answer)
		private readonly answerRepository: Repository<Answer>,
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
		){}

	// Membuat Test untuk kandidat
	async createTest(dto: CreateTestDto): Promise<Test> {
		try {
			const test = this.testRepository.create({
				title: dto.title,
				createdBy: this.usersRepository.create({ id: dto.createdBy }),
				questions: dto.questions.map(q => ({
					text: q.text,
					choices: q.choices.map(c => ({
						text: c.text,
						isCorrect: c.isCorrect,
					})),
				})),
			});
			return await this.testRepository.save(test);
		} catch (error) {
			console.error('Error creating test:', error);
			throw error;
		}
	}

	async getAllTests(){
		return this.testRepository.find({relations:["questions", "questions.choices"]}) || undefined;
	}

	async getTestById(id: number): Promise<Test>{ 
		const test = await this.testRepository.findOne({
			where: {id},
			relations:['questions', 'questions.choices']
		})

		if(!test){
			throw new NotFoundException("The test is not found")
		}
		return test;
	}

	async isSubmitted(userId: number, testId: number){
	  const submission = await this.submissionRepository.findOne({
	    where: { user: { id: userId }, test: {id: testId} },
	    relations: ['user','test'], // opsional, kalau kamu butuh detail user-nya
	  })

	  // if (!submission) throw new NotFoundException('Submission not found');
	  return submission || undefined;
	}


  async submitTest(dto: SubmitTestDto): Promise<Submission> {
    const test = await this.testRepository.findOne({ where: { id: dto.test } });
    if (!test) throw new NotFoundException('Test not found');

    const user = await this.usersRepository.findOne({ where: { id: dto.user } });
    if (!user) throw new NotFoundException('User not found');

    // Create submission
    const submission = this.submissionRepository.create({
      test,
      user,
      submittedAt: new Date(),
      totalScore: 0, // sementara
    });
    await this.submissionRepository.save(submission);

    let score = 0;
    const answers: Answer[] = [];

    for (const AnswerDto of dto.answers) {
      const question = await this.questionRepository.findOne({ where: { id: AnswerDto.question } });
      if (!question) continue;

      const selectedChoice = await this.choiceRepository.findOne({ where: { id: AnswerDto.selectedChoice } });
      if (!selectedChoice) continue;

      if (selectedChoice.isCorrect) score++;

      const answer = this.answerRepository.create({
        submission,
        question,
        selectedChoice,
      });
      answers.push(answer);
    }

    await this.answerRepository.save(answers);

    submission.totalScore = score;
    await this.submissionRepository.save(submission);

    return submission;
  }


}
