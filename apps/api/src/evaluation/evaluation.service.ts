import { Injectable,
ConflictException, 
UnauthorizedException,
NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test, Submission, Question, Choice, Answer } from './evaluation.entity';
import { CreateTestDto, CreateChoiceDto, CreateQuestionDto } from './dto/create-test.dto' 
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
		return this.testRepository.find({relations:["questions"]}) || undefined;
	}
}
