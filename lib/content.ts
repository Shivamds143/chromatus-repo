export type SubItem = {
  slug: string;
  title: string;
  summary: string;
  body: string[];
};

export type Section = {
  key: string;
  path: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: SubItem[];
};

export const aboutSection: Section = {
  key: "about",
  path: "/about",
  eyebrow: "About Us",
  title: "Our story, leadership, expertise, and how we approach research.",
  intro:
    "Chromatus Consulting is a research and consulting firm that helps organizations make better business decisions through data. Here's who we are and how we work.",
  items: [
    {
      slug: "our-story",
      title: "Our Story",
      summary: "How a research and consulting firm helps organizations turn data into confident business decisions.",
      body: [
        "Chromatus Consulting is a research and consulting firm that helps organizations make better business decisions through data. For over a decade, we've been helping companies understand their markets, benchmark their competition, and validate their strategies before they commit resources to them.",
        "We work at the intersection of research and consulting — we don't just hand clients a report full of numbers. We help them understand what those numbers mean for their business, and what to do next.",
        "Our team includes trained analysts, market researchers, and domain specialists across sectors like healthcare, automotive, chemicals, energy, telecom, aerospace, and food & beverages. Combined, our team brings 25+ years of quantitative and qualitative research experience and 20+ years of B2B consulting experience to every engagement.",
        "We help businesses answer the questions that matter most before they make a move: Is this the right market to enter? How is our brand really perceived? Where are we losing customers, and why? What will it take to launch this product successfully? How do we compare to our competitors? Is this location, city, or region worth investing in?",
        "We answer these questions through a mix of primary research (surveys, interviews, field studies) and secondary research (market data, industry benchmarking, competitive intelligence) — then translate the findings into clear, actionable recommendations.",
      ],
    },
    {
      slug: "leadership-team",
      title: "Leadership Team",
      summary: "The people leading research design, client engagement, and delivery across Chromatus.",
      body: [
        "Vijay Natekar — Managing Director. Vijay brings 15 years of experience in market research and business consulting. He has led engagements across product and concept testing, B2B research, and secondary research, and oversees project management, process design, and market engineering across Chromatus's client portfolio. His work centers on turning research into measurable value — from data analysis through to need-gap analysis for client strategy. Areas of expertise: market research leadership, product & concept testing, B2B research, secondary research, project management, process design, market engineering, and need-gap analysis.",
        "Ameya Dingare — Client Engagement Head. Ameya has 13 years of experience in business intelligence and client engagement. He leads client management and is responsible for business and operational excellence across engagements, with strong expertise in market growth strategy, competitive intelligence, data analytics, and channel assessment. Areas of expertise: client management, business intelligence, market growth strategy, competitive intelligence, data analytics, channel assessment, and operational excellence.",
        "Gaurav Bhedasgaonkar — Field Head. Gaurav brings 12 years of experience in the market research industry, specialising in large-scale field operations, including government surveys. He oversees data validation, product and company mapping, and end-to-end project management for B2C survey execution. Areas of expertise: field operations, government surveys, data validation, product & company mapping, B2C surveys, project management, and field execution.",
        "Rahul Nawale — Research Head. Rahul brings 8 years of experience across manufacturing and market research. He specialises in B2B and B2C customer satisfaction (CSAT) surveys, with additional expertise in operations management, supply chain research, data evaluation, and competitive intelligence. Areas of expertise: B2B & B2C CSAT surveys, operations management, supply chain research, data evaluation, competitive intelligence, and market research.",
        "Aboli Joshi — Senior Data Analyst. Aboli brings 14 years of experience spanning R&D, patent analysis, and market research. Her expertise covers B2B and secondary research, data analysis, technology gap assessment, and patent intelligence. She also brings German language expertise, supporting research and analysis involving German-speaking markets and sources. Areas of expertise: B2B research, secondary research, data analysis, technology gap assessment, patent analysis, and German language expertise.",
        "Sanika Mahajan — Data Scientist. Sanika brings 3 years of experience in data analysis and field research, with hands-on expertise in primary research, large-scale data handling, and statistical analysis. She works across primary and secondary research, supporting data-driven insights and strategic business and marketing decisions. Areas of expertise: primary research, data analysis, statistical tools, secondary research, field coordination, and dataset management.",
        "The Wider Team: Beyond our core leadership, Chromatus fields a team of 20 dedicated researchers and over 60+ experienced field investigators across India, supported by academic specialists in marketing, management, statistics, operations research, rural development, and social research. This gives us the depth to run everything from a focused customer satisfaction study to a nationwide field survey.",
      ],
    },
    {
      slug: "values-culture",
      title: "Values & Culture",
      summary: "What Chromatus focuses on, and the depth of expertise behind every engagement.",
      body: [
        "Our work spans two core areas. Market & Consumer Research — understanding what customers think, want, and do, through structured studies across consumer behavior, satisfaction, pricing, and brand perception. Strategy & Business Consulting — helping businesses act on that understanding through market entry strategy, feasibility studies, competitive benchmarking, and go-to-market planning.",
        "We track eight key industry verticals and maintain a working knowledge base of 350+ researched topics across 12 business sectors, which means we rarely start from zero — we bring context from day one.",
      ],
    },
    {
      slug: "our-approach",
      title: "Our Approach",
      summary: "From the right question to the right decision — how a Chromatus engagement runs.",
      body: [
        "Strong decisions begin with reliable evidence. At Chromatus Consulting, we follow a structured research process designed to move from clarity to evidence, evidence to insight, and insight to action.",
        "01 — Define What Matters: We start by understanding the business question behind the brief. Through discussions with our clients, we clarify objectives, priorities, timelines, and challenges — so the research addresses the decision that truly matters, not just the question on paper.",
        "02 — Build the Evidence: We bring together the right mix of primary and secondary research to build a well-rounded view of the market. From published data, market models, and desk research to surveys, stakeholder interviews, field studies, and CAPI, CATI, and CAWI methodologies, we go beyond surface-level information to understand what is happening on the ground.",
        "03 — Test, Validate, Refine: Good research depends on the quality of its evidence. We apply structured scrutiny and validation throughout the process, using data checks, cross-tabulation, statistical techniques, and expert validation to strengthen the reliability of our findings.",
        "04 — Turn Insight into Action: Data becomes valuable when it helps someone make a better decision. We translate our findings into clear conclusions, practical recommendations, and business direction — giving clients a stronger basis for evaluating opportunities, addressing challenges, and planning what comes next.",
        "Evidence First. Insight Driven. Action Focused. Our approach is designed to ensure that every stage — from defining the research need to delivering the final recommendation — contributes to one outcome: greater clarity and confidence in business decisions.",
      ],
    },
  ],
};

