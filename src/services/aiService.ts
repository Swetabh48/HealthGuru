import { UserProfile, WellnessTip, WellnessGoal, WELLNESS_ICONS } from '../types';

// FIXED: Using correct Gemini model name
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export class AIService {
  private static instance: AIService;
  private apiKey: string;
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 2000; // Increased to 2 seconds

  private constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Rate-limited API call wrapper with exponential backoff
   */
  private async makeRateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    return requestFn();
  }

  /**
   * Make Gemini API call with improved error handling and retry logic
   */
  private async callGeminiAPI(prompt: string, retries = 3): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file');
    }

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.makeRateLimitedRequest(async () => {
          const res = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.9,
                maxOutputTokens:4096,
                topP: 0.95,
                topK: 40
              }
            })
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            
            if (res.status === 429) {
              console.log(`Rate limit hit, attempt ${attempt + 1}/${retries}`);
              throw new Error('RATE_LIMIT');
            }
            
            if (res.status === 400) {
              console.error('Bad request:', errorData);
              throw new Error(errorData.error?.message || 'Invalid request to Gemini API');
            }
            
            throw new Error(errorData.error?.message || `API Error: ${res.status}`);
          }

          return res.json();
        });

        // FIXED: Better response parsing with multiple fallbacks
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text || text.trim().length === 0) {
          console.error('Empty response from Gemini:', response);
          throw new Error('Empty response from Gemini AI');
        }

        console.log('Gemini response received:', text.substring(0, 200));
        return text;

      } catch (error: any) {
        const isLastAttempt = attempt === retries - 1;
        
        // Handle rate limiting with exponential backoff
        if (error.message === 'RATE_LIMIT' && !isLastAttempt) {
          const waitTime = Math.pow(2, attempt) * 3000; // 3s, 6s, 12s
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        if (isLastAttempt) {
          console.error('Gemini API Error (final attempt):', error);
          throw error;
        }
        
        // Wait before retry for other errors
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    throw new Error('Failed after multiple retries');
  }

  /**
   * Generate personalized wellness recommendations with goal descriptions
   */
  async generateRecommendations(profile: UserProfile): Promise<WellnessTip[]> {
    try {
      // Build goal descriptions section
      const goalDescriptions = profile.goals.map((goal, index) => {
        const description = profile.goalDescriptions?.[goal] || 'General wellness improvement';
        return `${index + 1}. ${goal.replace('-', ' ')}: ${description}`;
      }).join('\n');

      const prompt = `You are a professional health,fitness and lifestyle expert. Generate exactly 6 personalized, actionable wellness tips.

USER PROFILE:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Primary Wellness Goals:
${goalDescriptions}

REQUIREMENTS:
- Create 6 diverse tips covering different aspects of wellness
- Each tip should be specific, evidence-based, and immediately actionable
- Consider the user's age, gender, and specific goal descriptions
- Mix physical, mental, dietary, and lifestyle recommendations

OUTPUT FORMAT (JSON only, no markdown):
[
  {
    "title": "Specific action-oriented title (max 8 words)",
    "description": "Clear benefit statement (max 20 words)",
    "category": "one of: ${profile.goals.join(', ')}"
  }
]

Example:
[
  {
    "title": "Morning Hydration Ritual",
    "description": "Drink 500ml water upon waking to boost metabolism and energy levels",
    "category": "energy-boost"
  }
]

Generate the JSON array now:`;

      const response = await this.callGeminiAPI(prompt);
      const tips = this.parseRecommendations(response, profile.goals);
      
      if (tips.length === 0) {
        throw new Error('No valid tips generated');
      }
      
      return tips;

    } catch (error: any) {
      console.error('Generate Recommendations Error:', error);
      
      if (error.message?.includes('API key')) {
        throw new Error('Please configure your Gemini API key in the .env file');
      }
      
      if (error.message?.includes('RATE_LIMIT') || error.message?.includes('429')) {
        throw new Error('API rate limit reached. Please wait a moment and try again.');
      }
      
      // Return fallback tips instead of throwing
      console.log('Using fallback tips due to API error');
      return this.generateFallbackTips(profile.goals);
    }
  }

  /**
   * Generate detailed explanation for a tip
   */
  async generateDetailedExplanation(tip: WellnessTip, profile: UserProfile): Promise<WellnessTip> {
  try {
    // Updated prompt to force compact JSON and short outputs per field
    const prompt = `You are a fitness expert with all the knowledge that a fitness trainer and doctor have. Provide detailed information about this wellness tip in strict JSON only.

TIP: ${tip.title}
DESCRIPTION: ${tip.shortDescription}
USER: ${profile.age} year old ${profile.gender}
GOALS: ${profile.goals.join(', ')}

Requirements:
- Output JSON only, no markdown, no extra text
- Limit longDescription to ~500 words
- Provide exactly 5 steps in an array
- Provide exactly 4 benefits in an array
- timeRequired as "X-Y minutes"
- difficulty as "easy", "medium", or "hard"

Output format:
{
  "longDescription": "...",
  "steps": ["...", "...", "...", "...", "..."],
  "benefits": ["...", "...", "...", "..."],
  "timeRequired": "15-30 minutes",
  "difficulty": "easy"
}

Generate the JSON now:`;

    const response = await this.callGeminiAPI(prompt);

    console.log('Raw Gemini detailed response:', response);

    // Use our robust parser
    const details = this.parseDetailedExplanation(response);

    return { ...tip, ...details };
  } catch (error) {
    console.error('Detail Generation Error:', error);
    return this.getFallbackDetailedExplanation(tip);
  }
}

  /**
   * Parse recommendations from AI response with improved error handling
   */
 /**
 * Parse recommendations from AI response with defensive JSON handling
 */
private parseRecommendations(response: string, goals: WellnessGoal[]): WellnessTip[] {
  try {
    // Step 1: Clean up raw response
    let cleanedResponse = response.trim();
    cleanedResponse = cleanedResponse.replace(/```json\n?|```/g, '').trim();

    // Step 2: Extract only the JSON array portion
    const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.error("No JSON array found in response:", cleanedResponse);
      return this.generateFallbackTips(goals);
    }

    let parsed: any;

    // Step 3: Try strict parse first
    try {
      parsed = JSON.parse(arrayMatch[0]);
    } catch (err) {
      console.warn("Strict JSON parse failed, trying relaxed parse:", err);

      // Remove trailing commas before } or ]
      const relaxed = arrayMatch[0]
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');

      try {
        parsed = JSON.parse(relaxed);
      } catch (err2) {
        console.error("Relaxed JSON parse failed:", err2);
        return this.generateFallbackTips(goals);
      }
    }

    // Step 4: Validate array
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error("Parsed data is not a valid array:", parsed);
      return this.generateFallbackTips(goals);
    }

    // Step 5: Drop incomplete objects (e.g. cut-off JSON)
    parsed = parsed.filter(
      (item: any) => item?.title && item?.description && item?.category
    );

    if (parsed.length === 0) {
      console.error("All parsed tips were invalid:", parsed);
      return this.generateFallbackTips(goals);
    }

    console.log(`Successfully parsed ${parsed.length} tips`);

    // Step 6: Map to WellnessTip objects
    const tips: WellnessTip[] = parsed.slice(0, 6).map((item: any, index: number) => {
      const category = this.mapToWellnessGoal(item.category, goals);
      return {
        id: `tip-${Date.now()}-${index}`,
        title: item.title || `Wellness Tip ${index + 1}`,
        shortDescription: item.description || 'Improve your wellness journey',
        category: category,
        icon: WELLNESS_ICONS[category],
        createdAt: new Date(),
        isSaved: false
      };
    });

    // Ensure at least 5 tips
    while (tips.length < 5) {
      tips.push(this.generateFallbackTip(tips.length, goals));
    }

    return tips;

  } catch (error) {
    console.error("Parse error:", error, "\nRaw response:", response);
    return this.generateFallbackTips(goals);
  }
}


  /**
   * Parse detailed explanation with better error handling
   */
