import { Injectable,
ConflictException, 
UnauthorizedException,
NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Test, Submission, Question, Choice, Answer } from './evaluation.entity';
import { CreateTestDto, CreateChoiceDto, CreateQuestionDto } from './dto/create-test.dto' 
import { SubmitTestDto, AnswerDto } from './dto/submit-test.dto' 
import { User } from '../users/users.entity'
import { JobApplication } from '../jobs/jobs.entity'


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
		@InjectRepository(JobApplication)
		private readonly jobApplicationRepository: Repository<JobApplication>,
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
	

	// async submitTest(dto: SubmitTestDto): Promise<Submission> {
	//   // Fetch the test entity
	//   const test = await this.testRepository.findOne({ where: { id: dto.test } });
	//   if (!test) throw new NotFoundException('Test not found');

	//   // Fetch the user entity
	//   const user = await this.usersRepository.findOne({ where: { id: dto.user } });
	//   if (!user) throw new NotFoundException('User not found');

	//   // Fetch the job application and ensure it exists
	//   const jobAppliant = await this.jobApplicationRepository.findOne({
	//     where: { id: dto.jobApplicationId },
	//   });
	//   if (!jobAppliant) throw new NotFoundException('Job application not found');

	//   // Create submission object (not saved yet)
	//   const submission = this.submissionRepository.create({
	//     test,
	//     user,
	//     submittedAt: new Date(),
	//     totalScore: 0, // initial score
	//   });

	//   let score = 0;
	//   const answers: Answer[] = [];

	//   // Process each answer
	//   for (const AnswerDto of dto.answers) {
	//     // Fetch question
	//     const question = await this.questionRepository.findOne({
	//       where: { id: AnswerDto.question },
	//     });
	//     if (!question) continue;

	//     // Fetch selected choice
	//     const selectedChoice = await this.choiceRepository.findOne({
	//       where: { id: AnswerDto.selectedChoice },
	//     });
	//     if (!selectedChoice) continue;

	//     // Score if correct
	//     if (selectedChoice.isCorrect) score++;

	//     // Create answer entity
	//     const answer = this.answerRepository.create({
	//       submission, // not saved yet, TypeORM handles relation
	//       question,
	//       selectedChoice,
	//     });

	//     answers.push(answer);
	//   }

	//   // Assign answers and score
	//   submission.answers = answers;
	//   submission.totalScore = score;

	//   // Save submission along with its answers (cascade saves answers)
	//   const savedSubmission = await this.submissionRepository.save(submission);

	//   await this.jobApplicationRepository
	// 	  .createQueryBuilder()
	// 	  .update(JobApplication)
	// 	  .set({ submission: savedSubmission })
	// 	  .where("id = :id", { id: jobAppliant.id })
	// 	  .execute();


	//   // Return the saved submission
	//   return savedSubmission;
	// }

	// This service generated is the "faster" optimization from my previous service
	// it utilize In Query Operator from typeorm
	async submitTest(dto: SubmitTestDto): Promise<Submission> {
	  // Start a transaction for atomic operations
	  return this.submissionRepository.manager.transaction(async (transactionalEntityManager) => {
	    // Fetch all required entities in parallel
	    const [test, user, jobApplication] = await Promise.all([
	      this.testRepository.findOne({ where: { id: dto.test } }),
	      this.usersRepository.findOne({ where: { id: dto.user } }),
	      this.jobApplicationRepository.findOne({ where: { id: dto.jobApplicationId } }),
	    ]);

	    // Validate entities
	    if (!test) throw new NotFoundException('Test not found');
	    if (!user) throw new NotFoundException('User not found');
	    if (!jobApplication) throw new NotFoundException('Job application not found');

	    // Get all question IDs and choice IDs from DTO
	    const questionIds = dto.answers.map(a => a.question);
	    const choiceIds = dto.answers.map(a => a.selectedChoice);

	    // Fetch all questions and choices in two queries
	    const [questions, choices] = await Promise.all([
	      this.questionRepository.find({ where: { id: In(questionIds) } }),
	      this.choiceRepository.find({ where: { id: In(choiceIds) } }),
	    ]);

	    // Create maps for quick lookup
	    const questionMap = new Map(questions.map(q => [q.id, q]));
	    const choiceMap = new Map(choices.map(c => [c.id, c]));

	    let score = 0;
	    const answers: Answer[] = [];

	    // Process answers using the pre-fetched data
	    for (const answerDto of dto.answers) {
	      const question = questionMap.get(answerDto.question);
	      const selectedChoice = choiceMap.get(answerDto.selectedChoice);

	      // Skip if question or choice not found
	      if (!question || !selectedChoice) continue;

	      // Increment score if choice is correct
	      if (selectedChoice.isCorrect) score++;

	      // Create answer entity
	      answers.push(
	        this.answerRepository.create({
	          question,
	          selectedChoice,
	        })
	      );
	    }

	    // Create and save submission
	    const submission = this.submissionRepository.create({
	      test,
	      user,
	      submittedAt: new Date(),
	      totalScore: score,
	      answers,
	    });

	    const savedSubmission = await transactionalEntityManager.save(submission);

	    // Update job application
	    await transactionalEntityManager.update(
	      JobApplication,
	      { id: jobApplication.id },
	      { submission: savedSubmission }
	    );

	    return savedSubmission;
	  });
	}
}