export const servicesSection: Section = {
  key: "services",
  path: "/services",
  eyebrow: "Services",
  title: "Research and consulting services built around a decision.",
  intro:
    "From understanding how consumers decide, to testing a product before launch, to giving public institutions ground-level evidence — every service starts with the business question behind it.",
  items: [
    {
      slug: "consumer-behaviour",
      title: "Consumer Behaviour",
      summary: "Understand the thinking behind the purchase.",
      body: [
        "We study how consumers think, decide, and behave. We uncover the motivations, triggers, preferences, and barriers that shape decisions — from first awareness to purchase and repeat use.",
        "Through structured primary research with targeted consumer groups, combined with data analysis, we identify patterns across demographics, geographies, and buying occasions. We look at who your customers are, what influences them, when their decisions change, and where unmet needs exist.",
        "The outcome: a clear understanding of what truly drives customer decisions. Consumer behaviour insights reduce guesswork in product and marketing decisions, helping you invest in what actually influences customers. This understanding can guide product design, communication, pricing, and marketing strategy.",
      ],
    },
    {
      slug: "brand-management",
      title: "Brand Management",
      summary: "Know how your brand stands in the minds of customers.",
      body: [
        "Your brand already exists in the minds of customers — even if you are not actively shaping it.",
        "We assess brand awareness, perception, relevance, trust, differentiation, and competitive standing to identify where your brand is strong and where customer perception differs from your intended positioning.",
        "Using brand perception studies, tracking research, and competitor benchmarking, we translate market feedback into a clear brand diagnosis. You get evidence to strengthen strengths, fix perception gaps, and build a clearer, more distinctive market position.",
      ],
    },
    {
      slug: "new-product-launch",
      title: "New Product Launch",
      summary: "Turn an idea into a market-ready product.",
      body: [
        "A good idea must still prove its value in the real market.",
        "Chromatus supports new product development from concept testing to market assessment, competitive analysis, demand estimation, pricing, and positioning. Our research answers key questions before you invest heavily: Is there a real market? Who will buy it? What will make them choose it? What should it cost? How should it be positioned?",
        "The outcome: a data-backed direction for your product before launch. Launching with research significantly improves success rates and reduces the risk of costly changes after launch.",
      ],
    },
    {
      slug: "satisfaction-studies",
      title: "Satisfaction Studies",
      summary: "Listen to customers before dissatisfaction becomes a problem.",
      body: [
        "Customer satisfaction is more than a score — it shows where your experience is working and where it is failing.",
        "We conduct CSAT and NPS studies across B2B and B2C audiences, using methods such as email, telephonic, and face-to-face surveys. Our analysis helps identify what customers like and dislike, gaps between expectations and actual experience, product and service issues, strengths to maintain, and areas needing improvement across the journey.",
        "The outcome: a clear, practical view of what needs fixing to improve customer satisfaction and retention. Understanding satisfaction in detail helps you prevent churn and improve service before small issues become major problems.",
      ],
    },
    {
      slug: "price-benchmarking",
      title: "Price Benchmarking",
      summary: "Make sure your pricing works for you, not against you.",
      body: [
        "We help businesses understand how their pricing compares with competitors and how customers perceive the value behind it.",
        "Our analysis includes competitive price mapping, pricing structures, customer perception, and willingness-to-pay insights to give a clear view of the market. Whether you are setting a new price, reviewing an existing one, or responding to competition, we help you evaluate competitive position, price sensitivity, value perception, pricing gaps, and market opportunity.",
        "The outcome: pricing decisions based on real market evidence, helping you protect margins while staying competitive.",
      ],
    },
    {
      slug: "location-feasibility-study",
      title: "Location Feasibility Study",
      summary: "Before you invest in a location, understand it first.",
      body: [
        "A location can directly determine the success or failure of your business expansion.",
        "Our feasibility studies go beyond basic mapping and desk research. We assess the local market, demand potential, demographics, competition, infrastructure, and regulatory or operational factors. Where needed, we also include on-ground field research and local stakeholder inputs.",
        "The key question: is this location worth investing in? The outcome: clear, evidence-based location decisions that reduce the risk of investing in underperforming sites.",
      ],
    },
    {
      slug: "baseline-endline-study",
      title: "Baseline & Endline Study",
      summary: "Measure impact with evidence, not estimates.",
      body: [
        "For CSR programs, public projects, and development initiatives, impact must be measured from a clear starting point.",
        "A baseline study establishes the existing socio-economic conditions, needs, behaviours, or indicators before an intervention. The endline study revisits comparable indicators after implementation to measure change — quantifying starting conditions, the intervention, measurable change, and remaining gaps.",
        "The findings provide stakeholders, programme leaders, and decision-makers with evidence of what changed, where progress was achieved, and where further intervention may be required. The outcome: impact that can be demonstrated with evidence — not assumptions.",
      ],
    },
    {
      slug: "market-assessment",
      title: "Market Assessment",
      summary: "Before making a move, understand the market you are moving into.",
      body: [
        "Markets are shaped by more than size and growth. The real opportunity lies in understanding what is driving demand, where competition is strongest, what barriers exist, and where whitespace remains.",
        "Chromatus brings together primary and secondary research with market sizing, segmentation, competitive landscaping, DROC analysis, Porter's Five Forces, and value-chain assessment where relevant. We examine market size & growth, market dynamics, competition, demand & supply, drivers & restraints, opportunities & challenges, and the value chain.",
        "The outcome: a structured market view that supports strategic planning, investment evaluation, market entry, and growth decisions. Whether you're entering a new market or defending your position in an existing one, understanding the full landscape is the foundation for every strategic decision that follows.",
      ],
    },
    {
      slug: "government-surveys",
      title: "Government Surveys",
      summary: "Ground-level data for decisions that affect communities.",
      body: [
        "Public-sector decisions need to reflect what is happening on the ground.",
        "Chromatus conducts large-scale socio-economic, civic, traffic, geographical, and opinion-based surveys to help public institutions understand community needs and priorities. Our experience includes large-scale field research, ward-level assessments, and structured population segmentation.",
        "Our approach combines field investigation, structured questionnaires, data validation, and statistical analysis to identify current socio-economic conditions, healthcare and education needs, infrastructure and civic gaps, traffic and mobility patterns, community priorities, and immediate versus longer-term requirements.",
        "The outcome: reliable ground-level evidence that can support better planning, resource allocation, and public-sector decision-making.",
      ],
    },
  ],
};

