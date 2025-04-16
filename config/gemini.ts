const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
// const fs = require("node:fs");
// const mime = require("mime-types");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: process.env.NEXT_PUBLIC_GYANI_PROMPT,
});

const generationConfig = {
  temperature: 0.9,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 2048,
  responseMimeType: "application/json",
};
 export const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {text: process.env.NEXT_PUBLIC_GYANI_PROMPT},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Here's a breakdown of the thought process to create the \"Gyani\" Akinator-like game:\n\n1.  **Understand the Core Request:** The user wants a game like Akinator, called \"Gyani.\" It needs to guess animals, characters (cartoons, movies, actors, politicians, personalities, sportsmen), and things (daily use, electronics, latest objects). The target audience is 8-18 years old, so questions must be kid-friendly and easy. Input is Yes/No/Maybe/Don't Know (Y/N/M/DK). The output should be JSON formatted for questions/options. The game should guess within 25 questions. If successful, it should display the guess and offer to play again. If unsuccessful, it should ask the user for the answer and learn from it (though implementing the learning part is complex in this stateless format, we can simulate the request).\n\n2.  **Identify Key Components:**\n    *   **Game Logic:** A decision-tree-like structure is needed. Start broad, then narrow down based on answers.\n    *   **Question Database:** Need a set of questions relevant to the categories and target audience.\n    *   **Answer Database (Entities):** A list of possible animals, characters, and things the game can guess.\n    *   **State Management:** Keep track of the current question, potential candidates, questions asked, and answers received.\n    *   **Input/Output:** Handle user input (Y/N/M/DK) and format output as JSON.\n    *   **Guessing Mechanism:** Decide when to make a guess based on confidence (e.g., only one candidate left, or a high probability score).\n    *   **Learning Mechanism (Conceptual):** How to handle failed guesses and potentially update the knowledge base (tricky without a persistent backend).\n    *   **Game Flow:** Start, ask questions, process answers, narrow candidates, guess, handle success/failure, play again.\n    *   **Constraints:** 25-question limit, kid-friendly language, JSON format.\n\n3.  **Design the Data Structures:**\n    *   **Entities:** Each potential answer (e.g., \"Elephant,\" \"Spider-Man,\" \"Smartphone\") needs properties/attributes that questions can probe.\n        *   Example `entity`:\n            ```json\n            {\n              \"name\": \"Spider-Man\",\n              \"type\": \"character\",\n              \"subtype\": \"superhero\",\n              \"attributes\": {\n                \"is_real\": false,\n                \"is_human\": true,\n                \"wears_mask\": true,\n                \"has_superpowers\": true,\n                \"is_associated_with_red\": true,\n                \"is_from_movie\": true,\n                \"is_from_cartoon\": true,\n                \"is_male\": true,\n                // ... more attributes\n              }\n            }\n            ```\n    *   **Questions:** Each question should relate to one or more attributes.\n        *   Example `question`:\n            ```json\n            {\n              \"id\": 1,\n              \"text\": \"Is your character real?\",\n              \"attribute\": \"is_real\", // The attribute this question probes\n              \"applies_to\": [\"character\", \"animal\"] // Categories this question is relevant for\n            }\n            ```\n    *   **Game State:** Need to track:\n        *   `possible_entities`: A list of entities that still match the answers given.\n        *   `asked_questions`: A list of question IDs already asked to avoid repetition.\n        *   `question_count`: Number of questions asked so far.\n        *   `current_question`: The question currently being asked.\n\n4.  **Develop the Core Logic (Decision Tree Simulation):**\n    *   **Initialization:** Start with *all* entities as `possible_entities`. Set `question_count` to 0.\n    *   **Question Selection:** Choose the \"best\" next question. What's \"best\"? Ideally, a question that splits the remaining `possible_entities` roughly in half. This maximizes information gain. How to calculate this?\n        *   For each *unasked* question relevant to the remaining entities:\n            *   Count how many entities would remain for 'Yes', 'No'.\n            *   Select the question that provides the most balanced split (minimizes the size of the largest remaining group). (This is the core of algorithms like ID3/C4.5, but we can simplify for this context).\n        *   *Simpler approach for this implementation:* Pre-define a question order or select randomly from relevant, unasked questions. A structured approach is better: Start broad (category, real/fictional), then get more specific.\n    *   **Processing Answers:**\n        *   Get user input (Y/N/M/DK).\n        *   Filter `possible_entities`:\n            *   **Yes:** Keep entities where the relevant attribute is `true`.\n            *   **No:** Keep entities where the relevant attribute is `false`.\n            *   **Maybe/Don't Know:** Keep *all* entities for this question (less filtering, might need more questions). A slightly better approach for 'Maybe' could be to slightly penalize entities where the attribute is definitively true or false, but that adds complexity. For simplicity, treat M/DK as non-filtering for now.\n        *   Increment `question_count`. Add the question ID to `asked_questions`.\n    *   **Guessing Condition:**\n        *   If `len(possible_entities)` becomes 1, guess that entity.\n        *   If `question_count` reaches 25, make a guess based on the most likely candidate(s) if `len(possible_entities)` > 1 (e.g., pick the first one, or randomly).\n        *   If `len(possible_entities)` becomes 0 (contradictory answers), the game has failed.\n    *   **Handling Guess:**\n        *   Ask the user if the guess is correct.\n        *   **Correct:** Display success message, ask to play again.\n        *   **Incorrect:**\n            *   If `question_count` < 25 and there were other possibilities, potentially remove the incorrect guess and continue asking questions.\n            *   If `question_count` >= 25 or no other possibilities, admit defeat. Ask the user for the correct answer. *Simulate learning:* \"Thank you! I will remember [User's Answer] for next time.\" (Actual learning requires backend storage and updating the entity database or decision logic).\n\n5.  **Refine for Target Audience & Constraints:**\n    *   **Kid-Friendly Language:** Use simple words, avoid jargon. \"Is it alive?\" instead of \"Is it biotic?\". \"Does it appear in cartoons?\"\n    *   **JSON Format:** Ensure all interactions (questions, options, results) are structured as JSON.\n    *   **25-Question Limit:** Implement the counter and the guessing logic based on it.\n    *   **Categories:** Ensure questions cover attributes relevant to animals, characters (various types), and things. Start with broad category questions (\"Is it an animal?\", \"Is it a person?\", \"Is it an object/thing?\").\n\n6.  **Structure the Code/Implementation (Conceptual):**\n    *   A main game loop function.\n    *   Functions for:\n        *   `initialize_game()`: Loads entities, resets state.\n        *   `select_next_question()`: Implements the question selection logic.\n        *   `ask_question(question_data)`: Formats and presents the question in JSON.\n        *   `process_answer(answer, current_question)`: Filters `possible_entities`.\n        *   `make_guess()`: Determines if/what to guess.\n        *   `handle_result(guess, correct)`: Manages success/failure/learning prompt.\n        *   `play_again()`: Resets for a new game.\n\n7.  **Build Example Data (Crucial but Time-Consuming):**\n    *   Need a representative starting set of entities with defined attributes. This is the \"knowledge base.\"\n    *   Need a corresponding set of questions linked to these attributes.\n    *   *Self-Correction during thought process:* Initially, I might just think of questions. But it's better to define the *entities* and their *attributes* first, then create questions that *probe* those attributes. This ensures questions are meaningful and help differentiate entities.\n\n8.  **JSON Structure Design:**\n    *   **Question Output:**\n        ```json\n        {\n          \"status\": \"asking\",\n          \"question_number\": 5,\n          \"question_text\": \"Does it fly?\",\n          \"options\": [\"Yes\", \"No\", \"Maybe\", \"I don't know\"]\n        }\n        ```\n    *   **Guess Output:**\n        ```json\n        {\n          \"status\": \"guessing\",\n          \"question_number\": 20,\n          \"guess\": \"Superman\",\n          \"confirmation_prompt\": \"Am I correct? (Yes/No)\"\n        }\n        ```\n    *   **Final Result (Success):**\n        ```json\n        {\n          \"status\": \"finished\",\n          \"result\": \"success\",\n          \"message\": \"Great! I guessed it. You were thinking of Superman.\",\n          \"play_again_prompt\": \"Do you want to play again? (Yes/No)\"\n        }\n        ```\n    *   **Final Result (Failure):**\n        ```json\n        {\n          \"status\": \"finished\",\n          \"result\": \"failure\",\n          \"message\": \"Oops! I couldn't guess it. Who/What were you thinking of?\",\n          \"learn_prompt\": \"Please tell me the answer so I can learn.\"\n        }\n        ```\n     *   **Learning Confirmation:**\n        ```json\n        {\n           \"status\": \"finished\",\n           \"result\": \"learned\", // Or similar status\n           \"message\": \"Thank you! I'll try to remember [User's Answer] for next time.\",\n           \"play_again_prompt\": \"Do you want to play again? (Yes/No)\"\n        }\n        ```\n\n9.  **Simulate a Game Flow (Mental Walkthrough):**\n    *   User thinks of \"Iron Man\".\n    *   Q1: Is it an animal? (No) -> Filter out animals.\n    *   Q2: Is it a real person? (No) -> Filter out real people (actors, politicians). Keep fictional characters, maybe some things.\n    *   Q3: Is it a character from a movie? (Yes) -> Filter out things, non-movie characters.\n    *   Q4: Does your character wear a suit or armor? (Yes) -> Narrows down significantly (Iron Man, Batman, etc.).\n    *   Q5: Is the suit predominantly red? (Yes) -> Narrows down (Iron Man, maybe Flash depending on interpretation).\n    *   Q6: Can your character fly using technology? (Yes) -> Very likely Iron Man.\n    *   ... Continue until only Iron Man remains or confidence is high.\n\n10. **Refine Learning:** Since true dynamic learning is hard here, the \"learning\" step is mostly for user satisfaction. The prompt asks for the answer and gives a confirmation. A real system would need a backend database and logic to update its knowledge.\n\n11. **Final Output Generation:** Assemble the introductory text, the game logic description (even if abstract), and the example JSON interactions based on the design. Emphasize the limitations (no actual learning persistence)."},
          {text: "Okay, I understand! Let's set up the \"Gyani\" game. I will act as the game engine.\n\nI need a starting point. Please think of an **animal, character (cartoon, movie, real person), or a thing (daily use, electronic, etc.)**. Keep it in your mind, and I will start asking questions.\n\nRemember to answer with **Yes (Y)**, **No (N)**, **Maybe (M)**, or **I Don't Know (DK)**.\n\nI will provide the questions and options in JSON format. You will provide your answer (Y/N/M/DK), and I will proceed based on your response.\n\nLet's begin! Think of something... Got it?\n\n**(Game Engine Ready - Waiting for you to confirm you have thought of something)**\n\n**(Once you confirm, I will output the first question in JSON format like this):**\n\n```json\n{\n  \"status\": \"asking\",\n  \"question_number\": 1,\n  \"question_text\": \"Is the thing you are thinking of an animal?\",\n  \"options\": [\"Yes\", \"No\", \"Maybe\", \"I don't know\"]\n}\n```\n\nTell me when you are ready to start!"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "yes"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The user is ready to play \"Gyani\".\nMy goal is to guess the animal, character, or thing they are thinking of within 25 questions using Yes/No/Maybe/I Don't Know answers.\nThe target audience is 8-18 years old, so questions should be simple.\nI need to maintain a state (potential candidates, questions asked, etc.) internally.\nI will start with broad categories and narrow down based on the user's answers.\nThe first question should differentiate between the main categories (Animal, Character, Thing).\n\n**Initial State:**\n*   Possible Categories: Animal, Character, Thing\n*   Questions Asked: 0\n*   Potential Guesses: A vast list covering all categories mentioned in the prompt (worldwide famous cartoons, movies, actors, Hollywood, Bollywood, Indian politicians, famous personalities, sportsmen (cricketers), famous animals, daily use things, electronic things, latest objects). *This list is too large to manage explicitly initially. I'll use properties/attributes.*\n\n**Question 1 Strategy:** Determine the main category.\n\n**JSON Output Format:**\n```json\n{\n  \"status\": \"asking\",\n  \"question_number\": 1,\n  \"question_text\": \"...\",\n  \"options\": [\"Yes\", \"No\", \"Maybe\", \"I don't know\"]\n}\n```\n\nOkay, let's formulate the first question."},
          {text: "Great! Let the Gyani game begin!\n\nHere is your first question:\n\n```json\n{\n  \"status\": \"asking\",\n  \"question_number\": 1,\n  \"question_text\": \"Is the thing you are thinking of alive?\",\n  \"options\": [\"Yes\", \"No\", \"Maybe\", \"I don't know\"]\n}\n```\n\nPlease reply with Y, N, M, or DK."},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "no"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The user answered \"No\" to \"Is the thing you are thinking of alive?\".\nThis eliminates animals and most characters (unless they are fictional robots/objects treated as characters, which we might need to clarify later).\nThe focus now shifts strongly towards \"Things\".\n\nNext question should help narrow down the type of thing. Let's ask about electronics, as that's a common category for kids/teens.\n\nPlan:\n1.  Acknowledge the user's answer.\n2.  Formulate the next question to differentiate types of non-living things.\n3.  Present the question in JSON format."},
          {text: "Okay, noted. It's not alive.\n\nHere is the next question:\n\n```json\n{\n  \"status\": \"asking\",\n  \"question_number\": 2,\n  \"question_text\": \"Is it something you can hold in your hands?\",\n  \"options\": [\"Yes\", \"No\", \"Maybe\", \"I don't know\"]\n}\n```\n\nYour answer? (Y/N/M/DK)"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "no"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The user is thinking of something that is:\n1.  Not alive (from Q1)\n2.  Cannot be held in their hands (from Q2)\n\nThis rules out many small objects. It could be something large, abstract, or a place. Let's try to narrow down the category. Is it electronic?\n\nNext question idea: Is it electronic?\nAlternative: Is it a place?\nAlternative: Is it bigger than a car?\n\nLet's go with electronic first, as that's a common category for non-living things."},
          {text: "Understood. It's not alive and you typically can't hold it in your hands.\n\nLet's continue:\n\n```json\n{\n  \"status\": \"asking\",\n  \"question_number\": 3,\n  \"question_text\": \"Does it need electricity or batteries to work?\",\n  \"options\": [\"Yes\", \"No\", \"Maybe\", \"I don't know\"]\n}\n```\n\nYour answer? (Y/N/M/DK)"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "y"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The user's thought process:\n1.  **Initial thought:** User thinks of something. Let's assume they thought of a **Television (TV)**.\n2.  **Question 1:** \"Is the thing you are thinking of alive?\" - Answer: **No** (TV is not alive).\n3.  **Question 2:** \"Is it something you can hold in your hands?\" - Answer: **No** (A typical TV is too large/heavy to hold easily).\n4.  **Question 3:** \"Does it need electricity or batteries to work?\" - Answer: **Yes** (TV needs electricity).\n\nMy reasoning based on the answers:\n*   **Not alive:** Rules out animals and most characters (unless fictional robots/constructs, but \"alive\" usually implies biological). Focus is now on \"Things\".\n*   **Cannot hold in hands:** Rules out smaller objects like phones, remote controls, toys, tools, etc. Suggests something larger.\n*   **Needs electricity/batteries:** Confirms it's likely an electronic device or appliance.\n\nPossible remaining categories:\n*   Large appliances (Fridge, Washing Machine, Oven)\n*   Large electronics (TV, Computer Monitor, Desktop Computer, Large Speaker System)\n*   Vehicles (Car, Electric Scooter - though some *can* be held indirectly, usually not)\n*   Fixed installations (Traffic light, Streetlight)\n\nNext Question Strategy:\nI need to differentiate between these larger electronic items. A good differentiator is its primary function or location.\n*   Does it show pictures/videos? (Targets TV, Monitor)\n*   Is it used for cooking/cleaning? (Targets appliances)\n*   Is it found mainly indoors? (Helps narrow down location)\n*   Is it related to entertainment?\n\nLet's go with the visual aspect first, as TV is a strong candidate given the answers.\n\n**Proposed Question:** \"Does it have a screen to show pictures or videos?\""},
          {text: "Okay, it's not alive, you can't typically hold it, and it needs power.\n\nHere's the next question:\n\n```json\n{\n  \"status\": \"asking\",\n  \"question_number\": 4,\n  \"question_text\": \"Does it have a screen to show pictures or videos?\",\n  \"options\": [\"Yes\", \"No\", \"Maybe\", \"I don't know\"]\n}\n```\n\nYour answer? (Y/N/M/DK)"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "yes"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The user's object is:\n- Not alive (No to Q1)\n- Cannot be held in hands (typically) (No to Q2)\n- Needs electricity/batteries (Yes to Q3)\n- Has a screen (Yes to Q4)\n\nThis narrows it down considerably. Common items fitting this description include:\n- Television (TV)\n- Computer Monitor\n- Projector (though less common for kids maybe?)\n- Digital Photo Frame (less likely given 'can't hold')\n- Smart Display (like Amazon Echo Show / Google Nest Hub)\n- Maybe a very large tablet/iPad Pro, but \"can't hold\" makes that less likely.\n- ATM machine? (Less likely for a kid's game)\n- Public display screen? (Less likely)\n\nThe most common and likely answer given the age group and characteristics is a Television. Let's try to confirm that.\n\nNext question should differentiate between TV and Computer Monitor/Smart Display. Asking about its primary use (watching shows/movies vs computer work) or size could work. Asking about remote control is also a good differentiator.\n\nLet's ask about its main purpose.\n\nPlan:\nQ5: Is its main purpose for watching movies or TV shows? (Targets TV)\nIf Yes -> Likely TV. Ask a confirming question like \"Is it usually found in the living room?\" or \"Does it use a remote control?\".\nIf No -> Could be Computer Monitor, Smart Display. Ask \"Is it connected to a computer keyboard or mouse?\".\nIf Maybe/DK -> Need more general questions.\n\nLet's go with the main purpose question."},
          {text: "Got it. It's not alive, you can't usually hold it, it needs power, and it has a screen.\n\nOkay, thinking...\n\nHere's question 5:\n\n```json\n{\n  \"status\": \"asking\",\n  \"question_number\": 5,\n  \"question_text\": \"Is its main purpose for watching movies or TV shows?\",\n  \"options\": [\"Yes\", \"No\", \"Maybe\", \"I don't know\"]\n}\n```\n\nYour answer? (Y/N/M/DK)"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "yes"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The user is thinking of something that:\n1.  Is not alive (No to Q1: alive?)\n2.  Cannot be held in hands (No to Q2: hold in hands?)\n3.  Needs electricity/batteries (Yes to Q3: needs power?)\n4.  Has a screen (Yes to Q4: has screen?)\n5.  Main purpose is watching movies/TV shows (Yes to Q5: main purpose watching?)\n\nBased on these answers, the most likely candidate is a **Television (TV)**. Other possibilities could be a Projector, but a TV is much more common and fits the \"can't hold in hands\" criteria better for most models. A computer monitor could fit, but its *main* purpose isn't *just* watching movies/shows, though it can be used for it. A cinema screen also fits, but less likely for a user to think of. A TV seems the strongest guess.\n\nLet's try to confirm.\n\nNext question idea: Is it usually found in a living room or bedroom? (Confirms TV placement)\nAlternative: Is it something most families have in their home? (Confirms commonality)\nAlternative: Can you use a remote control with it? (Confirms TV interaction)\n\nLet's go with the remote control question, as it's quite specific to TVs and similar devices."},
          {text: "Okay, it's not alive, generally not handheld, needs power, has a screen, and its main purpose is watching movies or shows.\n\nGetting closer...\n\nHere's question 6:\n\n```json\n{\n  \"status\": \"asking\",\n  \"question_number\": 6,\n  \"question_text\": \"Do you usually use a remote control to operate it?\",\n  \"options\": [\"Yes\", \"No\", \"Maybe\", \"I don't know\"]\n}\n```\n\nYour answer? (Y/N/M/DK)"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "yes"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The user is thinking of something that:\n1.  Is not alive (Answer to Q1: No)\n2.  Is not usually held in hands (Answer to Q2: No)\n3.  Needs electricity or batteries (Answer to Q3: Yes)\n4.  Has a screen (Answer to Q4: Yes)\n5.  Main purpose is watching movies/TV shows (Answer to Q5: Yes)\n6.  Uses a remote control (Answer to Q6: Yes)\n\nBased on these characteristics, the most likely object is a Television (TV). Other possibilities might include a projector, but TV is much more common and fits all criteria perfectly, especially for the target age group. A computer monitor could fit some, but its *main* purpose isn't usually just watching movies/shows. A smart display is a possibility but less common than a TV.\n\nI should probably ask one or two more questions to confirm or differentiate, but TV seems highly probable.\n\nLet's try to narrow it down further or confirm. Maybe ask about size or location.\n\nOkay, I think I have a strong guess. Let's make the guess."},
          {text: "Okay, putting the clues together:\n*   Not alive\n*   Not usually held in your hands\n*   Needs power\n*   Has a screen\n*   Main purpose is watching movies/TV shows\n*   Uses a remote control\n\nI think I know what you're thinking of!\n\n```json\n{\n  \"status\": \"guessing\",\n  \"guess_number\": 1,\n  \"guess_text\": \"Television (TV)\"\n}\n```\n\nAm I right? Is the thing you are thinking of a **Television (TV)**?\n\n(Yes/No)"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "yes"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The user confirmed my guess is correct.\nThe game is successful.\nI need to output the success message and ask if the user wants to play again, formatted in JSON.\n\n1.  **Acknowledge the correct guess:** State that the guess was right.\n2.  **Format the success message:** \"You are thinking of [Answer]\".\n3.  **Add the \"Play Again?\" option:** Ask if the user wants to start a new game.\n4.  **Structure in JSON:**\n    *   `status`: \"finished\"\n    *   `result`: \"success\"\n    *   `message`: \"Hooray! I guessed it right! You are thinking of Television (TV).\"\n    *   `play_again_prompt`: \"Do you want to play again? (Yes/No)\""},
          {text: "Excellent! I got it right!\n\n```json\n{\n  \"status\": \"finished\",\n  \"result\": \"success\",\n  \"message\": \"Hooray! I guessed it right! You are thinking of Television (TV).\",\n  \"play_again_prompt\": \"Do you want to play again? (Yes/No)\"\n}\n```\n\nWould you like to play another round? (Yes/No)"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "no"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "The user wants to end the game. I should acknowledge their decision and provide a polite closing message.\n\n1.  **Acknowledge the user's choice:** The user said \"No\" to playing again.\n2.  **Provide a closing message:** Thank the user for playing and perhaps invite them to play again later.\n3.  **Format the output:** Ensure the output is clear and maybe fits the \"Gyani\" persona slightly."},
          {text: "```json\n{\n  \"status\": \"end_game\",\n  \"message\": \"Okay, thank you for playing Gyani! It was fun trying to guess what you were thinking. Come back anytime you want to challenge me again!\",\n  \"goodbye\": true\n}\n```\n\nIt was fun playing with you! See you next time!"},
        ],
      },
    ],
  });
