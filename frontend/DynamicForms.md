# AI-Powered Dynamic Forms: Hybrid Approach Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Data Structure Specification](#data-structure-specification)
4. [Component Library Design](#component-library-design)
5. [AI Configuration & Prompting](#ai-configuration--prompting)
6. [Implementation Examples](#implementation-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Extending the System](#extending-the-system)

---

## Architecture Overview

### The Hybrid Model

The hybrid approach separates **concerns** into three layers:

```
┌─────────────────────────────────────────────┐
│           User Input Layer                  │
│  (User describes what they're creating)     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         AI Generation Layer                 │
│  • Generates question structure             │
│  • Creates option configurations            │
│  • Returns JSON data only                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│       Component Rendering Layer             │
│  • Pre-built React components               │
│  • Maps AI data to components               │
│  • Enforces design system                   │
└─────────────────────────────────────────────┘
```

### Key Principles

1. **AI generates data, not code** - Security and predictability
2. **Components are pre-built** - Consistency and testing
3. **Configuration is flexible** - AI creativity within bounds
4. **Design system is enforced** - Brand consistency
5. **Type safety matters** - Prevent runtime errors

---

## Core Concepts

### Component Types

Each component type represents a different interaction pattern:

| Type | Purpose | User Input | Example Use Case |
|------|---------|------------|------------------|
| `image-choice` | Select from visual options | Single/multi select | Style preferences, mood selection |
| `free-text` | Open-ended response | Text input | Describing target audience, goals |
| `color-palette` | Choose color schemes | Color selection | Brand color direction |
| `scale-rating` | Rate on spectrum | Slider/scale | Intensity preferences (minimal ↔ bold) |
| `multi-select` | Choose multiple options | Checkboxes | Season, Time of Day, Features |
| `single-choice` | Pick one option | Radio buttons | Style leaning, category selection |
| `hybrid-select` | Select + custom detail | Options + Text | Location (Outdoors + Details) |
| `image-upload` | User provides reference | File upload | Inspiration images |
| `text-with-images` | Text + supporting visuals | Text + interaction | Contextual explanations |

### Style Guide Object

The style guide acts as the "contract" between AI and your components:

```typescript
interface StyleGuide {
  // Available component types
  componentTypes: string[];
  
  // Design constraints
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string[];
    text: { primary: string; secondary: string; };
    error: string;
    warning: string;
  };
  
  // Layout options AI can choose
  layoutOptions: ('grid' | 'stack' | 'carousel' | 'masonry')[];
  
  // Configurable parameters
  constraints: {
    maxOptions: number;
    minOptions: number;
    gridColumns: number[];
    imageAspectRatios: string[];
    'free-text': { maxLength: number; debounceMs: number; };
    'scale-rating': { defaultMin: number; defaultMax: number; };
    'multi-select': { minSelections: number; maxSelections: number; };
  };
  
  // Tone and personality
  voice: {
    tone: string;
    personality: string;
    language: 'formal' | 'casual' | 'playful' | 'professional';
  };
}
```

---

## Data Structure Specification

### Question Schema

Every AI-generated question follows this schema:

```typescript
interface Question {
  // Required fields
  id: string;                    // Unique identifier
  type: ComponentType;           // Which component to use
  question: string;              // The question text
  
  // Optional configuration
  subtext?: string;              // Supporting help text below question
  layout?: 'grid' | 'stack' | 'carousel' | 'masonry';
  columns?: number;              // For grid layouts
  required?: boolean;            // Is answer mandatory?
  
  // Type-specific options
  options?: Option[];            // For choice-based questions
  config?: QuestionConfig;       // Additional settings
  
  // Component-specific parameters (passed directly in question object)
  placeholder?: string;          // For text inputs / hybrid
  multiSelect?: boolean;         // For hybrid-select / multi-select
  min?: number;                  // For scale-rating
  max?: number;                  // For scale-rating
  step?: number;                 // For scale-rating
  minLabel?: string;             // For scale-rating
  maxLabel?: string;             // For scale-rating
  maxLength?: number;            // For free-text
  multiline?: boolean;           // For free-text
  maxFileSize?: number;          // For image-upload
  
  // Metadata
  category?: string;             // Grouping (color, style, mood, etc.)
  order?: number;                // Display sequence
}

### Component Parameters Detail

#### 1. `image-choice` / `color-palette`
- `options`: `Option[]` (min 2)
- `layout`: `'grid' | 'stack'`
- `columns`: `number` (1-4)

#### 2. `free-text`
- `placeholder`: `string`
- `multiline`: `boolean` (renders textarea if true)
- `maxLength`: `number`

#### 3. `scale-rating`
- `min`: `number` (default 0)
- `max`: `number` (default 10)
- `step`: `number` (default 0.5)
- `minLabel`: `string`
- `maxLabel`: `string`

#### 4. `multi-select` / `single-choice`
- `options`: `Option[]`
- `minSelections`: `number`
- `maxSelections`: `number`

#### 5. `hybrid-select`
- `options`: `Option[]`
- `multiSelect`: `boolean` (control if chip selection is multiple)
- `placeholder`: `string` (for the free-text input field)

#### 6. `image-upload`
- `maxFileSize`: `number` (in bytes)

---
```

### Option Schema

For questions with predefined choices:

```typescript
interface Option {
  id: string;                    // Unique within question
  label: string;                 // Display text
  description?: string;          // Supporting text
  
  // Visual configuration
  imagePrompt?: string;          // For image generation
  imageUrl?: string;             // Direct image URL
  icon?: string;                 // Icon name (from icon library)
  
  // Color-specific
  colors?: string[];             // Array of hex codes
  
  // Metadata for filtering/logic
  metadata?: {
    tags?: string[];
    mood?: string;
    intensity?: number;
    [key: string]: any;
  };
}
```

### Complete Examples

#### Standard Set: Location (Hybrid)
```json
{
  "id": "location-hybrid",
  "type": "hybrid-select",
  "question": "Where will you be?",
  "subtext": "Select from the list or add specific details below.",
  "required": true,
  "multiSelect": false,
  "placeholder": "Specific location details (e.g. Garden wedding in London)",
  "options": [
    { "id": "indoors", "label": "Indoors", "metadata": { "tags": ["indoor"] } },
    { "id": "outdoors", "label": "Outdoors", "metadata": { "tags": ["outdoor"] } },
    { "id": "beach", "label": "At the Beach", "metadata": { "tags": ["beach"] } }
  ]
}
```

#### Standard Set: Budget (Scale)
```json
{
  "id": "budget-scale",
  "type": "scale-rating",
  "question": "What is your budget comfort level?",
  "min": 1,
  "max": 5,
  "step": 1,
  "minLabel": "$",
  "maxLabel": "$$$$$",
  "required": true
}
```

### Complete Example (Full Object)

```json
{
  "id": "q1",
  "type": "image-choice",
  "question": "What visual energy resonates with your project?",
  "layout": "grid",
  "columns": 2,
  "required": true,
  "category": "visual-style",
  "order": 1,
  "options": [
    {
      "id": "opt1",
      "label": "Dynamic & Bold",
      "description": "High contrast, strong geometric shapes, confident presence",
      "imagePrompt": "dynamic bold geometric design with strong shapes and high contrast",
      "metadata": {
        "tags": ["bold", "geometric", "modern"],
        "mood": "energetic",
        "intensity": 9
      }
    },
    {
      "id": "opt2",
      "label": "Soft & Organic",
      "description": "Flowing curves, natural forms, gentle transitions",
      "imagePrompt": "soft organic flowing design with natural curves",
      "metadata": {
        "tags": ["organic", "natural", "flowing"],
        "mood": "calm",
        "intensity": 3
      }
    },
    {
      "id": "opt3",
      "label": "Minimal & Clean",
      "description": "Simple lines, generous white space, restrained elegance",
      "imagePrompt": "minimal clean design with simple lines and white space",
      "metadata": {
        "tags": ["minimal", "clean", "elegant"],
        "mood": "refined",
        "intensity": 2
      }
    },
    {
      "id": "opt4",
      "label": "Textured & Layered",
      "description": "Rich depth, visual complexity, tactile quality",
      "imagePrompt": "textured layered design with depth and complexity",
      "metadata": {
        "tags": ["textured", "complex", "rich"],
        "mood": "sophisticated",
        "intensity": 7
      }
    }
  ]
}
```

---

## Component Library Design

### Base Component Interface

All question components share a common interface:

```typescript
interface QuestionComponentProps {
  question: Question;
  onAnswer: (answer: Answer) => void;
  currentAnswer?: Answer;
  disabled?: boolean;
  styleGuide: StyleGuide;
}

interface Answer {
  questionId: string;
  value: any;                    // Type depends on question type
  selectedOptions?: string[];    // IDs of selected options
  timestamp: number;
}
```

### Example Component: ImageChoice

```typescript
import React from 'react';

interface ImageChoiceProps extends QuestionComponentProps {
  question: Question & { type: 'image-choice' };
}

export const ImageChoice: React.FC<ImageChoiceProps> = ({
  question,
  onAnswer,
  currentAnswer,
  disabled = false,
  styleGuide
}) => {
  const { options, layout = 'grid', columns = 2 } = question;
  
  const handleSelect = (option: Option) => {
    if (disabled) return;
    
    onAnswer({
      questionId: question.id,
      value: option.id,
      selectedOptions: [option.id],
      timestamp: Date.now()
    });
  };
  
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: layout === 'grid' 
      ? `repeat(${columns}, 1fr)` 
      : '1fr',
    gap: '1.5rem'
  };
  
  return (
    <div className="question-container">
      <h2 className="question-text">{question.question}</h2>
      
      <div style={gridStyles}>
        {options?.map(option => (
          <OptionCard
            key={option.id}
            option={option}
            selected={currentAnswer?.selectedOptions?.includes(option.id)}
            onClick={() => handleSelect(option)}
            disabled={disabled}
            styleGuide={styleGuide}
          />
        ))}
      </div>
    </div>
  );
};

// Supporting component
const OptionCard: React.FC<{
  option: Option;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  styleGuide: StyleGuide;
}> = ({ option, selected, onClick, disabled, styleGuide }) => {
  return (
    <div
      onClick={onClick}
      className={`option-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      style={{
        borderColor: selected ? styleGuide.colors.primary : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {/* Image placeholder or actual image */}
      <div className="option-image">
        {option.imageUrl ? (
          <img src={option.imageUrl} alt={option.label} />
        ) : (
          <div className="image-placeholder">
            {/* Gradient or pattern based on imagePrompt */}
          </div>
        )}
      </div>
      
      <h3 className="option-label">{option.label}</h3>
      {option.description && (
        <p className="option-description">{option.description}</p>
      )}
    </div>
  );
};
```

### Example Component: FreeText

```typescript
interface FreeTextProps extends QuestionComponentProps {
  question: Question & { type: 'free-text' };
}

export const FreeText: React.FC<FreeTextProps> = ({
  question,
  onAnswer,
  currentAnswer,
  disabled = false,
  styleGuide
}) => {
  const [value, setValue] = React.useState(currentAnswer?.value || '');
  
  const config = question.config as {
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    multiline?: boolean;
    rows?: number;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    onAnswer({
      questionId: question.id,
      value: newValue,
      timestamp: Date.now()
    });
  };
  
  const InputComponent = config?.multiline ? 'textarea' : 'input';
  
  return (
    <div className="question-container">
      <h2 className="question-text">{question.question}</h2>
      
      <InputComponent
        value={value}
        onChange={handleChange}
        placeholder={config?.placeholder}
        maxLength={config?.maxLength}
        rows={config?.rows}
        disabled={disabled}
        style={{
          borderColor: styleGuide.colors.primary,
          fontFamily: 'inherit'
        }}
      />
      
      {config?.maxLength && (
        <div className="character-count">
          {value.length} / {config.maxLength}
        </div>
      )}
    </div>
  );
};
```

### Component Registry

Map component types to implementations:

```typescript
import ImageChoice from '../ImageChoice.jsx';
import FreeText from '../FreeText.jsx';
import MultiSelect from '../MultiSelect.jsx';
import SingleChoice from '../SingleChoice.jsx';
import ScaleRating from '../ScaleRating.jsx';
import ColorPalette from '../ColorPalette.jsx';
import ImageUpload from '../ImageUpload.jsx';
import HybridSelect from '../HybridSelect.jsx';

export const COMPONENT_REGISTRY = {
  'image-choice': ImageChoice,
  'free-text': FreeText,
  'multi-select': MultiSelect,
  'single-choice': SingleChoice,
  'scale-rating': ScaleRating,
  'color-palette': ColorPalette,
  'hybrid-select': HybridSelect,
  'image-upload': ImageUpload
};

// Renderer component
export const QuestionRenderer: React.FC<{
  question: Question;
  onAnswer: (answer: Answer) => void;
  currentAnswer?: Answer;
  styleGuide: StyleGuide;
}> = ({ question, onAnswer, currentAnswer, styleGuide }) => {
  const Component = COMPONENT_REGISTRY[question.type];
  
  if (!Component) {
    console.error(`Unknown question type: ${question.type}`);
    return (
      <div className="error-state">
        <p>Unable to render question type: {question.type}</p>
      </div>
    );
  }
  
  return (
    <Component
      question={question}
      onAnswer={onAnswer}
      currentAnswer={currentAnswer}
      styleGuide={styleGuide}
    />
  );
};
```

---

## AI Configuration & Prompting

### Style Guide Definition

Create a comprehensive style guide to pass to the AI:

```typescript
const STYLE_GUIDE = {
  componentTypes: [
    'image-choice',
    'free-text',
    'color-palette',
    'scale-rating',
    'multi-select',
    'single-choice',
    'image-upload',
    'text-with-images'
  ],
  
  colors: {
    primary: '#D4775E',
    secondary: '#8B9F7E',
    accent: '#E8C4A0',
    neutral: ['#2D2D2D', '#6B6B6B', '#A8A8A8', '#E5E5E5', '#FAF8F5']
  },
  
  layoutOptions: ['grid', 'stack', 'carousel', 'masonry'],
  
  constraints: {
    maxOptions: 6,
    minOptions: 2,
    gridColumns: [1, 2, 3, 4],
    imageAspectRatios: ['1:1', '16:9', '4:3', '3:4'],
    maxTextLength: 500
  },
  
  voice: {
    tone: 'creative, inspiring, professional',
    personality: 'encouraging and enthusiastic about design',
    language: 'casual'
  },
  
  categories: [
    'visual-style',
    'color-mood',
    'typography',
    'spatial-layout',
    'texture',
    'energy',
    'audience'
  ]
};
```

### AI System Prompt

```typescript
const generateSystemPrompt = (projectTheme: string, styleGuide: StyleGuide) => `
You are a design consultant creating a personalized mood board questionnaire.

PROJECT THEME: "${projectTheme}"

AVAILABLE COMPONENT TYPES:
${styleGuide.componentTypes.map(type => `- ${type}`).join('\n')}

COMPONENT TYPE GUIDELINES:

1. image-choice
   - Use for: Visual style, mood, aesthetic preferences
   - Requires: 2-6 options with imagePrompt for each
   - Config: layout (grid/stack), columns (1-4)

2. free-text
   - Use for: Open-ended questions, descriptions, specific needs
   - Config: placeholder, maxLength, multiline, rows

3. color-palette
   - Use for: Color direction, mood through color
   - Requires: 2-4 palette options, each with 3-5 colors
   - Include: Label, mood description, hex codes

4. scale-rating
   - Use for: Spectrum preferences (minimal ↔ bold, playful ↔ serious)
   - Config: min, max, step, labels for endpoints

5. multi-select
   - Use for: Features, attributes, keywords (select multiple)
   - Config: minSelections, maxSelections

6. single-choice
   - Use for: Binary or exclusive choices
   - Simple yes/no or either/or questions

7. hybrid-select
   - Use for: Category selection with optional custom details
   - Ideal for: Location, specific style lanes, age ranges
   - Config: multiSelect (boolean), placeholder (for text input)

DESIGN CONSTRAINTS:
- Colors: ${JSON.stringify(styleGuide.colors)}
- Layout options: ${styleGuide.layoutOptions.join(', ')}
- Max options per question: ${styleGuide.constraints.maxOptions}
- Tone: ${styleGuide.voice.tone}

QUESTION GENERATION RULES:
1. Generate exactly 5 questions
2. Vary question types - don't use the same type more than twice
3. Cover different categories: visual style, color, typography, layout, mood
4. First question should be broad (overall direction)
5. Subsequent questions should narrow focus
6. Each question builds on previous insights
7. Make questions specific to the project theme

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no backticks, no explanations):

{
  "questions": [
    {
      "id": "q1",
      "type": "image-choice",
      "question": "Question text here?",
      "category": "visual-style",
      "order": 1,
      "layout": "grid",
      "columns": 2,
      "required": true,
      "options": [
        {
          "id": "opt1",
          "label": "Option label",
          "description": "Brief description",
          "imagePrompt": "Detailed image generation prompt",
          "metadata": {
            "tags": ["tag1", "tag2"],
            "mood": "energetic",
            "intensity": 7
          }
        }
      ]
    }
  ]
}

IMPORTANT:
- imagePrompt should be detailed and specific
- Descriptions should be concise (1-2 sentences)
- Labels should be 2-4 words
- Questions should feel natural, not robotic
- Adapt language to project theme
`;
```

### API Call Implementation

```typescript
async function generateQuestions(
  projectTheme: string,
  styleGuide: StyleGuide
): Promise<Question[]> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: generateSystemPrompt(projectTheme, styleGuide),
        messages: [
          {
            role: "user",
            content: `Generate 5 mood board questions for: ${projectTheme}`
          }
        ],
      })
    });

    const data = await response.json();
    const content = data.content[0].text;
    
    // Clean potential markdown formatting
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanContent);
    
    // Validate structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response structure');
    }
    
    // Validate each question
    const validatedQuestions = parsed.questions.map(validateQuestion);
    
    return validatedQuestions;
    
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