export const industriesSection: Section = {
  key: "industries",
  path: "/industries",
  eyebrow: "Industries",
  title: "Where industry knowledge meets business decisions.",
  intro:
    "Every industry has its own customers, regulations, competitive pressures, supply chains, and growth challenges — so we don't apply the same research lens to every market. Chromatus works across eight core industry verticals, combining primary research, secondary research, competitive intelligence, data analysis, and industry expertise to understand the factors shaping each one.",
  items: [
    {
      slug: "healthcare",
      title: "Healthcare",
      summary: "Markets where decisions affect both business and people.",
      body: [
        "Healthcare markets are influenced by changing patient needs, provider preferences, technology, regulation, access, and evolving models of care. We study these markets from both the commercial and user perspective — whether the question is about a product, service, technology, or emerging opportunity.",
        "Areas we examine: patient & provider needs, market potential, product adoption, competitive landscape, healthcare delivery, emerging technologies, and the regulatory environment. Our research covers areas including pharmaceuticals, medical devices, healthcare services, diagnostics, digital health, and emerging healthcare solutions.",
        "Questions we help answer: Is there sufficient demand? Who are the key stakeholders? What influences adoption? Where are the market gaps? What could affect successful market entry?",
      ],
    },
    {
      slug: "automotive-transportation",
      title: "Automotive & Transportation",
      summary: "From individual components to the wider mobility ecosystem.",
      body: [
        "Automotive markets are being reshaped by electrification, technology adoption, changing vehicle architectures, supply chains, and evolving mobility needs. Our research looks beyond the vehicle itself to understand the components, systems, suppliers, applications, customers, and competitive forces behind the market.",
        "Areas we examine: OEM & aftermarket demand, components, supply chain, competitive landscape, technology adoption, the EV ecosystem, and mobility & transportation. Examples from our research experience include automotive door handles, automotive key and lock systems, EGR systems, EV charging cables, carbon wheels, sunroofs, logistics automation, and transportation-related markets.",
        "The focus: helping businesses identify where demand is moving, which segments are gaining relevance, and where opportunities may emerge.",
      ],
    },
    {
      slug: "food-beverages",
      title: "Food & Beverages",
      summary: "What people eat, drink, and choose is changing quickly.",
      body: [
        "Food and beverage markets are driven by taste, convenience, health, habit, affordability, product innovation, and product experience. We help businesses understand what consumers want, what they are willing to try, and what ultimately influences purchase.",
        "We explore consumer behaviour, product acceptance, concept testing, flavour preferences, pricing, purchase drivers, competitive positioning, and market potential. Our work has covered categories including specialty coffee, tea products, fat-filled milk powder, berry, and RTE food markets and consumer-product markets. We also undertake product and concept testing to understand how consumers respond before a product reaches the market.",
        "The question behind the research: will consumers actually choose it — and what would make them choose it over the alternatives?",
      ],
    },
    {
      slug: "telecom-it",
      title: "Telecom & IT",
      summary: "In technology markets, yesterday's opportunity can quickly become tomorrow's standard.",
      body: [
        "New technologies create opportunities, but they also change customer expectations and competitive positions quickly. We help businesses understand technology markets, demand patterns, competitive positioning, emerging applications, and opportunities across evolving digital ecosystems.",
        "Our lens: technology adoption, customer expectations, market opportunity, competitive intelligence, emerging applications, product positioning, and industry trends. Examples of areas studied include mobile data offload, digital health, LIMS, media monitoring tools, control centre technologies, weather forecasting, and other technology-led markets.",
        "What matters most: separating genuine market opportunity from short-term market noise.",
      ],
    },
    {
      slug: "aerospace-defense",
      title: "Aerospace & Defense",
      summary: "Research for markets where precision matters.",
      body: [
        "Aerospace and defense markets involve specialised technologies, complex applications, long development cycles, and highly specific requirements. Our research approach focuses on understanding the market structure, applications, technology developments, competitive environment, and opportunity areas within specialised segments.",
        "We examine technology & applications, market opportunity, competitive landscape, industry developments, demand drivers, and specialised materials & systems.",
        "The objective: build enough market clarity to support strategic decisions in technically complex environments.",
      ],
    },
    {
      slug: "semiconductors-electronics",
      title: "Semiconductors & Electronics",
      summary: "Small components. Large market implications.",
      body: [
        "Electronics and semiconductor markets sit behind some of the fastest-changing technologies across industries. We look at markets at both the component and application level, connecting technology developments with demand, end-use opportunities, and competitive positioning.",
        "We study component demand, applications, technology adoption, competitive landscape, emerging technologies, market growth, and end-user requirements. Examples from our research include OLED, microfocus X-ray sources, advanced CO₂ sensors, digital scent technology, and specialised sensing and electronic technologies.",
        "The business question: where is technology moving from an emerging application to a commercially relevant opportunity?",
      ],
    },
    {
      slug: "energy-power",
      title: "Energy & Power",
      summary: "Understanding markets being reshaped by technology, infrastructure, and transition.",
      body: [
        "The energy sector is undergoing significant change. New technologies, infrastructure requirements, regulatory developments, and evolving energy systems are creating both opportunities and uncertainty. We examine the forces behind these changes to understand where demand is developing and which market segments have commercial potential.",
        "Our research covers market dynamics, demand & supply, technology adoption, infrastructure, competitive landscape, emerging applications, and investment opportunities. Our research has covered areas including wind blades, artificial lift, LNG bunkering, hydrogen-related technologies, and other energy and industrial applications.",
        "The focus: helping businesses assess market attractiveness, identify emerging opportunities, and understand the forces that could influence future growth.",
      ],
    },
    {
      slug: "chemicals-materials",
      title: "Chemicals & Materials",
      summary: "Where technical complexity meets commercial opportunity.",
      body: [
        "Chemicals and materials markets are shaped by more than production and demand. Applications, regulations, raw materials, customer requirements, supply chains, and competitive intensity can all influence market attractiveness. We bring these factors together to understand the market from the perspective of manufacturers, suppliers, customers, and competitors.",
        "We examine applications, demand, regulation, supply chain, competitive landscape, customer requirements, market entry, and growth opportunities. Our work also extends into customer satisfaction research, helping B2B and B2C businesses identify service gaps, customer expectations, and areas for improvement.",
        "The result: a clearer connection between technical market conditions and commercial decisions.",
      ],
    },
    {
      slug: "beyond-these-eight",
      title: "Beyond These Eight",
      summary: "Some markets don't fit neatly into one box. Neither does our research.",
      body: [
        "We work across cross-industry questions, where the challenge may involve multiple sectors, technologies, customer groups, or value-chain participants.",
        "Have a market question that isn't listed here? Tell us what you are trying to understand — we'll build the research around it.",
      ],
    },
  ],
};