private parseDetailedExplanation(response: string): Partial<WellnessTip> {
  try {
    let cleaned = response.trim();

    // Remove code fences if present
    cleaned = cleaned.replace(/```json\n?|```/g, '').trim();

    // Attempt to extract JSON between first { and last }
    // const firstBrace = cleaned.indexOf('{');
    // const lastBrace = cleaned.lastIndexOf('}');
    
    // if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    //   throw new Error('No JSON braces found');
    // }

    // let jsonString = cleaned.slice(firstBrace, lastBrace + 1);

    // // 🔧 Auto-fix common Gemini mistakes:
    // // 1. Missing comma before a new key after array/object
    // jsonString = jsonString.replace(/]\s*"\s*([a-zA-Z0-9_]+)"\s*:/g, '],"$1":');
    // jsonString = jsonString.replace(/}\s*"\s*([a-zA-Z0-9_]+)"\s*:/g, '},"$1":');

    let parsed: any = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.warn("Strict JSON parse failed, falling back:", err);

      // Regex fallback for partial JSON
      const extractField = (key: string) => {
        const match = cleaned.match(new RegExp(`"${key}"\\s*:\\s*(\\[[^\\]]*\\]|"[^"]*")`, 's'));
        if (!match) return key === 'longDescription' ? '' : [];
        return match[1].startsWith('[') ? JSON.parse(match[1]) : match[1].replace(/^"|"$/g, '');
      };

      parsed.longDescription = extractField('longDescription');
      parsed.steps = extractField('steps');
      parsed.benefits = extractField('benefits');
    }

    return {
      longDescription: parsed.longDescription || '',
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
      timeRequired: parsed.timeRequired || '15-30 minutes',
      difficulty: ['easy', 'medium', 'hard'].includes(parsed.difficulty)
        ? parsed.difficulty
        : 'easy'
    };
  } catch (error) {
    console.error('Failed to parse detailed explanation:', error, '\nRaw response:', response);
    return this.getDefaultDetails();
  }
}



  /**
   * Map category string to WellnessGoal with fuzzy matching
   */
  private mapToWellnessGoal(category: string, goals: WellnessGoal[]): WellnessGoal {
    const normalized = category?.toLowerCase().replace(/[_\s]/g, '-');
    const validGoals: WellnessGoal[] = [
      'weight-loss', 'muscle-gain', 'better-sleep', 'stress-management',
      'healthy-eating', 'mental-health', 'energy-boost', 'flexibility',
      'cardiovascular', 'mindfulness'
    ];

    // Exact match
    if (validGoals.includes(normalized as WellnessGoal)) {
      return normalized as WellnessGoal;
    }

    // Fuzzy matching
    for (const goal of validGoals) {
      if (normalized.includes(goal) || goal.includes(normalized)) {
        return goal;
      }
    }

    // Return first user goal as fallback
    return goals[0] || 'energy-boost';
  }

  /**
   * Generate comprehensive fallback tips
   */
  private generateFallbackTips(goals: WellnessGoal[]): WellnessTip[] {
    const templates = [
      { title: 'Morning Hydration Boost', desc: 'Start each day with 500ml of water to kickstart metabolism', goal: 'energy-boost' },
      { title: '5-Minute Breathing Exercise', desc: 'Practice deep belly breathing to reduce stress and improve focus', goal: 'stress-management' },
      { title: 'Evening Walk Ritual', desc: 'Take a 20-minute walk after dinner for better digestion and sleep', goal: 'cardiovascular' },
      { title: 'Protein-Rich Breakfast', desc: 'Include 20-30g protein in breakfast to maintain energy levels', goal: 'healthy-eating' },
      { title: 'Digital Sunset', desc: 'Stop screen use 1 hour before bed for improved sleep quality', goal: 'better-sleep' },
      { title: 'Gratitude Journaling', desc: 'Write 3 things you\'re grateful for each evening for mental wellness', goal: 'mental-health' }
    ];

    return templates.slice(0, 6).map((template, index) => {
      const category = (goals.includes(template.goal as WellnessGoal) 
        ? template.goal 
        : goals[index % goals.length]) as WellnessGoal;

      return {
        id: `fallback-${Date.now()}-${index}`,
        title: template.title,
        shortDescription: template.desc,
        category: category,
        icon: WELLNESS_ICONS[category],
        createdAt: new Date(),
        isSaved: false
      };
    });
  }

  /**
   * Generate single fallback tip
   */
  private generateFallbackTip(index: number, goals: WellnessGoal[]): WellnessTip {
    const tips = this.generateFallbackTips(goals);
    return tips[index % tips.length];
  }

  /**
   * Get default details for tips
   */
  private getDefaultDetails(): Partial<WellnessTip> {
    return {
      longDescription: 'This wellness practice is designed to help you achieve your health goals through consistent, evidence-based actions. Regular implementation can lead to significant improvements in your overall well-being. Start slowly and build the habit over time for best results.',
      steps: [
        'Begin with a clear intention and understand why this matters to you',
        'Start small with just 5-10 minutes per day',
        'Create a specific time and place for this practice',
        'Track your progress in a journal or app',
        'Gradually increase duration and intensity as you build consistency',
        'Adjust the practice based on how your body responds'
      ],
      benefits: [
        'Improved physical health and energy levels',
        'Better mental clarity and emotional balance',
        'Enhanced sleep quality and recovery',
        'Increased motivation and self-confidence',
        'Long-term sustainable wellness habits'
      ],
      timeRequired: '15-20 minutes daily',
      difficulty: 'easy'
    };
  }

  /**
   * Fallback detailed explanation
   */
  private getFallbackDetailedExplanation(tip: WellnessTip): WellnessTip {
    return {
      ...tip,
      ...this.getDefaultDetails(),
      longDescription: `${tip.title} is a powerful wellness practice that addresses your specific health goals. This approach combines evidence-based strategies with practical implementation techniques. Research shows that consistent daily practice leads to measurable improvements in both physical and mental well-being.\n\nBy incorporating this into your routine, you're taking a proactive step toward better health. The key is consistency rather than perfection. Start where you are and build gradually for sustainable, long-term results.`
    };
  }
}

export default AIService.getInstance();