function validateQuestion(question: any): Question {
  // Ensure required fields
  if (!question.id || !question.type || !question.question) {
    throw new Error('Missing required question fields');
  }
  
  // Validate component type
  if (!STYLE_GUIDE.componentTypes.includes(question.type)) {
    throw new Error(`Invalid component type: ${question.type}`);
  }
  
  // Type-specific validation
  if (['image-choice', 'color-palette', 'multi-select', 'single-choice'].includes(question.type)) {
    if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`${question.type} requires at least 2 options`);
    }
  }
  
  return question as Question;
}
```

---

## Implementation Examples

### Complete React Application

```typescript
import React, { useState } from 'react';
import { QuestionRenderer } from './components/QuestionRenderer';
import { generateQuestions } from './services/aiService';
import { STYLE_GUIDE } from './config/styleGuide';

export default function MoodBoardApp() {
  const [projectTheme, setProjectTheme] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!projectTheme.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const generatedQuestions = await generateQuestions(projectTheme, STYLE_GUIDE);
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setComplete(false);
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: Answer) => {
    // Save answer
    const updatedAnswers = [
      ...answers.filter(a => a.questionId !== answer.questionId),
      answer
    ];
    setAnswers(updatedAnswers);
    
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleReset = () => {
    setProjectTheme('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setComplete(false);
    setError(null);
  };

  const progress = questions.length > 0 
    ? (currentQuestionIndex / questions.length) * 100 
    : 0;

  return (
    <div className="app">
      {/* Start Screen */}
      {questions.length === 0 && !loading && (
        <div className="start-screen">
          <h1>AI Mood Board Creator</h1>
          <p>Describe your project to generate personalized questions</p>
          
          <input
            type="text"
            value={projectTheme}
            onChange={(e) => setProjectTheme(e.target.value)}
            placeholder="e.g., Modern wellness app, Artisan coffee brand..."
            onKeyPress={(e) => e.key === 'Enter' && handleGenerateQuestions()}
          />
          
          <button 
            onClick={handleGenerateQuestions}
            disabled={!projectTheme.trim()}
          >
            Generate Questions
          </button>
          
          {error && <div className="error">{error}</div>}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <p>Creating personalized questions...</p>
        </div>
      )}

      {/* Question Flow */}
      {questions.length > 0 && !complete && (
        <div className="question-flow">
          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>

          {/* Current Question */}
          <QuestionRenderer
            question={questions[currentQuestionIndex]}
            onAnswer={handleAnswer}
            currentAnswer={answers.find(a => a.questionId === questions[currentQuestionIndex].id)}
            styleGuide={STYLE_GUIDE}
          />

          {/* Navigation */}
          <div className="navigation">
            <button 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            
            <button onClick={handleReset}>
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Complete Screen */}
      {complete && (
        <div className="complete-screen">
          <h2>Your Mood Board</h2>
          <p>Project: {projectTheme}</p>
          
          <div className="mood-board">
            {answers.map((answer, idx) => {
              const question = questions.find(q => q.id === answer.questionId);
              return (
                <div key={idx} className="board-item">
                  <h3>{question?.question}</h3>
                  <div className="answer-display">
                    {renderAnswer(answer, question)}
                  </div>
                </div>
              );
            })}
          </div>
          
          <button onClick={handleReset}>Create New Mood Board</button>
        </div>
      )}
    </div>
  );
}

// Helper to display answers
function renderAnswer(answer: Answer, question?: Question) {
  if (!question) return null;
  
  switch (question.type) {
    case 'image-choice':
    case 'color-palette':
    case 'single-choice':
      const selectedOption = question.options?.find(opt => 
        answer.selectedOptions?.includes(opt.id)
      );
      return (
        <div>
          <strong>{selectedOption?.label}</strong>
          <p>{selectedOption?.description}</p>
        </div>
      );
      
    case 'multi-select':
      const selectedOptions = question.options?.filter(opt =>
        answer.selectedOptions?.includes(opt.id)
      );
      return (
        <ul>
          {selectedOptions?.map(opt => (
            <li key={opt.id}>{opt.label}</li>
          ))}
        </ul>
      );
      
    case 'free-text':
      return <p>{answer.value}</p>;
      
    case 'scale-rating':
      return <p>Rating: {answer.value}</p>;
      
    default:
      return <p>{JSON.stringify(answer.value)}</p>;
  }
}
```

---

## Error Handling

### Validation Layer

```typescript
// Validate AI response structure
function validateAIResponse(response: any): Question[] {
  const errors: string[] = [];
  
  // Check top-level structure
  if (!response.questions) {
    throw new Error('Response missing "questions" array');
  }
  
  if (!Array.isArray(response.questions)) {
    throw new Error('"questions" must be an array');
  }
  
  if (response.questions.length === 0) {
    throw new Error('No questions generated');
  }
  
  // Validate each question
  response.questions.forEach((q: any, idx: number) => {
    const prefix = `Question ${idx + 1}:`;
    
    if (!q.id) errors.push(`${prefix} missing id`);
    if (!q.type) errors.push(`${prefix} missing type`);
    if (!q.question) errors.push(`${prefix} missing question text`);
    
    if (q.type && !STYLE_GUIDE.componentTypes.includes(q.type)) {
      errors.push(`${prefix} invalid type "${q.type}"`);
    }
    
    // Type-specific validation
    const requiresOptions = ['image-choice', 'color-palette', 'multi-select', 'single-choice'];
    if (requiresOptions.includes(q.type)) {
      if (!q.options || !Array.isArray(q.options)) {
        errors.push(`${prefix} type "${q.type}" requires options array`);
      } else if (q.options.length < 2) {
        errors.push(`${prefix} needs at least 2 options`);
      }
      
      // Validate options
      q.options?.forEach((opt: any, optIdx: number) => {
        if (!opt.id) errors.push(`${prefix} Option ${optIdx + 1} missing id`);
        if (!opt.label) errors.push(`${prefix} Option ${optIdx + 1} missing label`);
      });
    }
  });
  
  if (errors.length > 0) {
    throw new Error(`Validation errors:\n${errors.join('\n')}`);
  }
  
  return response.questions;
}
```

### Fallback Strategy

```typescript
// Provide fallback questions if AI generation fails
const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 'fallback-1',
    type: 'image-choice',
    question: 'What overall aesthetic direction appeals to you?',
    category: 'visual-style',
    order: 1,
    layout: 'grid',
    columns: 2,
    required: true,
    options: [
      {
        id: 'minimal',
        label: 'Minimal & Clean',
        description: 'Simple, focused, elegant',
        imagePrompt: 'minimal clean design'
      },
      {
        id: 'bold',
        label: 'Bold & Dynamic',
        description: 'Strong, energetic, confident',
        imagePrompt: 'bold dynamic design'
      },
      {
        id: 'organic',
        label: 'Organic & Natural',
        description: 'Flowing, soft, harmonious',
        imagePrompt: 'organic natural design'
      },
      {
        id: 'technical',
        label: 'Technical & Precise',
        description: 'Structured, detailed, systematic',
        imagePrompt: 'technical precise design'
      }
    ]
  },
  {
    id: 'fallback-2',
    type: 'free-text',
    question: 'Describe your target audience in a few words',
    category: 'audience',
    order: 2,
    required: true,
    config: {
      placeholder: 'e.g., young professionals, health-conscious, tech-savvy',
      maxLength: 200,
      multiline: false
    }
  }
];