export const insightsSection: Section = {
  key: "insights",
  path: "/insights",
  eyebrow: "Insights",
  title: "Insights to help you understand what's next.",
  intro:
    "Markets change quickly. Customer expectations shift. New technologies emerge. Regulations evolve. Competitive landscapes rarely stay still. Our Resources hub brings together research, analysis, industry perspectives, and findings from our work across markets and sectors — giving you practical information to better understand what is happening today and where opportunities may emerge tomorrow.",
  items: [
    {
      slug: "research-reports",
      title: "Research Reports",
      summary: "Go deeper into specific markets, industries, and geographies.",
      body: [
        "Go deeper into specific markets, industries, and geographies with detailed research covering market dynamics, opportunities, competition, and growth outlooks.",
      ],
    },
    {
      slug: "industry-reports",
      title: "Industry Reports",
      summary: "Sector-focused perspectives across the industries we cover.",
      body: [
        "Explore sector-focused perspectives across Healthcare, Automotive & Transportation, Chemicals & Materials, Energy & Power, Food & Beverages, Semiconductors & Electronics, Aerospace & Defense, Telecom & IT, and other areas we cover.",
      ],
    },
    {
      slug: "articles-insights",
      title: "Articles & Insights",
      summary: "Short, focused perspectives on market developments and emerging trends.",
      body: [
        "Short, focused perspectives on market developments, emerging trends, changing customer behaviour, and business issues worth watching.",
      ],
    },
    {
      slug: "whitepapers",
      title: "Whitepapers",
      summary: "Detailed analysis built around specific business questions and research themes.",
      body: [
        "Detailed analysis built around specific business questions, research themes, and market developments — designed for readers looking to go beyond the headlines.",
      ],
    },
    {
      slug: "case-studies",
      title: "Case Studies",
      summary: "See how research translates into business decisions.",
      body: [
        "See how research translates into business decisions. Explore selected engagements covering market assessment, market entry, customer satisfaction, competitive intelligence, and other strategic challenges.",
      ],
    },
    {
      slug: "surveys-research-findings",
      title: "Surveys & Research Findings",
      summary: "Selected findings from primary research, surveys, and stakeholder interactions.",
      body: [
        "Discover selected findings from primary research, surveys, and stakeholder interactions conducted across markets. From customer satisfaction to socio-economic studies, these findings offer a closer look at what the data reveals.",
      ],
    },
    {
      slug: "news-updates",
      title: "News & Updates",
      summary: "Stay informed about Chromatus — research, capabilities, and milestones.",
      body: [
        "Stay informed about Chromatus — our latest research, new capabilities, project milestones, and company updates.",
      ],
    },
  ],
};

