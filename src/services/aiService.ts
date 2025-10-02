import { UserProfile, WellnessTip, WellnessGoal, WELLNESS_ICONS } from '../types';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';


export class AIService {
  private static instance: AIService;
  private apiKey: string;
  private requestQueue: Promise<any>[] = [];
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

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
   * Rate-limited API call wrapper
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
   * Make Gemini API call with retry logic
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
                temperature: 0.7,
                maxOutputTokens: 1024,
                topP: 0.8,
                topK: 40
              }
            })
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            
            if (res.status === 429) {
              throw new Error('RATE_LIMIT');
            }
            
            throw new Error(errorData.error?.message || `API Error: ${res.status}`);
          }

          return res.json();
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('No response from Gemini AI');
        }

        return text;
      } catch (error: any) {
        const isLastAttempt = attempt === retries - 1;
        
        if (error.message === 'RATE_LIMIT' && !isLastAttempt) {
          // Exponential backoff for rate limits
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 2000));
          continue;
        }
        
        if (isLastAttempt) {
          console.error('Gemini API Error:', error);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('Failed after multiple retries');
  }

  /**
   * Generate personalized wellness recommendations
   */
  async generateRecommendations(profile: UserProfile): Promise<WellnessTip[]> {
    try {
      const prompt = `You are a professional wellness coach. Generate exactly 5 personalized wellness tips for:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Wellness Goals: ${profile.goals.map(g => g.replace('-', ' ')).join(', ')}

For each tip, provide:
1. A catchy, actionable title (max 8 words)
2. A brief description (max 15 words)
3. Which goal it addresses (must be one of: ${profile.goals.join(', ')})

Format your response as a JSON array with this exact structure:
[
  {
    "title": "Morning Hydration Boost",
    "description": "Start your day with lemon water for energy",
    "category": "energy-boost"
  }
]

Make tips specific, evidence-based, and achievable. Ensure variety across physical, mental, dietary, and lifestyle changes.`;

      const response = await this.callGeminiAPI(prompt);
      return this.parseRecommendations(response, profile.goals);
    } catch (error: any) {
      console.error('Generate Recommendations Error:', error);
      
      if (error.message?.includes('API key')) {
        throw new Error('Please configure your Gemini API key in the .env file');
      }
      
      throw new Error('Unable to generate recommendations. Please try again.');
    }
  }

  /**
   * Generate detailed explanation for a tip
   */
  async generateDetailedExplanation(tip: WellnessTip, profile: UserProfile): Promise<WellnessTip> {
    try {
      const prompt = `As a wellness expert, provide detailed information about this wellness tip:

Title: ${tip.title}
Description: ${tip.shortDescription}
User Profile: ${profile.age} year old ${profile.gender}, focused on ${profile.goals.join(', ')}

Provide a JSON response with:
{
  "longDescription": "2-3 paragraphs explaining the science and benefits",
  "steps": ["step 1", "step 2", ...], // 5-7 actionable steps
  "benefits": ["benefit 1", "benefit 2", ...], // 4-5 key benefits
  "timeRequired": "X minutes per day",
  "difficulty": "easy" // or "medium" or "hard"
}

Make it practical, evidence-based, and personalized for this user.`;

      const response = await this.callGeminiAPI(prompt);
      const details = this.parseDetailedExplanation(response);
      return { ...tip, ...details };
    } catch (error) {
      console.error('Detail Generation Error:', error);
      return this.getFallbackDetailedExplanation(tip);
    }
  }

  /**
   * Parse recommendations from AI response
   */
  private parseRecommendations(response: string, goals: WellnessGoal[]): WellnessTip[] {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Invalid recommendations format');
      }

      const tips: WellnessTip[] = parsed.slice(0, 5).map((item: any, index: number) => {
        const category = this.mapToWellnessGoal(item.category, goals);
        return {
          id: `tip-${Date.now()}-${index}`,
          title: item.title || `Wellness Tip ${index + 1}`,
          shortDescription: item.description || 'Improve your wellness',
          category: category,
          icon: WELLNESS_ICONS[category],
          createdAt: new Date(),
          isSaved: false
        };
      });

      // Fill to 5 tips if needed
      while (tips.length < 5) {
        tips.push(this.generateFallbackTip(tips.length, goals));
      }

      return tips;
    } catch (error) {
      console.error('Parse error:', error);
      // Return fallback tips if parsing fails
      return Array.from({ length: 5 }, (_, i) => this.generateFallbackTip(i, goals));
    }
  }

  /**
   * Parse detailed explanation
   */
  private parseDetailedExplanation(response: string): Partial<WellnessTip> {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const json = JSON.parse(jsonMatch[0]);
      
      return {
        longDescription: json.longDescription || '',
        steps: Array.isArray(json.steps) ? json.steps : [],
        benefits: Array.isArray(json.benefits) ? json.benefits : [],
        timeRequired: json.timeRequired || '15-30 minutes',
        difficulty: ['easy', 'medium', 'hard'].includes(json.difficulty) ? json.difficulty : 'easy'
      };
    } catch {
      return this.getDefaultDetails();
    }
  }

  /**
   * Map category string to WellnessGoal
   */
  private mapToWellnessGoal(category: string, goals: WellnessGoal[]): WellnessGoal {
    const normalized = category?.toLowerCase().replace(/[_\s]/g, '-');
    const validGoals: WellnessGoal[] = [
      'weight-loss', 'muscle-gain', 'better-sleep', 'stress-management',
      'healthy-eating', 'mental-health', 'energy-boost', 'flexibility',
      'cardiovascular', 'mindfulness'
    ];

    if (validGoals.includes(normalized as WellnessGoal)) {
      return normalized as WellnessGoal;
    }

    // Find best match from user's goals
    return goals[0] || 'energy-boost';
  }

  /**
   * Generate fallback tip
   */
  private generateFallbackTip(index: number, goals: WellnessGoal[]): WellnessTip {
    const templates = [
      { title: 'Morning Hydration Ritual', desc: 'Start your day with water', goal: 'energy-boost' },
      { title: 'Mindful Breathing Practice', desc: 'Take 5 deep breaths hourly', goal: 'stress-management' },
      { title: 'Evening Walk Routine', desc: 'Walk for 20 minutes after dinner', goal: 'cardiovascular' },
      { title: 'Balanced Meal Planning', desc: 'Include protein in every meal', goal: 'healthy-eating' },
      { title: 'Digital Detox Hour', desc: 'No screens before bedtime', goal: 'better-sleep' }
    ];

    const template = templates[index % templates.length];
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
  }

  /**
   * Get default details for fallback
   */
  private getDefaultDetails(): Partial<WellnessTip> {
    return {
      longDescription: 'This wellness practice can help improve your overall health and well-being. Regular implementation of this tip can lead to positive changes in your daily life.',
      steps: [
        'Start with small, manageable changes',
        'Set a consistent daily schedule',
        'Track your progress in a journal',
        'Stay patient and persistent',
        'Adjust based on your needs'
      ],
      benefits: [
        'Improved overall wellness',
        'Better energy levels',
        'Enhanced mental clarity',
        'Increased motivation'
      ],
      timeRequired: '15-20 minutes',
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
      longDescription: `${tip.title} is a powerful wellness practice that can transform your daily routine. This approach combines evidence-based strategies with practical implementation to help you achieve your health goals. By consistently applying this technique, you'll notice gradual improvements in both your physical and mental well-being.`
    };
  }
}

export default AIService.getInstance();