// Use in generation function
async function generateQuestionsWithFallback(
  projectTheme: string,
  styleGuide: StyleGuide
): Promise<Question[]> {
  try {
    return await generateQuestions(projectTheme, styleGuide);
  } catch (error) {
    console.error('AI generation failed, using fallback questions', error);
    return FALLBACK_QUESTIONS;
  }
}
```

### User-Friendly Error Messages

```typescript
function getErrorMessage(error: Error): string {
  if (error.message.includes('Validation errors')) {
    return 'We encountered an issue generating your questions. Please try again.';
  }
  
  if (error.message.includes('fetch')) {
    return 'Unable to connect to AI service. Please check your internet connection.';
  }
  
  if (error.message.includes('JSON')) {
    return 'Received unexpected response format. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}
```

---

## Best Practices

### 1. Type Safety

Use TypeScript to catch errors at compile time:

```typescript
// Define strict types
type ComponentType = 
  | 'image-choice'
  | 'free-text'
  | 'color-palette'
  | 'scale-rating'
  | 'multi-select'
  | 'single-choice'
  | 'image-upload'
  | 'text-with-images';

// Use discriminated unions for type safety
type Question = 
  | ImageChoiceQuestion
  | FreeTextQuestion
  | ColorPaletteQuestion
  | ScaleRatingQuestion
  | MultiSelectQuestion
  | SingleChoiceQuestion;

interface BaseQuestion {
  id: string;
  question: string;
  category?: string;
  order?: number;
  required?: boolean;
}

interface ImageChoiceQuestion extends BaseQuestion {
  type: 'image-choice';
  layout: 'grid' | 'stack' | 'carousel';
  columns?: number;
  options: ImageOption[];
}

interface FreeTextQuestion extends BaseQuestion {
  type: 'free-text';
  config: {
    placeholder?: string;
    maxLength?: number;
    multiline?: boolean;
  };
}
```

### 2. Performance Optimization

```typescript
// Memoize expensive components
const ImageChoice = React.memo(ImageChoiceComponent, (prev, next) => {
  return (
    prev.question.id === next.question.id &&
    prev.currentAnswer === next.currentAnswer &&
    prev.disabled === next.disabled
  );
});

// Lazy load images
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      loading="lazy"
      decoding="async"
    />
  );
};