export const careersSection: Section = {
  key: "careers",
  path: "/careers",
  eyebrow: "Careers",
  title: "Build your career around better questions.",
  intro:
    "At Chromatus, curiosity is part of the job. Good research starts with a good question — you'll work on questions that require you to look beyond the obvious, understand what the data is saying, and connect research with real business decisions.",
  items: [
    {
      slug: "who-we-look-for",
      title: "Who We Look For",
      summary: "Curious minds. Analytical thinkers. People who want to keep learning.",
      body: [
        "We value people who are comfortable asking \u201cwhy?\u201d, willing to explore unfamiliar subjects, and able to turn information into clear thinking.",
        "You may be starting your career or already have experience in research, analytics, consulting, or a specialised industry. What matters is your ability to learn quickly, think critically, work with others, and take ownership of your work.",
        "We look for people with curiosity — you want to understand how things work; analytical thinking — you can find patterns and meaning in information; attention to detail — you know that reliable research depends on getting the details right; communication skills — you can explain findings clearly, without making them unnecessarily complicated; ownership — you take responsibility for the quality of your work; and adaptability — you are comfortable moving between industries, topics, and research questions.",
      ],
    },
    {
      slug: "diversity-equity-inclusion",
      title: "Diversity, Equity & Inclusion",
      summary: "Different perspectives make better research.",
      body: [
        "Markets are made up of people with different experiences, needs, behaviours, and expectations. Understanding those differences is fundamental to good research.",
        "We value a working environment where people can bring their perspectives, contribute ideas, learn from one another, and be treated with respect — because better questions often come from looking at a problem from more than one point of view.",
      ],
    },
    {
      slug: "open-positions",
      title: "Open Positions",
      summary: "See your next opportunity at Chromatus.",
      body: [
        "Think you could contribute to the way we work? Explore current opportunities at Chromatus and find a role where your curiosity, analytical thinking, and willingness to learn can make a difference.",
        "Don't see the right role? You can still introduce yourself. If your experience or interests align with our work, we'd be interested in hearing from you.",
      ],
    },
  ],
};

export const sections = [
  aboutSection,
  servicesSection,
  industriesSection,
  insightsSection,
  careersSection,
];
