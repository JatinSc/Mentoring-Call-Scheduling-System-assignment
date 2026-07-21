const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function getMentorRecommendations(user, mentors, callType) {
    const mentorData = mentors.map((mentor) => ({
        id: mentor._id.toString(),
        name: mentor.name,
        company: mentor.company,
        designation: mentor.designation,
        experience: mentor.experience,
        expertise: mentor.expertise || [],
        tags: mentor.tags || [],
        description: mentor.description || "",
    }));

    const userData = {
        name: user.name,
        skills: user.skills || [],
        tags: user.tags || [],
        description: user.description || "",
    };

    const prompt = `
You are an AI Mentor Recommendation Engine.

Your task is to recommend ONLY the best 3 mentors.

User:
${JSON.stringify(userData, null, 2)}

Call Type:
${callType}

Mentors:
${JSON.stringify(mentorData, null, 2)}

Evaluation Rules

Resume Revamp
- Prefer Big Tech mentors.
- Prefer resume reviewing experience.

Mock Interview
- Prefer same domain.
- Prefer matching expertise.
- Prefer senior mentors.

Job Market Guidance
- Prefer mentors with strong communication.
- Prefer hiring experience.

Return ONLY valid JSON.

{
  "recommendations":[
    {
      "mentorId":"...",
      "score":96,
      "reason":"..."
    }
  ]
}
`;

    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    const data = await response.json();

    let text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsed = JSON.parse(text);

    return parsed.recommendations.map((item) => ({
        mentor: mentors.find(
            (m) => m._id.toString() === item.mentorId
        ),
        score: item.score,
        reasons: [item.reason],
    }));
}





// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY,
// });

// export async function getMentorRecommendations(user, mentors, callType) {
//     const mentorData = mentors.map((mentor) => ({
//         id: mentor._id.toString(),
//         name: mentor.name,
//         company: mentor.company,
//         designation: mentor.designation,
//         experience: mentor.experience,
//         expertise: mentor.expertise || [],
//         tags: mentor.tags || [],
//         description: mentor.description || "",
//     }));

//     const userData = {
//         name: user.name,
//         skills: user.skills || [],
//         tags: user.tags || [],
//         description: user.description || "",
//     };



//     const response = await ai.models.generateContent({
//         model: "gemini-2.0-flash", // <-- Updated model
//         contents: prompt,
//     });

//     let text = response.text;

//     // Remove markdown if Gemini returns it
//     text = text
//         .replace(/```json/gi, "")
//         .replace(/```/g, "")
//         .trim();

//     // Extract JSON safely
//     const start = text.indexOf("{");
//     const end = text.lastIndexOf("}");

//     if (start === -1 || end === -1) {
//         throw new Error("Gemini did not return valid JSON");
//     }

//     text = text.substring(start, end + 1);

//     const parsed = JSON.parse(text);

//     return parsed.recommendations.map((item) => ({
//         mentor: mentors.find(
//             (m) => m._id.toString() === item.mentorId
//         ),
//         score: item.score,
//         reasons: [item.reason],
//     }));
// }