// Debounce free text input
import { useDebouncedCallback } from 'use-debounce';

const debouncedOnAnswer = useDebouncedCallback(
  (value) => onAnswer({ questionId, value, timestamp: Date.now() }),
  500
);
```

### 3. Accessibility

```typescript
// Ensure components are accessible
export const ImageChoice: React.FC<ImageChoiceProps> = (props) => {
  return (
    <div role="radiogroup" aria-labelledby="question-text">
      <h2 id="question-text">{props.question.question}</h2>
      
      {props.options.map(option => (
        <button
          key={option.id}
          role="radio"
          aria-checked={isSelected(option.id)}
          aria-label={`${option.label}: ${option.description}`}
          onClick={() => handleSelect(option)}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleSelect(option);
            }
          }}
        >
          {/* Option content */}
        </button>
      ))}
    </div>
  );
};
```

### 4. State Management

For larger applications, consider state management:

```typescript
// Using Zustand (lightweight alternative to Redux)
import create from 'zustand';

interface MoodBoardState {
  projectTheme: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  setProjectTheme: (theme: string) => void;
  setQuestions: (questions: Question[]) => void;
  addAnswer: (answer: Answer) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  reset: () => void;
}

const useMoodBoardStore = create<MoodBoardState>((set) => ({
  projectTheme: '',
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  
  setProjectTheme: (theme) => set({ projectTheme: theme }),
  setQuestions: (questions) => set({ questions, currentQuestionIndex: 0 }),
  
  addAnswer: (answer) => set((state) => ({
    answers: [
      ...state.answers.filter(a => a.questionId !== answer.questionId),
      answer
    ]
  })),
  
  nextQuestion: () => set((state) => ({
    currentQuestionIndex: Math.min(
      state.currentQuestionIndex + 1,
      state.questions.length - 1
    )
  })),
  
  previousQuestion: () => set((state) => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
  })),
  
  reset: () => set({
    projectTheme: '',
    questions: [],
    currentQuestionIndex: 0,
    answers: []
  })
}));
```

### 5. Testing

```typescript
// Unit test for component
import { render, fireEvent, screen } from '@testing-library/react';
import { ImageChoice } from './ImageChoice';

