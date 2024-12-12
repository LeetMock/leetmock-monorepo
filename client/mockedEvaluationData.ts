export const evaluationData = {
  "sessionId": "sess_123456789",
  "interviewType": "coding",
  "overallFeedback": "The candidate demonstrated strong problem-solving skills and good communication throughout the interview. They showed a solid understanding of data structures and algorithms, but there's room for improvement in code optimization and test case design.",
  "totalScore": 85,
  "codeContent": "function solution(arr) {\n  // Sort the array in ascending order\n  arr.sort((a, b) => a - b);\n\n  // Initialize variables\n  let maxCount = 1;\n  let currentCount = 1;\n  let mostFrequent = arr[0];\n\n  // Iterate through the array\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] === arr[i - 1]) {\n      currentCount++;\n    } else {\n      if (currentCount > maxCount) {\n        maxCount = currentCount;\n        mostFrequent = arr[i - 1];\n      }\n      currentCount = 1;\n    }\n  }\n\n  // Check the last element\n  if (currentCount > maxCount) {\n    mostFrequent = arr[arr.length - 1];\n  }\n\n  return mostFrequent;\n}",
  "questionId": "q_987654321",
  "scoreboards": {
    "communication": {
      "clarification": {
        "description": "Ability to ask relevant questions and seek clarification when needed",
        "maxScore": 10,
        "comment": "The candidate asked insightful questions about edge cases and input constraints, demonstrating a strong ability to clarify requirements.",
        "examples": [
          "Asked about handling empty arrays",
          "Clarified the expected behavior for arrays with multiple modes",
          "Inquired about the range of input values"
        ],
        "score": 9
      },
      "thoughtProcess": {
        "description": "Clarity and coherence in explaining thought process and decision-making",
        "maxScore": 10,
        "comment": "The candidate's explanation of their approach was clear, but they could have provided more insight into why they chose their specific implementation.",
        "examples": [
          "Explained the choice of sorting algorithm",
          "Could have elaborated more on alternative approaches considered",
          "Discussed time and space complexity trade-offs"
        ],
        "score": 7
      }
    },
    "problemSolving": {
      "optimalSolution": {
        "description": "Ability to identify and implement the most efficient solution",
        "maxScore": 10,
        "comment": "The candidate's solution was correct but not optimal. They could have used a hash map to achieve O(n) time complexity instead of the O(n log n) sorting approach.",
        "examples": [
          "Implemented a working solution using sorting",
          "Missed the opportunity to use a more efficient hash map approach",
          "Correctly identified the need to handle ties in frequency"
        ],
        "score": 7
      },
      "optimizationProcess": {
        "description": "Skill in refining and improving the initial solution",
        "maxScore": 10,
        "comment": "The candidate made some optimizations to their initial approach but didn't explore more efficient alternatives thoroughly.",
        "examples": [
          "Optimized the sorting step by using a built-in method",
          "Improved space complexity by using in-place sorting",
          "Could have explored using a hash map for better time complexity"
        ],
        "score": 7
      },
      "questionSpecific": {
        "description": "Understanding and addressing the specific requirements of the problem",
        "maxScore": 10,
        "comment": "The candidate demonstrated a good understanding of the problem and implemented a solution that correctly handles all required cases.",
        "examples": [
          "Correctly handled arrays with multiple modes",
          "Properly dealt with negative numbers and zero",
          "Ensured the solution works for arrays of any size"
        ],
        "score": 9
      }
    },
    "technicalCompetency": {
      "syntaxError": {
        "description": "Ability to write code without syntax errors",
        "maxScore": 10,
        "comment": "The candidate's code was free of syntax errors, demonstrating a strong command of JavaScript syntax.",
        "examples": [
          "Correctly used arrow functions",
          "Proper use of array methods",
          "No issues with variable declarations or scoping"
        ],
        "score": 10
      },
      "codeQuality": {
        "description": "Cleanliness, readability, and maintainability of the code",
        "maxScore": 10,
        "comment": "The code was generally clean and readable, but could benefit from more comments and better variable naming.",
        "examples": [
          "Good use of meaningful variable names like 'maxCount' and 'currentCount'",
          "Could have added more comments explaining the logic",
          "Consistent indentation and formatting"
        ],
        "score": 8
      },
      "codingSpeed": {
        "description": "Efficiency in writing code and implementing solutions",
        "maxScore": 10,
        "comment": "The candidate wrote code at a moderate pace, taking time to think through their approach before implementation.",
        "examples": [
          "Implemented the sorting solution within a reasonable timeframe",
          "Took some time to consider edge cases before coding",
          "Could have been quicker in recognizing the potential for a hash map solution"
        ],
        "score": 7
      }
    },
    "testing": {
      "testCaseCoverage": {
        "description": "Thoroughness in covering various scenarios with test cases",
        "maxScore": 10,
        "comment": "The candidate provided a good range of test cases, but missed some important edge cases.",
        "examples": [
          "Tested with arrays of different sizes",
          "Included a test case for arrays with multiple modes",
          "Missed testing with an empty array and very large arrays"
        ],
        "score": 7
      },
      "debugging": {
        "description": "Skill in identifying and fixing issues in the code",
        "maxScore": 10,
        "comment": "The candidate showed good debugging skills when faced with an issue, quickly identifying and resolving the problem.",
        "examples": [
          "Quickly identified an off-by-one error in the loop",
          "Used console.log effectively to trace variable values",
          "Systematically worked through the code to find the source of a bug"
        ],
        "score": 8
      },
      "testCaseDesign": {
        "description": "Ability to design comprehensive and effective test cases",
        "maxScore": 10,
        "comment": "The candidate's test case design was adequate but could have been more comprehensive.",
        "examples": [
          "Designed test cases for basic functionality",
          "Included some edge cases like arrays with all same elements",
          "Could have designed more test cases for performance testing and very large inputs"
        ],
        "score": 7
      }
    }
  },
  criteria: [
    {
      id: 1,
      description: "Understood the problem requirements clearly",
      met: true,
      importance: "critical",
    },
    {
      id: 2,
      description: "Considered edge cases before implementation",
      met: true,
      importance: "high",
    },
    {
      id: 3,
      description: "Implemented an optimal solution (Time/Space complexity)",
      met: false,
      importance: "critical",
    },
    {
      id: 4,
      description: "Used appropriate data structures",
      met: true,
      importance: "high",
    },
    {
      id: 5,
      description: "Code is well-structured and readable",
      met: true,
      importance: "medium",
    },
    {
      id: 6,
      description: "Proper variable naming and conventions",
      met: true,
      importance: "medium",
    },
    {
      id: 7,
      description: "Implemented error handling",
      met: false,
      importance: "medium",
    },
    {
      id: 8,
      description: "Wrote comprehensive test cases",
      met: false,
      importance: "high",
    }
  ],
  statistics: {
    timeMetrics: {
      totalDuration: "45:23", // 45 minutes 23 seconds
      averageResponseTime: "2:15", // 2 minutes 15 seconds per question
      timeSpentOnProblemUnderstanding: "8:45",
      timeSpentOnCoding: "28:12",
      timeSpentOnTesting: "8:26",
    },
    interactionMetrics: {
      clarifyingQuestions: {
        count: 5,
        quality: 4.2, // out of 5
        examples: [
          "What should be returned when the input array is empty?",
          "Should we handle negative numbers?",
          "What's the expected behavior for duplicate elements?",
        ]
      },
      followUpQuestions: {
        totalAsked: 8,
        correctlyAnswered: 6,
        examples: [
          {
            question: "What's the time complexity of your solution?",
            response: "O(n log n) due to the sorting operation",
            wasCorrect: true
          },
          {
            question: "How would you optimize this for space complexity?",
            response: "We could modify the input array directly",
            wasCorrect: true
          },
          {
            question: "Can you think of an O(n) solution?",
            response: "Not sure, maybe using two pointers?",
            wasCorrect: false
          }
        ]
      }
    },
    codeMetrics: {
      linesOfCode: 32,
      commentLines: 5,
      syntaxErrors: 2,
      timesToCompile: 4,
      testCases: {
        total: 12,
        passed: 10,
        failed: 2,
        coverage: 85, // percentage
      },
      debuggingInstances: 3,
      timeSpentDebugging: "5:45"
    },
    behavioralMetrics: {
      stressHandling: 4.5, // out of 5
      problemSolvingApproach: {
        brainstorming: true,
        pseudocodeFirst: true,
        testDrivenDevelopment: false,
        incrementalDevelopment: true
      },
      communicationClarity: 4.2, // out of 5
      technicalArticulation: 3.8 // out of 5
    }
  }
};