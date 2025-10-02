import OpenAI from 'openai';
import { UserProfile, WellnessTip, WellnessGoal, WELLNESS_ICONS } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
});

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate personalized wellness recommendations based on user profile
   */
  async generateRecommendations(profile: UserProfile): Promise<WellnessTip[]> {
    try {
      const prompt = this.buildRecommendationPrompt(profile);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional wellness coach and health expert. Generate personalized, actionable wellness tips based on the user's profile. Each tip should be practical, evidence-based, and achievable."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return this.parseRecommendations(response, profile.goals);
    } catch (error) {
      console.error('AI Service Error:', error);
      // Fallback to mock data if API fails
      return this.getFallbackRecommendations(profile);
    }
  }

  /**
   * Generate detailed explanation for a specific tip
   */
  async generateDetailedExplanation(tip: WellnessTip, profile: UserProfile): Promise<WellnessTip> {
    try {
      const prompt = `
        Based on this wellness tip: "${tip.title}" - ${tip.shortDescription}
        
        For a ${profile.age}-year-old ${profile.gender} focused on ${profile.goals.join(', ')}:
        
        Please provide:
        1. A detailed explanation (2-3 paragraphs)
        2. Step-by-step implementation guide (5-7 steps)
        3. Key benefits (3-5 points)
        4. Time required and difficulty level
        
        Format as JSON with keys: longDescription, steps (array), benefits (array), timeRequired, difficulty
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a wellness expert. Provide detailed, actionable advice in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 600,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      const details = this.parseDetailedExplanation(response);
      return { ...tip, ...details };
    } catch (error) {
      console.error('Detail Generation Error:', error);
      return this.getFallbackDetailedExplanation(tip);
    }
  }

  /**
   * Build recommendation prompt based on user profile
   */
  private buildRecommendationPrompt(profile: UserProfile): string {
    return `
      Generate 5 personalized wellness recommendations for:
      - Age: ${profile.age}
      - Gender: ${profile.gender}
      - Goals: ${profile.goals.join(', ')}
      ${profile.name ? `- Name: ${profile.name}` : ''}
      
      Format each tip as:
      TITLE: [Short, catchy title]
      DESCRIPTION: [One sentence description, max 20 words]
      CATEGORY: [Primary goal it addresses from the user's goals]
      
      Make tips specific, actionable, and tailored to the user's profile.
      Focus on variety - include different types of activities (physical, mental, dietary, lifestyle).
    `;
  }

  /**
   * Parse AI response into WellnessTip objects
   */
  private parseRecommendations(response: string, goals: WellnessGoal[]): WellnessTip[] {
    const tips: WellnessTip[] = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    let currentTip: Partial<WellnessTip> = {};
    let tipIndex = 0;

    for (const line of lines) {
      if (line.includes('TITLE:')) {
        if (currentTip.title) {
          tips.push(this.createTipObject(currentTip, tipIndex++, goals));
          currentTip = {};
        }
        currentTip.title = line.replace('TITLE:', '').trim();
      } else if (line.includes('DESCRIPTION:')) {
        currentTip.shortDescription = line.replace('DESCRIPTION:', '').trim();
      } else if (line.includes('CATEGORY:')) {
        const category = line.replace('CATEGORY:', '').trim().toLowerCase().replace(/ /g, '-');
        currentTip.category = this.mapToWellnessGoal(category, goals);
      }
    }

    if (currentTip.title) {
      tips.push(this.createTipObject(currentTip, tipIndex, goals));
    }

    // Ensure we have exactly 5 tips
    while (tips.length < 5) {
      tips.push(this.generateFallbackTip(tips.length, goals));
    }

    return tips.slice(0, 5);
  }

  /**
   * Create a complete tip object
   */
  private createTipObject(
    partial: Partial<WellnessTip>, 
    index: number, 
    goals: WellnessGoal[]
  ): WellnessTip {
    const category = partial.category || goals[index % goals.length];
    return {
      id: `tip-${Date.now()}-${index}`,
      title: partial.title || `Wellness Tip ${index + 1}`,
      shortDescription: partial.shortDescription || 'Improve your wellness with this tip',
      category: category,
      icon: WELLNESS_ICONS[category],
      createdAt: new Date(),
      isSaved: false
    };
  }

  /**
   * Map string to WellnessGoal enum
   */
  private mapToWellnessGoal(category: string, goals: WellnessGoal[]): WellnessGoal {
    const goalMap: Record<string, WellnessGoal> = {
      'weight-loss': 'weight-loss',
      'muscle-gain': 'muscle-gain',
      'better-sleep': 'better-sleep',
      'stress-management': 'stress-management',
      'healthy-eating': 'healthy-eating',
      'mental-health': 'mental-health',
      'energy-boost': 'energy-boost',
      'flexibility': 'flexibility',
      'cardiovascular': 'cardiovascular',
      'mindfulness': 'mindfulness'
    };

    return goalMap[category] || goals[0];
  }

  /**
   * Parse detailed explanation from AI response
   */
  private parseDetailedExplanation(response: string): Partial<WellnessTip> {
    try {
      // Try to parse as JSON
      const json = JSON.parse(response);
      return {
        longDescription: json.longDescription,
        steps: json.steps,
        benefits: json.benefits,
        timeRequired: json.timeRequired,
        difficulty: json.difficulty
      };
    } catch {
      // Fallback parsing if not valid JSON
      return {
        longDescription: response,
        steps: [
          'Start with small, manageable changes',
          'Track your progress daily',
          'Be consistent with your practice',
          'Adjust based on your comfort level',
          'Celebrate small victories'
        ],
        benefits: [
          'Improved overall wellness',
          'Better physical and mental health',
          'Increased energy and vitality'
        ],
        timeRequired: '15-30 minutes daily',
        difficulty: 'easy'
      };
    }
  }

  /**
   * Fallback recommendations when AI service fails
   */
  private getFallbackRecommendations(profile: UserProfile): WellnessTip[] {
    const fallbackTips = [
      {
        title: 'Morning Hydration Ritual',
        shortDescription: 'Start your day with 16oz of water',
        category: 'energy-boost' as WellnessGoal
      },
      {
        title: '5-Minute Mindful Breathing',
        shortDescription: 'Practice deep breathing exercises',
        category: 'stress-management' as WellnessGoal
      },
      {
        title: 'Evening Walk Challenge',
        shortDescription: 'Take a 20-minute walk after dinner',
        category: 'cardiovascular' as WellnessGoal
      },
      {
        title: 'Protein-Rich Breakfast',
        shortDescription: 'Include 20g protein in morning meal',
        category: 'healthy-eating' as WellnessGoal
      },
      {
        title: 'Digital Sunset Routine',
        shortDescription: 'No screens 1 hour before bed',
        category: 'better-sleep' as WellnessGoal
      }
    ];

    return fallbackTips.map((tip, index) => ({
      id: `fallback-${Date.now()}-${index}`,
      ...tip,
      icon: WELLNESS_ICONS[tip.category],
      createdAt: new Date(),
      isSaved: false
    }));
  }

  /**
   * Generate a single fallback tip
   */
  private generateFallbackTip(index: number, goals: WellnessGoal[]): WellnessTip {
    const category = goals[index % goals.length];
    return {
      id: `generated-${Date.now()}-${index}`,
      title: `Custom Wellness Tip ${index + 1}`,
      shortDescription: 'Personalized recommendation for your goals',
      category: category,
      icon: WELLNESS_ICONS[category],
      createdAt: new Date(),
      isSaved: false
    };
  }

  /**
   * Fallback detailed explanation
   */
  private getFallbackDetailedExplanation(tip: WellnessTip): WellnessTip {
    return {
      ...tip,
      longDescription: `${tip.title} is an excellent way to improve your wellness. This practice has been shown to have numerous benefits for both physical and mental health. By incorporating this into your daily routine, you can expect to see gradual improvements in your overall well-being.`,
      steps: [
        'Begin with a clear intention and commitment',
        'Start small and build gradually',
        'Track your progress in a journal',
        'Find an accountability partner if possible',
        'Adjust the practice to fit your lifestyle',
        'Be patient and consistent with your efforts'
      ],
      benefits: [
        'Enhanced overall wellness and vitality',
        'Improved physical and mental resilience',
        'Better stress management capabilities',
        'Increased energy throughout the day'
      ],
      timeRequired: '15-30 minutes',
      difficulty: 'easy'
    };
  }
}

export default AIService.getInstance();