describe('ImageChoice Component', () => {
  const mockQuestion: ImageChoiceQuestion = {
    id: 'test-1',
    type: 'image-choice',
    question: 'Test question?',
    layout: 'grid',
    columns: 2,
    options: [
      { id: 'opt1', label: 'Option 1', description: 'Desc 1' },
      { id: 'opt2', label: 'Option 2', description: 'Desc 2' }
    ]
  };
  
  const mockOnAnswer = jest.fn();
  const mockStyleGuide = { /* ... */ };
  
  it('renders question text', () => {
    render(
      <ImageChoice 
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        styleGuide={mockStyleGuide}
      />
    );
    
    expect(screen.getByText('Test question?')).toBeInTheDocument();
  });
  
  it('calls onAnswer when option is selected', () => {
    render(
      <ImageChoice 
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        styleGuide={mockStyleGuide}
      />
    );
    
    fireEvent.click(screen.getByText('Option 1'));
    
    expect(mockOnAnswer).toHaveBeenCalledWith({
      questionId: 'test-1',
      value: 'opt1',
      selectedOptions: ['opt1'],
      timestamp: expect.any(Number)
    });
  });
});

// Integration test for AI generation
describe('AI Question Generation', () => {
  it('generates valid questions', async () => {
    const questions = await generateQuestions('Test project', STYLE_GUIDE);
    
    expect(questions).toHaveLength(5);
    expect(questions[0]).toHaveProperty('id');
    expect(questions[0]).toHaveProperty('type');
    expect(questions[0]).toHaveProperty('question');
  });
  
  it('handles API errors gracefully', async () => {
    // Mock fetch to throw error
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
    
    await expect(
      generateQuestions('Test project', STYLE_GUIDE)
    ).rejects.toThrow();
  });
});
```

---

## Extending the System

### Adding New Component Types

1. **Define the type**:

```typescript
interface VideoChoiceQuestion extends BaseQuestion {
  type: 'video-choice';
  options: Array<{
    id: string;
    label: string;
    videoUrl: string;
    thumbnail?: string;
    duration?: number;
  }>;
}
```

2. **Create the component**:

```typescript
export const VideoChoice: React.FC<QuestionComponentProps> = (props) => {
  // Implementation
};
```

3. **Register the component**:

```typescript
COMPONENT_REGISTRY['video-choice'] = VideoChoice;
```

4. **Update style guide**:

```typescript
const STYLE_GUIDE = {
  componentTypes: [
    ...existingTypes,
    'video-choice'
  ]
};
```

5. **Update AI prompt**:

```typescript
const systemPrompt = `
...
7. video-choice
   - Use for: Dynamic examples, motion preferences
   - Requires: videoUrl for each option
   - Config: autoplay, loop
...
`;
```

### Conditional Logic

Show questions based on previous answers:

```typescript
interface ConditionalRule {
  dependsOn: string;           // Question ID
  condition: 'equals' | 'includes' | 'greaterThan' | 'lessThan';
  value: any;
}

