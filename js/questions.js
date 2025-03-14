const questions = [
    {
        question: "How has social media affected mental health in teenagers?",
        options: [
            "Improved self-esteem and social connections",
            "Increased anxiety and depression rates",
            "No significant impact on mental health",
            "Only affected physical health"
        ],
        correct: 1,
        difficulty: "medium"
    },
    {
        question: "What is the main impact of artificial intelligence on healthcare?",
        options: [
            "Reduced doctor-patient relationships",
            "Improved disease diagnosis and treatment planning",
            "Increased healthcare costs",
            "Decreased medical accuracy"
        ],
        correct: 1,
        difficulty: "hard"
    },
    {
        question: "How has remote work technology changed family dynamics?",
        options: [
            "Decreased work-life balance",
            "Improved work-life integration",
            "No impact on family life",
            "Increased commuting time"
        ],
        correct: 1,
        difficulty: "easy"
    },
    {
        question: "What is the primary environmental impact of cryptocurrency mining?",
        options: [
            "Reduced carbon emissions",
            "Significant energy consumption",
            "Improved air quality",
            "Decreased electronic waste"
        ],
        correct: 1,
        difficulty: "medium"
    },
    {
        question: "How has educational technology affected learning outcomes?",
        options: [
            "Decreased student engagement",
            "Enabled personalized learning experiences",
            "Eliminated traditional teaching methods",
            "Reduced academic performance"
        ],
        correct: 1,
        difficulty: "easy"
    },
    {
        question: "What is the main privacy concern with smart home devices?",
        options: [
            "High electricity costs",
            "Collection and sharing of personal data",
            "Complex installation process",
            "Limited functionality"
        ],
        correct: 1,
        difficulty: "medium"
    },
    {
        question: "How has streaming technology impacted traditional media?",
        options: [
            "Increased cable TV subscriptions",
            "Transformed content consumption habits",
            "Improved traditional TV ratings",
            "Reduced internet usage"
        ],
        correct: 1,
        difficulty: "easy"
    },
    {
        question: "What is the primary impact of automation on employment?",
        options: [
            "Created more jobs than replaced",
            "Eliminated all manual labor",
            "Only affected manufacturing",
            "No impact on job market"
        ],
        correct: 0,
        difficulty: "hard"
    },
    {
        question: "How has mobile technology affected social interactions?",
        options: [
            "Increased face-to-face communication",
            "Changed communication patterns and etiquette",
            "Eliminated social media use",
            "Improved physical activity"
        ],
        correct: 1,
        difficulty: "medium"
    },
    {
        question: "What is the main impact of virtual reality on education?",
        options: [
            "Replaced all traditional classrooms",
            "Enabled immersive learning experiences",
            "Reduced student engagement",
            "Increased textbook sales"
        ],
        correct: 1,
        difficulty: "hard"
    },
    {
        question: "How has e-commerce affected local businesses?",
        options: [
            "Increased local shopping",
            "Created both challenges and opportunities",
            "Eliminated all local stores",
            "No impact on local economy"
        ],
        correct: 1,
        difficulty: "easy"
    },
    {
        question: "What is the primary impact of social media on political discourse?",
        options: [
            "Improved political understanding",
            "Polarized public opinion",
            "Reduced political engagement",
            "Eliminated fake news"
        ],
        correct: 1,
        difficulty: "hard"
    },
    {
        question: "How has technology affected human attention spans?",
        options: [
            "Increased focus duration",
            "Decreased sustained attention",
            "No impact on attention",
            "Improved memory retention"
        ],
        correct: 1,
        difficulty: "medium"
    },
    {
        question: "What is the main impact of ride-sharing apps on transportation?",
        options: [
            "Increased public transit use",
            "Transformed urban mobility patterns",
            "Reduced car ownership",
            "Improved traffic congestion"
        ],
        correct: 1,
        difficulty: "easy"
    },
    {
        question: "How has digital technology affected traditional art forms?",
        options: [
            "Eliminated traditional art",
            "Created new artistic possibilities",
            "Reduced artistic creativity",
            "Decreased art appreciation"
        ],
        correct: 1,
        difficulty: "medium"
    },
    {
        question: "What is the primary impact of 5G technology on society?",
        options: [
            "Decreased internet speeds",
            "Enabled new applications like remote surgery",
            "Reduced mobile connectivity",
            "Increased energy consumption"
        ],
        correct: 1,
        difficulty: "hard"
    },
    {
        question: "How has cloud computing transformed business operations?",
        options: [
            "Increased physical storage needs",
            "Reduced flexibility and scalability",
            "Enabled remote work and global collaboration",
            "Decreased data security"
        ],
        correct: 2,
        difficulty: "medium"
    },
    {
        question: "What is the main impact of artificial intelligence on creative industries?",
        options: [
            "Eliminated human creativity",
            "Enhanced creative possibilities",
            "Reduced artistic quality",
            "Decreased job opportunities"
        ],
        correct: 1,
        difficulty: "hard"
    },
    {
        question: "How has technology affected human memory?",
        options: [
            "Improved long-term memory",
            "Changed how we store and retrieve information",
            "Eliminated the need for memory",
            "Reduced cognitive abilities"
        ],
        correct: 1,
        difficulty: "medium"
    },
    {
        question: "What is the primary impact of wearable technology on health?",
        options: [
            "Decreased physical activity",
            "Enabled better health monitoring",
            "Increased healthcare costs",
            "Reduced doctor visits"
        ],
        correct: 1,
        difficulty: "easy"
    }
];

// Add wild card questions - mix of very easy and very challenging
const wildCardQuestions = [
    {
        question: "What is the most basic form of digital data?",
        options: [
            "Binary (1s and 0s)",
            "Text files",
            "Images",
            "Sound waves"
        ],
        correct: 0,
        difficulty: "easy"
    },
    {
        question: "What complex ethical implications arise from the development of autonomous weapons systems powered by AI?",
        options: [
            "Only maintenance costs matter",
            "The intersection of machine decision-making in warfare, accountability, and human rights",
            "Just the technical specifications",
            "Only the manufacturing process"
        ],
        correct: 1,
        difficulty: "hard"
    },
    {
        question: "What does 'www' stand for in a website address?",
        options: [
            "World Wide Web",
            "World Web Width",
            "Wide World Web",
            "Web World Wide"
        ],
        correct: 0,
        difficulty: "easy"
    },
    {
        question: "Analyze the potential societal implications of quantum computing on current cryptography and data security.",
        options: [
            "Only affects computer speed",
            "No significant impact",
            "Could render current encryption methods obsolete and reshape digital security paradigms",
            "Just makes computers smaller"
        ],
        correct: 2,
        difficulty: "hard"
    }
];

// Keep track of used questions
let usedQuestions = [];
let usedWildCardQuestions = [];

// Modified function to get random question
function getRandomQuestion(isWildCard = false, difficulty = null) {
    const questionSet = isWildCard ? wildCardQuestions : questions;
    let availableQuestions = questionSet;

    // Filter questions by difficulty if specified
    if (difficulty) {
        availableQuestions = questionSet.filter(q => q.difficulty === difficulty);
    }

    // If no questions available for the selected difficulty, return null
    if (availableQuestions.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
}