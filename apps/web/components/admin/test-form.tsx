import React, { useState } from 'react';
import { Plus, Trash2, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export function TestCreatorForm({ userId, onSubmit, token, open, onOpenChange }){
  const [formData, setFormData] = useState({
    title: '',
    createdBy: typeof userId === 'number' ? userId : Number(userId || 0),
    questions: [
      {
        text: '',
        choices: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]
  });
  const apiUrl = 'http://localhost:3000/admin/new-test'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const addQuestion = () => {
    if (formData.questions.length < 10) {
      setFormData(prev => ({
        ...prev,
        questions: [
          ...prev.questions,
          {
            text: '',
            choices: [
              { text: '', isCorrect: false },
              { text: '', isCorrect: false }
            ]
          }
        ]
      }));
    }
  };

  const removeQuestion = (questionIndex) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, index) => index !== questionIndex)
      }));
    }
  };

  const updateQuestion = (questionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((question, index) => 
        index === questionIndex ? { ...question, [field]: value } : question
      )
    }));
  };

  const addChoice = (questionIndex) => {
    if (formData.questions[questionIndex].choices.length < 4) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map((question, index) => 
          index === questionIndex 
            ? {
                ...question,
                choices: [...question.choices, { text: '', isCorrect: false }]
              }
            : question
        )
      }));
    }
  };

  const removeChoice = (questionIndex, choiceIndex) => {
    if (formData.questions[questionIndex].choices.length > 2) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map((question, index) => 
          index === questionIndex 
            ? {
                ...question,
                choices: question.choices.filter((_, cIndex) => cIndex !== choiceIndex)
              }
            : question
        )
      }));
    }
  };

  const updateChoice = (questionIndex, choiceIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((question, qIndex) => 
        qIndex === questionIndex 
          ? {
              ...question,
              choices: question.choices.map((choice, cIndex) => 
                cIndex === choiceIndex ? { ...choice, [field]: value } : choice
              )
            }
          : question
      )
    }));
  };

  const setCorrectAnswer = (questionIndex, choiceIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((question, qIndex) => 
        qIndex === questionIndex 
          ? {
              ...question,
              choices: question.choices.map((choice, cIndex) => ({
                ...choice,
                isCorrect: cIndex === choiceIndex
              }))
            }
          : question
      )
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Please enter a test title');
      return false;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      
      if (!question.text.trim()) {
        alert(`Please enter text for question ${i + 1}`);
        return false;
      }

      const hasCorrectAnswer = question.choices.some(choice => choice.isCorrect);
      if (!hasCorrectAnswer) {
        alert(`Please select a correct answer for question ${i + 1}`);
        return false;
      }

      for (let j = 0; j < question.choices.length; j++) {
        if (!question.choices[j].text.trim()) {
          alert(`Please enter text for choice ${j + 1} in question ${i + 1}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      if (onSubmit) {
        await onSubmit(formData);
        setSubmitMessage({ type: 'success', text: 'Test created successfully!' });
        onOpenChange(false);
        alert('Test created successfully!');
      } else {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Test created successfully:', result);

        setSubmitMessage({ type: 'success', text: 'Test created successfully!' });

        // Reset form
        setFormData({
          title: '',
          createdBy: userId || '',
          questions: [
            {
              text: '',
              choices: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
              ]
            }
          ]
        });
        setActiveQuestion(0);

        onOpenChange(false);
        alert('Test created successfully!');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      setSubmitMessage({
        type: 'error',
        text: error.message || 'Error creating test. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add New Test</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-white-800 mb-6">Create New Test</h2>
          
          <div className="space-y-6">
            {/* Success/Error Message */}
            {submitMessage.text && (
              <div className={`p-3 rounded-md text-sm ${
                submitMessage.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {submitMessage.text}
              </div>
            )}

            {/* Test Title */}
            <div>
              <label className="block text-sm font-medium text-white-700 mb-2">
                Test Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter test title"
                required
              />
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white-700">
                  Questions ({formData.questions.length}/10)
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={formData.questions.length >= 10}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </button>
              </div>

              {formData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-medium text-white-700">
                      Question {questionIndex + 1}
                    </h4>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter question text"
                      rows="3"
                      required
                    />
                  </div>

                  {/* Choices */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white-600">
                        Choices ({question.choices.length}/4)
                      </span>
                      <button
                        type="button"
                        onClick={() => addChoice(questionIndex)}
                        disabled={question.choices.length >= 4}
                        className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                      >
                        Add Choice
                      </button>
                    </div>

                    {question.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setCorrectAnswer(questionIndex, choiceIndex)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            choice.isCorrect
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {choice.isCorrect && <Check className="w-4 h-4" />}
                        </button>
                        
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) => updateChoice(questionIndex, choiceIndex, 'text', e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Choice ${choiceIndex + 1}`}
                          required
                        />
                        
                        {question.choices.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeChoice(questionIndex, choiceIndex)}
                            className="flex-shrink-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Submit Button - Fixed at bottom */}
        <div className="flex-shrink-0 flex justify-end p-6 pt-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Test...' : 'Create Test'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