interface Question {
  // ... other fields
  conditional?: ConditionalRule;
}

// In AI prompt:
const systemPrompt = `
You can make questions conditional:

{
  "id": "q3",
  "question": "What bold colors appeal to you?",
  "conditional": {
    "dependsOn": "q1",
    "condition": "equals",
    "value": "bold-style-option-id"
  }
}

This question only shows if user selected the "bold" option in question 1.
`;

// In renderer:
function shouldShowQuestion(question: Question, answers: Answer[]): boolean {
  if (!question.conditional) return true;
  
  const dependentAnswer = answers.find(a => a.questionId === question.conditional.dependsOn);
  if (!dependentAnswer) return false;
  
  switch (question.conditional.condition) {
    case 'equals':
      return dependentAnswer.value === question.conditional.value;
    case 'includes':
      return dependentAnswer.selectedOptions?.includes(question.conditional.value);
    // ... other conditions
    default:
      return true;
  }
}
```

### Multi-Language Support

```typescript
interface TranslatedQuestion extends Question {
  translations?: {
    [locale: string]: {
      question: string;
      options?: Array<{
        label: string;
        description: string;
      }>;
    };
  };
}

// In AI prompt, specify language
const systemPrompt = `
Generate questions in: ${locale}

If locale is not English, also provide English version in translations field.
`;

