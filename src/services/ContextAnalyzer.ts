// src/services/ContextAnalyzer.ts

export interface ExtractedContext {
    topics: string[];
    concerns: string[];
    achievements: string[];
    people: string[];
    patterns: string[];
    recentActivity: string[];
}

export class ContextAnalyzer {
    analyzeConversation(messages: any[]): ExtractedContext {
          const context: ExtractedContext = {
                  topics: [],
                  concerns: [],
                  achievements: [],
                  people: [],
                  patterns: [],
                  recentActivity: []
          };

      const recentMessages = messages.slice(-20);

      recentMessages.forEach((msg) => {
              if (msg.role === "user") {
                        const lower = msg.content.toLowerCase();

                // Extract topics
                if (lower.includes("clinic") || lower.includes("patient")) {
                            this.addUnique(context.topics, "work:clinic");
                }
                        if (lower.includes("football") || lower.includes("coach")) {
                                    this.addUnique(context.topics, "sports:football");
                        }
                        if (lower.includes("5k") || lower.includes("run")) {
                                    this.addUnique(context.topics, "fitness:running");
                        }
                        if (lower.includes("exercise") || lower.includes("mobility")) {
                                    this.addUnique(context.topics, "movement:exercise");
                        }

                // Extract concerns (body-related)
                if (lower.includes("back")) {
                            this.addUnique(context.concerns, "back_tightness");
                }
                        if (lower.includes("neck")) {
                                    this.addUnique(context.concerns, "neck_tension");
                        }
                        if (lower.includes("hip")) {
                                    this.addUnique(context.concerns, "hip_mobility");
                        }
                        if (lower.includes("shoulder")) {
                                    this.addUnique(context.concerns, "shoulder_tension");
                        }
                        if (lower.includes("pain")) {
                                    this.addUnique(context.concerns, "pain");
                        }

                // Extract emotional concerns
                if (lower.includes("tired") || lower.includes("exhausted")) {
                            this.addUnique(context.concerns, "fatigue");
                }
                        if (lower.includes("stress")) {
                                    this.addUnique(context.concerns, "stress");
                        }
                        if (lower.includes("busy")) {
                                    this.addUnique(context.concerns, "busy_schedule");
                        }

                // Extract achievements
                if (lower.includes("did") || lower.includes("completed") || lower.includes("finished")) {
                            if (lower.includes("exercise") || lower.includes("mobility") || lower.includes("workout")) {
                                          this.addUnique(context.achievements, "completed_movement");
                            }
                }
                        if (lower.includes("long shift") || lower.includes("12 hour")) {
                                    this.addUnique(context.achievements, "long_work_shift");
                        }

                // Extract people mentioned
                if (lower.includes("kid") || lower.includes("daughter") || lower.includes("son")) {
                            this.addUnique(context.people, "child");
                }
                        if (lower.includes("wife") || lower.includes("husband") || lower.includes("partner")) {
                                    this.addUnique(context.people, "partner");
                        }

                // Extract patterns
                if (lower.includes("usually") || lower.includes("always") || lower.includes("every")) {
                            this.addUnique(context.patterns, "routine");
                }

                // Track recent activity
                this.addUnique(context.recentActivity, msg.content.substring(0, 50));
              }
      });

      return context;
    }

  private addUnique(array: string[], item: string): void {
        if (!array.includes(item)) {
                array.push(item);
        }
  }

  shouldSendMessage(lastMessageTime: Date): boolean {
        const now = new Date();
        const minutesSinceLastMessage = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60);

      // Send message between 30-120 minutes after last interaction
      // Add randomness so it doesn't feel automated
      const randomDelay = Math.random() * 90 + 30;

      return minutesSinceLastMessage >= randomDelay;
  }

  getRandomTimeToNextMessage(): number {
        // Random time between 30-120 minutes
      return Math.floor(Math.random() * 90 + 30) * 60 * 1000;
  }
}
