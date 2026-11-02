// =============================================================
//  SkillQuest — Seed / Mock Data
//  ─────────────────────────────────────────────────────────────
//  This file provides the initial data that populates the
//  in-memory "database" when the server first starts.
//
//  It exports six arrays:
//    INITIAL_SKILLS      — The skill catalog shown on the Explore page
//    INITIAL_USERS       — Sample student profiles (with skills, badges, etc.)
//    INITIAL_EXCHANGES   — Pre-seeded skill exchange records
//    INITIAL_QUESTS      — Daily / weekly quests available on start
//    INITIAL_ACHIEVEMENTS — Achievement templates cloned per new user
//    INITIAL_REVIEWS     — Sample peer reviews
//
//  To add a new sample student:
//    1. Create a new User object in INITIAL_USERS following the existing pattern
//    2. Give them skills from INITIAL_SKILLS categories
//    3. The matching algorithm will automatically pick them up
//
//  NOTE: All changes here only take effect after restarting the server,
//        since the server deep-clones these arrays on startup.
// =============================================================

import { User, SkillItem, SkillExchange, Quest, Achievement, Review } from '../types';

export const INITIAL_SKILLS: SkillItem[] = [
  {
    id: 'skill-react',
    name: 'React & Next.js',
    category: 'Web Development',
    icon: 'Atom',
    description: 'Frontend state management, Hooks, Server Components, SSR & dynamic web applications.',
    popularTopics: ['Custom Hooks', 'App Router', 'Zustand / Redux', 'Server Actions', 'Tailwind'],
    totalTutors: 18,
    totalLearners: 42,
    difficulty: 'Intermediate',
    youtubePlaylists: [
      {
        id: 'yt-react-fcc',
        title: 'React JS Complete Course & Projects',
        channelName: 'freeCodeCamp.org',
        playlistUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        videoCount: 'Full Course',
        duration: '12 Hours',
        badge: 'Best for Beginners',
        description: 'Comprehensive introduction to modern React: Components, JSX, Hooks (useState, useEffect), and building responsive web apps.',
        keyTopics: ['Component State', 'Hooks Deep Dive', 'Props & Events', 'Single Page Apps']
      },
      {
        id: 'yt-react-chai',
        title: 'Chai aur React Series (Complete in Hindi)',
        channelName: 'Chai aur Code (Hitesh Choudhary)',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige',
        videoCount: '22 Videos',
        duration: '14 Hours',
        badge: 'Best in Hindi',
        description: 'Under-the-hood React mechanics: Virtual DOM, React Fiber, custom hooks, Context API, and modern Redux Toolkit.',
        keyTopics: ['Virtual DOM & Fiber', 'Custom Hooks', 'Context API', 'Redux Toolkit']
      },
      {
        id: 'yt-nextjs-codevol',
        title: 'Next.js 14 / 15 Tutorial for Beginners',
        channelName: 'Codevolution',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLC3y8-rFHvwjOKd6gdf4QtV1uYNiQnQUI',
        videoCount: '90+ Videos',
        duration: '18 Hours',
        badge: 'Most Comprehensive',
        description: 'Master Next.js App Router, React Server Components (RSC), Client Components, Server Actions, and full-stack API routes.',
        keyTopics: ['App Router', 'Server Components', 'Server Actions', 'SSR & Static Generation']
      }
    ]
  },
  {
    id: 'skill-dsa-cpp',
    name: 'DSA in C++ & Java',
    category: 'Data Structures & Algorithms',
    icon: 'Code2',
    description: 'Tree traversal, Dynamic Programming, Graphs, Tries, and LeetCode problem solving.',
    popularTopics: ['DP on Grids', 'Graph BFS/DFS', 'Segment Trees', 'Sliding Window', 'Binary Search'],
    totalTutors: 25,
    totalLearners: 64,
    difficulty: 'Advanced',
    youtubePlaylists: [
      {
        id: 'yt-dsa-striver',
        title: 'A2Z DSA Course / Striver SDE Sheet',
        channelName: 'take U forward (Striver)',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
        videoCount: '80+ Videos',
        duration: '65 Hours',
        badge: 'Top Placement Prep',
        description: 'The golden standard DSA preparation playlist for college placements and FAANG interviews. Covers every pattern from basics to hard LeetCode problems.',
        keyTopics: ['Striver SDE Sheet', 'Dynamic Programming', 'Binary Trees & Graphs', 'Greedy & Backtracking']
      },
      {
        id: 'yt-dsa-abdulbari',
        title: 'Mastering Data Structures & Algorithms in C/C++',
        channelName: 'Abdul Bari',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLDN4rrl48X7U36G_N4c4U8h6sZ3qD_x9k',
        videoCount: '50+ Videos',
        duration: '35 Hours',
        badge: 'Conceptual Depth',
        description: 'World-renowned visual animations explaining algorithmic complexity, recursion trees, binary search trees, AVL trees, and sorting algorithms.',
        keyTopics: ['Time Complexity & Asymptotics', 'Recursion Trees', 'AVL & B-Trees', 'Divide & Conquer']
      },
      {
        id: 'yt-dsa-apnacollege',
        title: 'Complete Java + DSA Placement Course',
        channelName: 'Apna College (Shradha Khapra)',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhQRGiZMSJ',
        videoCount: '42 Videos',
        duration: '28 Hours',
        badge: 'Beginner Friendly',
        description: 'Step-by-step Java programming and DSA syllabus designed specifically for Indian engineering college campus drives.',
        keyTopics: ['Java Syntax & OOPs', 'LinkedList, Stack & Queue', 'Binary Search Trees', 'Tries & Hashing']
      }
    ]
  },
  {
    id: 'skill-node-express',
    name: 'Node.js & Backend APIs',
    category: 'Web Development',
    icon: 'Server',
    description: 'RESTful API architecture, JWT authentication, MongoDB / PostgreSQL, and microservices.',
    popularTopics: ['REST APIs', 'JWT & OAuth', 'Mongoose / Prisma', 'WebSockets', 'API Rate Limiting'],
    totalTutors: 14,
    totalLearners: 38,
    difficulty: 'Intermediate',
    youtubePlaylists: [
      {
        id: 'yt-node-chai',
        title: 'Chai aur Backend (Node.js, Express & MongoDB Production)',
        channelName: 'Chai aur Code (Hitesh Choudhary)',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_HQGWn5pUTpdblId',
        videoCount: '25+ Videos',
        duration: '22 Hours',
        badge: 'Production Grade',
        description: 'Professional backend development: Express router architecture, MongoDB aggregation pipelines, JWT access/refresh tokens, and Cloudinary uploads.',
        keyTopics: ['Express Middleware', 'JWT & Cookies', 'MongoDB Aggregation', 'Cloudinary & Multer']
      },
      {
        id: 'yt-node-fcc',
        title: 'Node.js and Express.js Full Course',
        channelName: 'freeCodeCamp.org (John Smilga)',
        playlistUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
        videoCount: 'Full Course',
        duration: '8 Hours',
        badge: 'Zero to Hero',
        description: 'Complete walkthrough of Node event-driven architecture, file system module, Express servers, RESTful routing, and JSON responses.',
        keyTopics: ['Node Event Loop', 'HTTP Module', 'Express Routing', 'REST API Design']
      },
      {
        id: 'yt-node-dave',
        title: 'Node.js Full Course & REST APIs',
        channelName: 'Dave Gray',
        playlistUrl: 'https://www.youtube.com/playlist?list=PL0Zuz27SZ-6PFkIxaJ6Xx_X4666zd9fYC',
        videoCount: '16 Videos',
        duration: '10 Hours',
        badge: 'Clean Architecture',
        description: 'MVC design pattern in Node.js, user role authentication, async error handling, and connecting MongoDB with Mongoose.',
        keyTopics: ['MVC Pattern', 'User Roles & JWT', 'Async Error Middleware', 'Mongoose ODM']
      }
    ]
  },
  {
    id: 'skill-ml-python',
    name: 'Machine Learning with PyTorch',
    category: 'AI & Machine Learning',
    icon: 'Cpu',
    description: 'Neural networks, CNNs, Transformers, model training, fine-tuning and evaluation.',
    popularTopics: ['PyTorch Tensors', 'CNN Image Models', 'Transfer Learning', 'HuggingFace', 'Pandas/NumPy'],
    totalTutors: 12,
    totalLearners: 51,
    difficulty: 'Advanced',
    youtubePlaylists: [
      {
        id: 'yt-pytorch-fcc',
        title: 'PyTorch for Deep Learning Bootcamp',
        channelName: 'freeCodeCamp.org (Daniel Bourke)',
        playlistUrl: 'https://www.youtube.com/watch?v=V_xro1bcAuA',
        videoCount: 'Full Course',
        duration: '25 Hours',
        badge: 'Hands-on Masterclass',
        description: 'From PyTorch tensors and workflow fundamentals to Computer Vision CNNs, Transfer Learning, and custom model evaluation.',
        keyTopics: ['Tensor Operations', 'Neural Network Workflow', 'Computer Vision (CNNs)', 'Transfer Learning']
      },
      {
        id: 'yt-pytorch-aladdin',
        title: 'PyTorch Deep Learning & Neural Networks',
        channelName: 'Aladdin Persson',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLhhyoLH6IjfxeoooqP9rhU3HJIAVAJ3Vz',
        videoCount: '32 Videos',
        duration: '14 Hours',
        badge: 'Implementation Focused',
        description: 'Building deep neural networks from scratch: Custom datasets, DataLoader, CNNs, RNNs, Transformers, and GANs.',
        keyTopics: ['Custom Dataset Loaders', 'Transformers & Attention', 'Recurrent Neural Nets', 'Training Loops']
      },
      {
        id: 'yt-ml-krish',
        title: 'Complete Machine Learning & Data Science Playlist',
        channelName: 'Krish Naik',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wTQxZsvzyWFU',
        videoCount: '55 Videos',
        duration: '40 Hours',
        badge: 'Most Comprehensive',
        description: 'Comprehensive math and code: Exploratory Data Analysis (EDA), Feature Engineering, Supervised/Unsupervised models, and ML pipelines.',
        keyTopics: ['EDA & Feature Engineering', 'Supervised Algorithms', 'Model Evaluation', 'Scikit-Learn Pipelines']
      }
    ]
  },
  {
    id: 'skill-docker-k8s',
    name: 'Docker & Kubernetes',
    category: 'Cloud & DevOps',
    icon: 'Cloud',
    description: 'Containerization, multi-stage Docker builds, Kubernetes pods, and CI/CD deployment.',
    popularTopics: ['Dockerfile Optimization', 'Docker Compose', 'K8s Deployments', 'GitHub Actions', 'AWS ECS'],
    totalTutors: 8,
    totalLearners: 29,
    difficulty: 'Intermediate',
    youtubePlaylists: [
      {
        id: 'yt-docker-nana',
        title: 'Docker & Containers Tutorial for Beginners',
        channelName: 'TechWorld with Nana',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLy7NrYWoggjwPggqtPfAhkwviW4W4gA4x',
        videoCount: '20+ Videos',
        duration: '12 Hours',
        badge: 'Best for Beginners',
        description: 'Visual, high-clarity introduction to Docker: Containers vs VMs, Dockerfiles, images, Docker Compose, and networking.',
        keyTopics: ['Containers vs VMs', 'Docker Compose', 'Volume Persistence', 'Multi-stage Builds']
      },
      {
        id: 'yt-k8s-nana',
        title: 'Kubernetes Tutorial for Beginners [Full Course]',
        channelName: 'TechWorld with Nana',
        playlistUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do',
        videoCount: 'Full Course',
        duration: '4 Hours',
        badge: 'Production Ready',
        description: 'Master Kubernetes architecture, Pods, Deployments, Services, ConfigMaps, Secrets, Ingress controllers, and Helm charts.',
        keyTopics: ['K8s Pods & Deployments', 'Services & Ingress', 'ConfigMaps & Secrets', 'Helm Package Manager']
      },
      {
        id: 'yt-devops-kunal',
        title: 'Complete DevOps Course (Docker, K8s, CI/CD)',
        channelName: 'Kunal Kushwaha',
        playlistUrl: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnq3xO1lO9Ww6pvdqZqgQ4-i',
        videoCount: '18 Videos',
        duration: '15 Hours',
        badge: 'Open Source Community',
        description: 'Real-world DevOps workflows: Containerizing microservices, GitOps, Kubernetes clusters, and automated CI/CD pipelines.',
        keyTopics: ['Container Orchestration', 'GitOps & CI/CD', 'Docker Networking', 'Production Cloud Deploy']
      }
    ]
  },
  {
    id: 'skill-flutter',
    name: 'Flutter & Dart Mobile Apps',
    category: 'Mobile App Dev',
    icon: 'Smartphone',
    description: 'Cross-platform iOS and Android apps with beautiful Material 3 & Cupertino widgets.',
    popularTopics: ['Bloc State Management', 'Firebase Integration', 'Animations', 'Offline Storage', 'REST APIs'],
    totalTutors: 11,
    totalLearners: 26,
    difficulty: 'Intermediate',
    youtubePlaylists: [
      {
        id: 'yt-flutter-ninja',
        title: 'Flutter Tutorial for Beginners',
        channelName: 'The Net Ninja',
        playlistUrl: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jLYyp2Aoh6hcWuxFDX6PBJ',
        videoCount: '37 Videos',
        duration: '10 Hours',
        badge: 'Best for Beginners',
        description: 'Build your first mobile app: Dart syntax, Flutter widgets, layout rows/columns, asynchronous calls, and state management.',
        keyTopics: ['Flutter Widget Tree', 'Stateful vs Stateless', 'Dart Async/Await', 'Custom Mobile UI']
      },
      {
        id: 'yt-flutter-rivaan',
        title: 'Full-Stack Flutter & Firebase Projects',
        channelName: 'Rivaan Ranawat',
        playlistUrl: 'https://www.youtube.com/playlist?list=PL5jb9EteFAODjE8iZ_d_YqO9qZlT_E4b3',
        videoCount: '24 Videos',
        duration: '16 Hours',
        badge: 'Project-Based Masterclass',
        description: 'Build full-fledged production clone apps with Riverpod state management, Firebase authentication, and Cloud Firestore.',
        keyTopics: ['Riverpod State Management', 'Firebase Auth & Database', 'REST API Integration', 'Offline Sync']
      },
      {
        id: 'yt-flutter-cwh',
        title: 'Flutter & Dart Full Course (Hindi)',
        channelName: 'CodeWithHarry',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLu0W_9lII9giT3g-iNkWY0pviwMhZstBf',
        videoCount: '28 Videos',
        duration: '12 Hours',
        badge: 'Best in Hindi',
        description: 'Learn cross-platform app development in Hindi: UI widgets, navigation routing, forms, validation, and real apps.',
        keyTopics: ['Dart Fundamentals', 'Material 3 Widgets', 'Navigation Routing', 'Responsive Mobile Layout']
      }
    ]
  },
  {
    id: 'skill-cybersec',
    name: 'Ethical Hacking & Web Security',
    category: 'Cybersecurity',
    icon: 'Shield',
    description: 'OWASP Top 10 vulnerabilities, Burp Suite, penetration testing, and secure coding practices.',
    popularTopics: ['SQL Injection & XSS', 'Burp Suite', 'CTF Walkthroughs', 'Auth Bypass', 'Network Recon'],
    totalTutors: 6,
    totalLearners: 34,
    difficulty: 'Advanced',
    youtubePlaylists: [
      {
        id: 'yt-hack-tcm',
        title: 'Practical Ethical Hacking - Full Course',
        channelName: 'TCM Security (The Cyber Mentor)',
        playlistUrl: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
        videoCount: 'Full Course',
        duration: '15 Hours',
        badge: 'Hands-on Pentesting',
        description: 'Reconnaissance, active scanning, enumeration, vulnerability exploitation, Active Directory attacks, and reporting.',
        keyTopics: ['Network Recon & Nmap', 'Port Scanning', 'Privilege Escalation', 'Exploit Frameworks']
      },
      {
        id: 'yt-sec-rana',
        title: 'PortSwigger Web Security Academy Walkthroughs',
        channelName: 'Rana Khalil',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLuyTk2_LG19b8Q15_k5mQ_x0c6wQh0_p3',
        videoCount: '45+ Videos',
        duration: '25 Hours',
        badge: 'Web App & Bug Bounty',
        description: 'Deep-dive solutions for OWASP Top 10: SQL Injection, Stored/Reflected XSS, CSRF, SSRF, and authentication flaws.',
        keyTopics: ['SQL Injection (SQLi)', 'Cross-Site Scripting (XSS)', 'CSRF & SSRF', 'Burp Suite Mastery']
      },
      {
        id: 'yt-net-chuck',
        title: 'Ethical Hacking & Cyber Security Labs',
        channelName: 'NetworkChuck',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLIhvC56v63IKneU7mXgG_68_jE17xI6lU',
        videoCount: '20 Videos',
        duration: '8 Hours',
        badge: 'Engaging & Practical',
        description: 'Hands-on networking: Wireshark packet analysis, Wi-Fi defense concepts, Linux command line, VPNs, and defense strategies.',
        keyTopics: ['Wireshark Packet Analysis', 'Kali Linux Basics', 'Network Defense', 'Cryptography Primitives']
      }
    ]
  },
  {
    id: 'skill-uiux-figma',
    name: 'UI/UX Design in Figma',
    category: 'UI/UX Design',
    icon: 'Palette',
    description: 'Design systems, wireframing, high-fidelity prototypes, user research, and auto-layout.',
    popularTopics: ['Auto Layout', 'Design Tokens', 'Micro-interactions', 'Design Thinking', 'Component Variants'],
    totalTutors: 15,
    totalLearners: 30,
    difficulty: 'Beginner',
    youtubePlaylists: [
      {
        id: 'yt-figma-byol',
        title: 'Figma UI UX Design Essentials',
        channelName: 'Bring Your Own Laptop (Daniel Scott)',
        playlistUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
        videoCount: 'Full Course',
        duration: '4 Hours',
        badge: 'Industry Standard',
        description: 'Master Figma wireframes, Auto Layout 5.0, typography styles, color palettes, component variants, and clickable prototypes.',
        keyTopics: ['Figma Auto Layout', 'Component Variants', 'Clickable Prototyping', 'Design Tokens']
      },
      {
        id: 'yt-figma-fcc',
        title: 'Figma UI/UX Full Course for Beginners',
        channelName: 'freeCodeCamp.org',
        playlistUrl: 'https://www.youtube.com/watch?v=JW_2xkgb6k4',
        videoCount: 'Full Course',
        duration: '6 Hours',
        badge: 'Zero to Hero',
        description: 'From UX research fundamentals and user personas to high-fidelity mobile app interfaces and design systems.',
        keyTopics: ['User Personas & Wireframes', 'Design Systems', 'Visual Hierarchy', 'Mobile App Mockups']
      },
      {
        id: 'yt-flux-academy',
        title: 'Web & Product Design Masterclass',
        channelName: 'Flux Academy',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLr_CvhOox8Q06VjKqFfGvhzH7P-K3D1xZ',
        videoCount: '30+ Videos',
        duration: '12 Hours',
        badge: 'Portfolio Ready',
        description: 'Learn modern website typography pairings, landing page wireframes, micro-interactions, and developer handoff.',
        keyTopics: ['Typography & Color', 'Landing Page UX', 'Developer Handoff', 'Micro-interactions']
      }
    ]
  },
  {
    id: 'skill-db-sql',
    name: 'PostgreSQL & Database Design',
    category: 'Core CSE',
    icon: 'Database',
    description: 'Relational database schema normalization, indexing, query optimization, and transactions (ACID).',
    popularTopics: ['Query Optimization', 'Index Strategies', 'ACID Transactions', 'Joins & CTEs', 'ER Modeling'],
    totalTutors: 13,
    totalLearners: 35,
    difficulty: 'Intermediate',
    youtubePlaylists: [
      {
        id: 'yt-sql-fcc',
        title: 'PostgreSQL Full Course for Beginners',
        channelName: 'freeCodeCamp.org',
        playlistUrl: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
        videoCount: 'Full Course',
        duration: '4 Hours',
        badge: 'Practical Foundation',
        description: 'Master relational databases: Creating tables, primary/foreign keys, joins, aggregate functions, GROUP BY, and indexing.',
        keyTopics: ['Relational Schema Design', 'SQL Joins & Aggregates', 'Foreign Keys & Constraints', 'B-Tree Indexing']
      },
      {
        id: 'yt-dbms-gatesmashers',
        title: 'DBMS Complete Playlist (GATE & Placement)',
        channelName: 'Gate Smashers (Varun Singla)',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9Xd_nvKCg57QXRU',
        videoCount: '75+ Videos',
        duration: '25 Hours',
        badge: 'Best for Exams & Core CSE',
        description: 'Complete academic and interview depth: ER modeling, relational algebra, normal forms (1NF to BCNF), ACID transactions, and concurrency.',
        keyTopics: ['ER Modeling', 'Normalization (1NF-BCNF)', 'ACID Transactions', 'Concurrency Control & Locks']
      },
      {
        id: 'yt-sql-alex',
        title: 'SQL Full Course (Beginner to Advanced)',
        channelName: 'Alex The Analyst',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLUaB-1hjhk8FE_XZ87vPPSfHqb6OcM0cF',
        videoCount: '15 Videos',
        duration: '8 Hours',
        badge: 'Data Engineering & Analytics',
        description: 'Advanced SQL mastery: Window functions (RANK, ROW_NUMBER), Common Table Expressions (CTEs), Subqueries, and query performance.',
        keyTopics: ['Window Functions', 'Common Table Expressions', 'Subqueries', 'Query Optimization']
      }
    ]
  },
  {
    id: 'skill-comp-prog',
    name: 'Competitive Programming (Codeforces)',
    category: 'Competitive Programming',
    icon: 'Trophy',
    description: 'Speed coding, number theory, bit manipulation, combinatorics and contest strategies.',
    popularTopics: ['Number Theory (GCD/Sieve)', 'Bit Manipulation', 'Game Theory', 'Fenwick Tree', 'CF 1400+ Tactics'],
    totalTutors: 9,
    totalLearners: 45,
    difficulty: 'Advanced',
    youtubePlaylists: [
      {
        id: 'yt-cp-luv',
        title: 'Competitive Programming & Algorithms Course',
        channelName: 'Luv (Codeforces Candidate Master)',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLauivoElc3ggagradg8MfOZreCMmXMmJ-',
        videoCount: '100+ Videos',
        duration: '45 Hours',
        badge: 'Top CP Series in Hindi',
        description: 'From beginner to 1600+ rating: Bit manipulation, number theory (sieve, modular arithmetic), binary search, graphs, trees, and dynamic programming.',
        keyTopics: ['Bit Manipulation Tricks', 'Number Theory & Prime Sieve', 'Prefix Sums & Hashing', 'Graph BFS/DFS on Grids']
      },
      {
        id: 'yt-cp-errichto',
        title: 'Codeforces Problem Solving & Dynamic Programming',
        channelName: 'Errichto (Grandmaster)',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLl0KD3g-oDOGJUdmhFk19H46TpQFC3l1k',
        videoCount: '25 Videos',
        duration: '18 Hours',
        badge: 'Grandmaster Insights',
        description: 'Advanced intuition and contest tactics: 2D Dynamic Programming, binary lifting, combinatorics, and solving Codeforces Div 2/1 problems.',
        keyTopics: ['DP on Trees', 'Combinatorics & Math', 'Contest Time Management', 'Codeforces Div 2 Tactics']
      },
      {
        id: 'yt-cp-william',
        title: 'Data Structures & Graph Theory Algorithms',
        channelName: 'WilliamFiset (ex-Google)',
        playlistUrl: 'https://www.youtube.com/playlist?list=PLDV1Zeh2NRsB6SWUrDFW2RmBugZPU64Lq',
        videoCount: '35 Videos',
        duration: '14 Hours',
        badge: 'Visual Algorithmic Depth',
        description: 'Comprehensive visual breakdowns of Dijkstra, Bellman-Ford, Tarjan\'s SCC, Fenwick Trees, Segment Trees, and Union Find.',
        keyTopics: ['Shortest Path (Dijkstra)', 'Segment Trees & Fenwick', 'Network Flow & Dinic\'s', 'Union Find (Disjoint Set)']
      }
    ]
  },
  {
    id: 'skill-video-editing',
    name: 'Video Editing & Motion Graphics',
    category: 'Video & Animation',
    icon: 'Video',
    description: 'Master cinematic cuts, DaVinci Resolve, Premiere Pro, CapCut, keyframe animation, color grading LUTs, and high-retention Reels pacing.',
    popularTopics: ['Premiere Pro', 'DaVinci Resolve', 'CapCut & Reels Pacing', 'Color Grading (LUTs)', 'Motion Titles & Transitions', 'Audio Sync & SFX'],
    totalTutors: 14,
    totalLearners: 38,
    difficulty: 'Intermediate',
    youtubePlaylists: [
      {
        id: 'yt-video-premiere',
        title: 'Premiere Pro Complete Masterclass: Beginner to Pro',
        channelName: 'Envato Tuts+ / Cinecom',
        playlistUrl: 'https://www.youtube.com/watch?v=u5X1d-rUoHQ',
        videoCount: 'Full Masterclass',
        duration: '6.5 Hours',
        badge: 'Industry Standard',
        description: 'Complete timeline editing, multi-cam editing, J-cuts & L-cuts, keyframing, speed ramping, and Lumetri color grading.',
        keyTopics: ['Timeline Navigation', 'Lumetri Color Grading', 'Speed Ramping', 'Keyframe Animation']
      },
      {
        id: 'yt-video-davinci',
        title: 'DaVinci Resolve 19 Complete Crash Course for Beginners',
        channelName: 'Casey Faris',
        playlistUrl: 'https://www.youtube.com/watch?v=63LnV9mvN_A',
        videoCount: 'Full Series',
        duration: '5 Hours',
        badge: 'Best Free Software',
        description: 'Professional Hollywood editing, Fairlight audio design, Fusion node effects, and color grading for free in DaVinci Resolve.',
        keyTopics: ['Cut & Edit Page', 'Color Page & Nodes', 'Fusion Motion Graphics', 'Fairlight Audio']
      },
      {
        id: 'yt-video-reels-capcut',
        title: 'CapCut Desktop & Mobile Editing for Viral Reels & Shorts',
        channelName: 'Film Booth & Creator Fundamentals',
        playlistUrl: 'https://www.youtube.com/watch?v=7_h5i40o5mI',
        videoCount: '18 Videos',
        duration: '4 Hours',
        badge: 'Social Media & Reels',
        description: 'Viral retention editing: captions animation, zoom cuts, sound design triggers, B-roll layering, and engagement pacing.',
        keyTopics: ['Hook & Retention Editing', 'Auto Captions & Animations', 'SFX Timing', 'Trending Pacing']
      }
    ]
  },
  {
    id: 'skill-canva-poster-design',
    name: 'Poster Designing with Canva',
    category: 'Graphic & Poster Design',
    icon: 'Palette',
    description: 'Design eye-catching college fest posters, event flyers, hackathon banners, typography lockups, brand color palettes, and social media promotions in Canva Pro.',
    popularTopics: ['Visual Hierarchy', 'Typography Pairings', 'College Fest Posters', 'Color Theory & Contrast', 'Canva Magic Tools', 'Print Resolution (300 DPI)'],
    totalTutors: 19,
    totalLearners: 47,
    difficulty: 'Beginner',
    youtubePlaylists: [
      {
        id: 'yt-canva-mastery',
        title: 'Canva Complete Graphic Design Course (Beginner to Advanced)',
        channelName: 'Design with Canva / Envato',
        playlistUrl: 'https://www.youtube.com/watch?v=un50Bs4BvZ8',
        videoCount: 'Full Course',
        duration: '4.5 Hours',
        badge: 'Beginner Friendly',
        description: 'Master visual layout principles, font pairing rules, photo masking, background removal, and professional alignment in Canva.',
        keyTopics: ['Grid & Alignment', 'Font Combinations', 'Color Harmony', 'Element Grouping']
      },
      {
        id: 'yt-canva-event-posters',
        title: 'College Event & Fest Poster Design Masterclass in Canva',
        channelName: 'GFX Mentor & Design School',
        playlistUrl: 'https://www.youtube.com/watch?v=cIflq2e2kQo',
        videoCount: '12 Tutorials',
        duration: '3.5 Hours',
        badge: 'Campus Fest Special',
        description: 'Create high-impact cultural and technical event posters, hackathon promos, guest speaker posters, and Instagram stories.',
        keyTopics: ['Event Poster Layouts', 'Neon & Cyberpunk Effects', 'Call to Action Placement', 'Social Media Resizing']
      },
      {
        id: 'yt-canva-branding',
        title: 'Branding & Social Media Graphics with Canva Pro',
        channelName: 'Gareth David Studio',
        playlistUrl: 'https://www.youtube.com/watch?v=sTjV9yN7YgE',
        videoCount: '15 Videos',
        duration: '5 Hours',
        badge: 'Club & Brand Identity',
        description: 'Build complete brand kits for student clubs: custom color palettes, logos, vector elements, and consistent typography.',
        keyTopics: ['Brand Kits', 'Logo & Icon Framing', 'Vector Styling', 'Print Export (PDF Print 300DPI)']
      }
    ]
  },
  {
    id: 'skill-music-remixing',
    name: 'Music Remixing & Audio Production',
    category: 'Music & Audio Production',
    icon: 'Music',
    description: 'Create EDM remixes, lo-fi hip-hop beats, song mashups, beat drops, acapella time-stretching, and audio mixing using FL Studio, Ableton Live, or DJ equipment.',
    popularTopics: ['Beat Matching & BPM Sync', 'FL Studio / Ableton Live', 'Lo-Fi & EDM Production', 'Acapella Mashups', 'EQ, Reverb & Compression', 'Audio Transitions & Drops'],
    totalTutors: 11,
    totalLearners: 31,
    difficulty: 'Intermediate',
    youtubePlaylists: [
      {
        id: 'yt-music-flstudio',
        title: 'FL Studio 21 Beginner Masterclass: Produce Your First Song',
        channelName: 'In The Mix (Michael Wynne)',
        playlistUrl: 'https://www.youtube.com/watch?v=4EwbM_L9tZg',
        videoCount: 'Full Masterclass',
        duration: '8 Hours',
        badge: 'Highest Rated',
        description: 'The gold standard FL Studio tutorial: Channel rack, piano roll, mixer routing, plugin automation, EQ, and exporting WAV stems.',
        keyTopics: ['Piano Roll & Melodies', 'Mixer Bus Routing', 'Parametric EQ 2', 'Synthesizers & Drum Patterns']
      },
      {
        id: 'yt-music-remixing',
        title: 'How to Make Song Remixes & Mashups from Scratch',
        channelName: 'EDMProd & Cymatics.fm',
        playlistUrl: 'https://www.youtube.com/watch?v=BqK21hT5fVo',
        videoCount: '14 Videos',
        duration: '6 Hours',
        badge: 'DJ & Remix Essentials',
        description: 'Isolating vocal acapellas, pitch shifting, key matching (Camelot wheel), build-ups, drops, and energetic transitions.',
        keyTopics: ['Acapella Extraction & Pitch Shift', 'Build-Up & Drop Tension', 'Key & Scale Matching', 'Filter Sweeps & FX']
      },
      {
        id: 'yt-music-lofi',
        title: 'Lo-Fi Hip Hop Beatmaking & Sampling Workshop',
        channelName: 'Taetro & L.Dre',
        playlistUrl: 'https://www.youtube.com/watch?v=uK1lW7p3T1g',
        videoCount: '10 Videos',
        duration: '4 Hours',
        badge: 'Chill & Study Beats',
        description: 'Creating vintage vinyl textures, jazzy 7th chords, swing rhythm drums, tape warble, and sidechain compression.',
        keyTopics: ['Vinyl Crackle & Tape Saturation', 'Jazz Chord Progressions', 'Sidechain Compression', 'Chill Drum Grooves']
      }
    ]
  },
  {
    id: 'skill-art-and-craft',
    name: 'Art & Craft (DIY, Sketching & Decor)',
    category: 'Arts & Crafts',
    icon: 'Scissors',
    description: 'Hands-on creative arts: pencil sketching & shading, acrylic & watercolor painting, papercraft & origami, campus fest stage decor, and DIY customized crafts.',
    popularTopics: ['Pencil Sketching & Shading', 'Watercolor & Acrylics', 'Campus Fest & Stage Decor', 'Origami & Papercraft', 'Calligraphy & Hand Lettering', 'Resin & Clay Modeling'],
    totalTutors: 15,
    totalLearners: 42,
    difficulty: 'Beginner',
    youtubePlaylists: [
      {
        id: 'yt-craft-sketching',
        title: 'Pencil Sketching & Drawing Fundamentals for Beginners',
        channelName: 'Proko & RapidFireArt',
        playlistUrl: 'https://www.youtube.com/watch?v=OezMavBqWXc',
        videoCount: '20 Lessons',
        duration: '7 Hours',
        badge: 'Drawing Fundamentals',
        description: 'Perspective lines, pencil grading (2B-8B), cross-hatching, light source shading, facial proportions, and realistic texture rendering.',
        keyTopics: ['Perspective & Proportions', 'Cross-Hatching & Blending', 'Value Scale & Lighting', 'Still Life Sketching']
      },
      {
        id: 'yt-craft-painting',
        title: 'Acrylic & Watercolor Painting Techniques on Canvas',
        channelName: 'The Art Sherpa',
        playlistUrl: 'https://www.youtube.com/watch?v=b4bM3_iV_J0',
        videoCount: '15 Projects',
        duration: '8 Hours',
        badge: 'Canvas & Colors',
        description: 'Color blending, brush control, wet-on-wet watercolor washes, acrylic layering, and creating expressive wall art.',
        keyTopics: ['Color Mixing & Wheels', 'Wet-on-Wet Washes', 'Impasto & Layering', 'Canvas Preparation']
      },
      {
        id: 'yt-craft-diy-fest',
        title: 'DIY Papercraft, Origami & Event Stage Decor Hacks',
        channelName: '5-Minute Crafts / DIY Creators',
        playlistUrl: 'https://www.youtube.com/watch?v=XW9O3l5h_E8',
        videoCount: '25 Projects',
        duration: '5 Hours',
        badge: 'Hands-on DIY',
        description: '3D geometric papercraft, floral arrangements, festive lighting lanterns, origami modular stars, and eco-friendly event decor.',
        keyTopics: ['3D Origami Modular Folding', 'Handmade Festive Lanterns', 'Eco-friendly Party Decor', 'Card & Gift Crafting']
      }
    ]
  },
  {
    id: 'skill-photography-retouching',
    name: 'Photography & Photo Retouching',
    category: 'Photography & Creative Media',
    icon: 'Camera',
    description: 'Master camera exposure (ISO, aperture, shutter speed), cinematic composition, rule of thirds, portrait lighting, and Adobe Lightroom / Photoshop retouching.',
    popularTopics: ['Manual Camera Settings (ISO/Aperture)', 'Rule of Thirds & Framing', 'Lightroom Color Grading', 'Portrait Retouching', 'Event & Fest Photography', 'Mobile Phone Pro Mode'],
    totalTutors: 12,
    totalLearners: 35,
    difficulty: 'Intermediate',
    youtubePlaylists: [
      {
        id: 'yt-photo-basics',
        title: 'Photography Basics & Exposure Triangle in 1 Hour',
        channelName: 'Peter McKinnon & Mango Street',
        playlistUrl: 'https://www.youtube.com/watch?v=V7z7BAZdt2M',
        videoCount: 'Full Course',
        duration: '4 Hours',
        badge: 'Camera Mastery',
        description: 'Aperture depth of field, shutter speed motion freeze, ISO noise reduction, and focal length choices.',
        keyTopics: ['Exposure Triangle', 'Depth of Field', 'Rule of Thirds', 'Golden Hour Lighting']
      },
      {
        id: 'yt-photo-lightroom',
        title: 'Complete Adobe Lightroom Mobile & Desktop Editing Masterclass',
        channelName: 'Sean Tucker & PiXimperfect',
        playlistUrl: 'https://www.youtube.com/watch?v=q6g0P9o4f3Y',
        videoCount: '12 Tutorials',
        duration: '5 Hours',
        badge: 'Color Grading & Presets',
        description: 'Tone curve manipulation, HSL color grading, selective masking (subject/sky), and creating custom signature presets.',
        keyTopics: ['Tone Curve Mastery', 'HSL Color Wheels', 'Radial & Linear Masks', 'Preset Creation']
      }
    ]
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-teach',
    title: 'First Knowledge Transfer',
    description: 'Complete your very first peer skill teaching session.',
    category: 'mentor',
    tier: 'bronze',
    xpReward: 150,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedAt: '2026-08-20',
    icon: 'Sparkles'
  },
  {
    id: 'ach-streak-7',
    title: 'Week Warrior',
    description: 'Maintain a consecutive 7-day learning & teaching streak.',
    category: 'streak',
    tier: 'silver',
    xpReward: 300,
    progress: 5,
    maxProgress: 7,
    unlocked: false,
    icon: 'Flame'
  },
  {
    id: 'ach-five-exchanges',
    title: 'Master Collaborator',
    description: 'Successfully complete 5 skill exchange partnerships.',
    category: 'exchange',
    tier: 'silver',
    xpReward: 450,
    progress: 4,
    maxProgress: 5,
    unlocked: false,
    icon: 'Users'
  },
  {
    id: 'ach-top-rated',
    title: 'Five-Star Sensei',
    description: 'Receive 5 continuous 5-star ratings from peer learners.',
    category: 'mentor',
    tier: 'gold',
    xpReward: 600,
    progress: 4,
    maxProgress: 5,
    unlocked: false,
    icon: 'Star'
  },
  {
    id: 'ach-polymath',
    title: 'Campus Polymath',
    description: 'Learn at least 3 distinct skill categories.',
    category: 'explorer',
    tier: 'gold',
    xpReward: 750,
    progress: 2,
    maxProgress: 3,
    unlocked: false,
    icon: 'Compass'
  },
  {
    id: 'ach-grandmaster',
    title: 'SkillQuest Grandmaster',
    description: 'Reach Level 8 and accumulate 5,000 XP on campus.',
    category: 'explorer',
    tier: 'platinum',
    xpReward: 1200,
    progress: 1840,
    maxProgress: 5000,
    unlocked: false,
    icon: 'Crown'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-tutor-aarav',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@iitb.ac.in',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=aarav.mehta',
    college: 'IIT Bombay',
    branch: 'Media & Design Engineering',
    year: '3rd Year B.Tech',
    bio: 'Campus film society editor. Edited 50+ college fest trailers, hackathon promos & YouTube videos. Ready to teach Premiere Pro & DaVinci Resolve in exchange for React or AI!',
    xp: 1420,
    level: 3,
    streakDays: 6,
    lastActiveDate: '2026-10-07',
    authProvider: 'google',
    skillsTeaching: [
      {
        id: 'teach-aarav-video',
        name: 'Video Editing & Motion Graphics',
        category: 'Video & Animation',
        proficiency: 'Expert',
        experienceMonths: 24,
        description: 'Timeline navigation, J/L cuts, speed ramping, Premiere Pro keyframes, DaVinci Resolve color grading & viral Reels pacing.',
        endorsementsCount: 18,
        tags: ['Video Editing', 'Premiere Pro', 'DaVinci Resolve', 'Reels', 'CapCut']
      }
    ],
    skillsLearning: [
      {
        id: 'learn-aarav-react',
        name: 'React & Next.js',
        category: 'Web Development',
        targetProficiency: 'Intermediate',
        priority: 'High',
        notes: 'Want to build portfolio websites and interactive media platforms with React.'
      }
    ],
    badges: [
      {
        id: 'badge-video-1',
        name: 'Cinematic Wizard',
        description: 'Taught over 15 video editing sessions',
        icon: 'Video',
        tier: 'gold',
        unlockedAt: '2026-09-15',
        category: 'teaching'
      }
    ],
    achievements: [],
    stats: {
      totalHoursExchanged: 28,
      sessionsCompleted: 14,
      studentsTaught: 12,
      skillsLearnedCount: 2,
      reputationRating: 4.9,
      reviewsCount: 11,
      questPointsClaimed: 420
    },
    isOnline: true
  },
  {
    id: 'user-tutor-pooja',
    name: 'Pooja Sundaram',
    email: 'pooja.sundaram@pilani.bits-pilani.ac.in',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=pooja.sundaram',
    college: 'BITS Pilani',
    branch: 'Design & Computing',
    year: '2nd Year B.Tech',
    bio: 'Lead designer for campus cultural fest Oasis. Created 100+ Canva posters, club logos, hackathon banners & social media campaigns. Excited to exchange with Python/ML peers!',
    xp: 1250,
    level: 2,
    streakDays: 4,
    lastActiveDate: '2026-10-07',
    authProvider: 'google',
    skillsTeaching: [
      {
        id: 'teach-pooja-canva',
        name: 'Poster Designing with Canva',
        category: 'Graphic & Poster Design',
        proficiency: 'Advanced',
        experienceMonths: 18,
        description: 'Visual hierarchy, font pairing rules, event flyer templates, color theory, Canva Pro Magic Studio, and 300 DPI print exporting.',
        endorsementsCount: 22,
        tags: ['Canva', 'Poster Design', 'Typography', 'Fest Posters', 'Branding']
      }
    ],
    skillsLearning: [
      {
        id: 'learn-pooja-ml',
        name: 'Machine Learning & Python',
        category: 'AI & Machine Learning',
        targetProficiency: 'Intermediate',
        priority: 'High',
        notes: 'Learning Python, NumPy, and generative AI models for generative art.'
      }
    ],
    badges: [
      {
        id: 'badge-canva-1',
        name: 'Visual Storyteller',
        description: 'Designed over 50 campus fest posters and banners',
        icon: 'Palette',
        tier: 'silver',
        unlockedAt: '2026-09-20',
        category: 'teaching'
      }
    ],
    achievements: [],
    stats: {
      totalHoursExchanged: 22,
      sessionsCompleted: 11,
      studentsTaught: 10,
      skillsLearnedCount: 1,
      reputationRating: 4.95,
      reviewsCount: 9,
      questPointsClaimed: 380
    },
    isOnline: true
  },
  {
    id: 'user-tutor-kabir',
    name: 'Kabir Sen',
    email: 'kabir.sen@iitd.ac.in',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kabir.sen',
    college: 'IIT Delhi',
    branch: 'Electrical & Audio Club',
    year: '3rd Year B.Tech',
    bio: 'Campus DJ & electronic music producer. Making EDM remixes, lo-fi study beats, and Bollywood mashups on FL Studio. Looking to master DSA for campus placements!',
    xp: 1390,
    level: 3,
    streakDays: 5,
    lastActiveDate: '2026-10-07',
    authProvider: 'google',
    skillsTeaching: [
      {
        id: 'teach-kabir-remix',
        name: 'Music Remixing & Audio Production',
        category: 'Music & Audio Production',
        proficiency: 'Advanced',
        experienceMonths: 20,
        description: 'FL Studio piano roll, beat matching, acapella mashups, sidechain compression, EQ balancing, build-up risers & powerful drops.',
        endorsementsCount: 16,
        tags: ['FL Studio', 'Remixing', 'Audio Mixing', 'EDM', 'Lo-Fi Beats']
      }
    ],
    skillsLearning: [
      {
        id: 'learn-kabir-dsa',
        name: 'DSA in C++ & Java',
        category: 'Data Structures & Algorithms',
        targetProficiency: 'Advanced',
        priority: 'High',
        notes: 'Targeting top product company coding rounds with trees, DP & graphs.'
      }
    ],
    badges: [
      {
        id: 'badge-audio-1',
        name: 'Beat Maestro',
        description: 'Taught audio synthesis & beat production to 10+ students',
        icon: 'Music',
        tier: 'gold',
        unlockedAt: '2026-09-10',
        category: 'teaching'
      }
    ],
    achievements: [],
    stats: {
      totalHoursExchanged: 24,
      sessionsCompleted: 12,
      studentsTaught: 10,
      skillsLearnedCount: 2,
      reputationRating: 4.88,
      reviewsCount: 8,
      questPointsClaimed: 410
    },
    isOnline: true
  },
  {
    id: 'user-tutor-ananya',
    name: 'Ananya Roy',
    email: 'ananya.roy@iitm.ac.in',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ananya.roy',
    college: 'IIT Madras',
    branch: 'Fine Arts & Engineering',
    year: '4th Year B.Tech',
    bio: 'Fine Arts Club coordinator. Passionate about pencil sketching, acrylic painting, handmade origami, and stage decor. Want to collaborate with UI/UX & Figma designers!',
    xp: 1680,
    level: 3,
    streakDays: 7,
    lastActiveDate: '2026-10-07',
    authProvider: 'google',
    skillsTeaching: [
      {
        id: 'teach-ananya-craft',
        name: 'Art & Craft (DIY, Sketching & Decor)',
        category: 'Arts & Crafts',
        proficiency: 'Expert',
        experienceMonths: 36,
        description: 'Pencil shading techniques, acrylic canvas painting, 3D papercraft, festive lanterns, calligraphy, and DIY craft items.',
        endorsementsCount: 25,
        tags: ['Sketching', 'Painting', 'Origami', 'Handmade Crafts', 'Stage Decor']
      }
    ],
    skillsLearning: [
      {
        id: 'learn-ananya-uiux',
        name: 'UI/UX Design & Figma',
        category: 'UI/UX Design',
        targetProficiency: 'Intermediate',
        priority: 'High',
        notes: 'Translating traditional drawing & color theory into digital Figma wireframes.'
      }
    ],
    badges: [
      {
        id: 'badge-art-1',
        name: 'Master Artisan',
        description: 'Led workshops on campus decor and fine arts',
        icon: 'Scissors',
        tier: 'platinum',
        unlockedAt: '2026-08-30',
        category: 'teaching'
      }
    ],
    achievements: [],
    stats: {
      totalHoursExchanged: 34,
      sessionsCompleted: 17,
      studentsTaught: 15,
      skillsLearnedCount: 2,
      reputationRating: 5.0,
      reviewsCount: 14,
      questPointsClaimed: 550
    },
    isOnline: true
  },
  {
    id: 'user-tutor-devika',
    name: 'Devika Nair',
    email: 'devika.nair@nitt.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=devika.nair',
    college: 'NIT Trichy',
    branch: 'Computer Applications',
    year: '2nd Year MCA',
    bio: 'Campus media team head. Portrait, event, and street photographer. Expert in Lightroom color grading & camera settings. Looking for backend API mentorship.',
    xp: 1320,
    level: 2,
    streakDays: 4,
    lastActiveDate: '2026-10-07',
    authProvider: 'google',
    skillsTeaching: [
      {
        id: 'teach-devika-photo',
        name: 'Photography & Photo Retouching',
        category: 'Photography & Creative Media',
        proficiency: 'Advanced',
        experienceMonths: 22,
        description: 'Camera settings (ISO/aperture/shutter), framing rules, Lightroom tone curves & color wheels, and portrait retouching in Photoshop.',
        endorsementsCount: 15,
        tags: ['Photography', 'Lightroom', 'Photoshop', 'Portraits', 'Color Grading']
      }
    ],
    skillsLearning: [
      {
        id: 'learn-devika-backend',
        name: 'Node.js & Backend APIs',
        category: 'Web Development',
        targetProficiency: 'Intermediate',
        priority: 'Medium',
        notes: 'Building photo gallery APIs and user upload cloud pipelines with Node.js.'
      }
    ],
    badges: [
      {
        id: 'badge-photo-1',
        name: 'Lens Master',
        description: 'Photographed 20+ campus events and taught 10+ peers',
        icon: 'Camera',
        tier: 'gold',
        unlockedAt: '2026-09-05',
        category: 'teaching'
      }
    ],
    achievements: [],
    stats: {
      totalHoursExchanged: 26,
      sessionsCompleted: 13,
      studentsTaught: 11,
      skillsLearnedCount: 1,
      reputationRating: 4.92,
      reviewsCount: 10,
      questPointsClaimed: 390
    },
    isOnline: true
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest-daily-checkin',
    title: 'Daily Campus Check-In',
    description: 'Log into SkillQuest today to continue your learning streak.',
    type: 'daily',
    category: 'General',
    xpReward: 50,
    progress: 1,
    target: 1,
    unit: 'login',
    completed: true,
    claimed: true,
    expiresInHours: 16,
    icon: 'CheckCircle2'
  },
  {
    id: 'quest-teach-hour',
    title: 'Mentor a Peer (1 Session)',
    description: 'Host or complete a peer exchange session teaching one of your skills.',
    type: 'daily',
    category: 'Web Development',
    xpReward: 120,
    progress: 0,
    target: 1,
    unit: 'session',
    completed: false,
    claimed: false,
    expiresInHours: 16,
    icon: 'GraduationCap'
  },
  {
    id: 'quest-explore-skills',
    title: 'Skill Explorer',
    description: 'Browse the skill directory and send 1 peer exchange proposal.',
    type: 'daily',
    category: 'General',
    xpReward: 75,
    progress: 1,
    target: 1,
    unit: 'request',
    completed: true,
    claimed: false,
    expiresInHours: 16,
    icon: 'Compass'
  },
  {
    id: 'quest-weekly-hours',
    title: 'Collaborative Marathon',
    description: 'Complete 3 skill exchange sessions this week across any CSE domain.',
    type: 'weekly',
    category: 'General',
    xpReward: 350,
    progress: 2,
    target: 3,
    unit: 'sessions',
    completed: false,
    claimed: false,
    expiresInHours: 96,
    icon: 'Flame'
  },
  {
    id: 'quest-rate-peer',
    title: 'Constructive Feedback',
    description: 'Submit an honest peer review with feedback after an exchange.',
    type: 'weekly',
    category: 'General',
    xpReward: 150,
    progress: 1,
    target: 1,
    unit: 'review',
    completed: true,
    claimed: true,
    expiresInHours: 96,
    icon: 'Star'
  },
  {
    id: 'quest-special-ai',
    title: 'AI Synergy Quest: Roadmap Generator',
    description: 'Use the Gemini AI Skill Advisor to generate a collaborative 3-stage learning roadmap.',
    type: 'special',
    category: 'AI & Machine Learning',
    xpReward: 200,
    progress: 0,
    target: 1,
    unit: 'roadmap',
    completed: false,
    claimed: false,
    icon: 'Sparkles'
  }
];

export const INITIAL_EXCHANGES: SkillExchange[] = [];

export const INITIAL_REVIEWS: Review[] = [];