// In renderer
function getTranslatedQuestion(question: TranslatedQuestion, locale: string): Question {
  if (locale === 'en' || !question.translations?.[locale]) {
    return question;
  }
  
  return {
    ...question,
    question: question.translations[locale].question,
    options: question.options?.map((opt, idx) => ({
      ...opt,
      label: question.translations[locale].options?.[idx].label || opt.label,
      description: question.translations[locale].options?.[idx].description || opt.description
    }))
  };
}
```

### Analytics & Insights

Track user behavior to improve questions:

```typescript
interface AnswerEvent {
  questionId: string;
  optionId?: string;
  value: any;
  timestamp: number;
  timeSpent: number;        // Milliseconds on question
  changedAnswer: boolean;   // Did they change their answer?
}

// Track analytics
const trackAnswer = (event: AnswerEvent) => {
  // Send to analytics service
  analytics.track('question_answered', {
    question_type: event.questionType,
    time_spent: event.timeSpent,
    changed_answer: event.changedAnswer
  });
};

// Use insights to improve AI prompts
const systemPrompt = `
Based on user behavior analysis:
- Users prefer 4 options over 6 (higher completion rate)
- Questions with images get answered 2x faster
- Text questions should be positioned mid-flow (not first/last)
`;
```

---

## Summary

The hybrid approach provides:

✅ **Safety** - No code execution, just data  
✅ **Flexibility** - AI controls content and configuration  
✅ **Consistency** - Pre-built components enforce design  
✅ **Maintainability** - Clear separation of concerns  
✅ **Extensibility** - Easy to add new components  
✅ **Type Safety** - TypeScript prevents errors  
✅ **Testability** - Components are predictable  

This architecture balances AI creativity with engineering discipline, creating a robust system for dynamic, intelligent forms.