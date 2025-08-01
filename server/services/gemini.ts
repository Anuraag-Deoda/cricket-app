import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

interface CommentaryContext {
  runs: number;
  isWicket: boolean;
  batsmanName?: string;
  bowlerName?: string;
  context?: string;
  over?: string;
  matchSituation?: string;
}

export async function generateCricketCommentary(context: CommentaryContext): Promise<string> {
  try {
    const { runs, isWicket, batsmanName = "Batsman", bowlerName = "Bowler", matchSituation = "" } = context;
    
    let prompt = "";
    
    if (isWicket) {
      prompt = `Generate an energetic Hindi cricket commentary for a wicket. The batsman ${batsmanName} got out. 
      Use Akash Chopra style commentary - witty, energetic, modern desi language with some English words mixed in. 
      Make it metaphorical and engaging. Keep it under 40 words. ${matchSituation}`;
    } else if (runs === 6) {
      prompt = `Generate an energetic Hindi cricket commentary for a SIX hit by ${batsmanName} off ${bowlerName}. 
      Use Akash Chopra style - witty, energetic, modern desi language with English mixed in. 
      Use metaphors and excitement. Keep it under 40 words. ${matchSituation}`;
    } else if (runs === 4) {
      prompt = `Generate an energetic Hindi cricket commentary for a FOUR hit by ${batsmanName} off ${bowlerName}. 
      Use Akash Chopra style - witty, energetic, modern desi language with English mixed in. 
      Use metaphors like "textbook", "TED Talk", etc. Keep it under 40 words. ${matchSituation}`;
    } else if (runs === 0) {
      prompt = `Generate Hindi cricket commentary for a dot ball by ${bowlerName} to ${batsmanName}. 
      Use Akash Chopra style - engaging, modern desi language. 
      Mention good bowling or defensive batting. Keep it under 30 words. ${matchSituation}`;
    } else {
      prompt = `Generate Hindi cricket commentary for ${runs} run(s) scored by ${batsmanName} off ${bowlerName}. 
      Use Akash Chopra style - energetic, modern desi language with English mixed in. 
      Keep it engaging and under 35 words. ${matchSituation}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let commentary = response.text || "Kya shot tha yeh!";
    
    // Clean up the commentary - remove quotes if present
    commentary = commentary.replace(/^["']|["']$/g, '').trim();
    
    return commentary;
    
  } catch (error) {
    console.error("Failed to generate cricket commentary:", error);
    
    // Fallback commentary based on context
    const { runs, isWicket } = context;
    
    if (isWicket) {
      return "Wicket! Kya bowling tha yeh!";
    } else if (runs === 6) {
      return "SIX! Ball toh gaya stadium ke baahar!";
    } else if (runs === 4) {
      return "FOUR! Kya timing, kya placement!";
    } else if (runs === 0) {
      return "Dot ball! Bowler ka control perfect hai.";
    } else {
      return `${runs} run${runs !== 1 ? 's' : ''}! Accha shot tha.`;
    }
  }
}

export async function generateMatchSummary(matchData: {
  totalRuns: number;
  totalWickets: number;
  overs: number;
  topScorer?: string;
  topBowler?: string;
  result?: string;
}): Promise<string> {
  try {
    const { totalRuns, totalWickets, overs, topScorer, topBowler, result } = matchData;
    
    const prompt = `Generate a Hindi match summary for a cricket match. 
    Score: ${totalRuns}/${totalWickets} in ${overs} overs.
    ${topScorer ? `Top scorer: ${topScorer}` : ''}
    ${topBowler ? `Best bowler: ${topBowler}` : ''}
    ${result ? `Result: ${result}` : ''}
    
    Use Akash Chopra style commentary - energetic, modern Hindi-English mix. 
    Summarize the key highlights in 2-3 sentences. Keep it under 100 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Kya match tha! Pura entertainment package!";
    
  } catch (error) {
    console.error("Failed to generate match summary:", error);
    return "Kya match tha! Cricket ke fans ke liye perfect entertainment!";
  }
}

export async function generateManOfTheMatch(playerStats: {
  playerName: string;
  runs?: number;
  wickets?: number;
  catches?: number;
  keyMoments?: string[];
}): Promise<{ playerName: string; reasoning: string; highlightMoment: string }> {
  try {
    const { playerName, runs = 0, wickets = 0, catches = 0, keyMoments = [] } = playerStats;
    
    const prompt = `Generate a Man of the Match analysis in Hindi-English mix for ${playerName}.
    Stats: ${runs} runs, ${wickets} wickets, ${catches} catches.
    Key moments: ${keyMoments.join(', ')}
    
    Provide reasoning why they deserve Man of the Match in Akash Chopra style.
    Also mention their best moment. Use energetic Hindi-English commentary style.
    Return as JSON with fields: reasoning, highlightMoment`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            reasoning: { type: "string" },
            highlightMoment: { type: "string" }
          },
          required: ["reasoning", "highlightMoment"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || '{}');
    
    return {
      playerName: playerStats.playerName,
      reasoning: result.reasoning || `${playerStats.playerName} ka performance outstanding tha! Total domination!`,
      highlightMoment: result.highlightMoment || "Match turning performance!"
    };
    
  } catch (error) {
    console.error("Failed to generate Man of the Match:", error);
    return {
      playerName: playerStats.playerName,
      reasoning: `${playerStats.playerName} ka performance aaj kamaal ka tha! Pura match unhi ne control kiya.`,
      highlightMoment: "Outstanding all-round performance!"
    };
  }
}
