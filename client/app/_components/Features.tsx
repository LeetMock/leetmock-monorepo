import { Container } from "./Container"
import React from 'react';

interface FeatureCardProps {
    title: string;
    content: string;
    imageSrc: string;
    readMoreLink: string;
    iconSvg: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, content, imageSrc, readMoreLink, iconSvg }) => {
    return (
        <div className="group relative bg-white dark:bg-gray-800 transition hover:z-[1] hover:shadow-2xl hover:shadow-orange-500/20">
            <div className="relative space-y-8 py-12 p-8 h-full flex flex-col">
                <img
                    src={imageSrc}
                    className="w-12"
                    width="512"
                    height="512"
                    alt={`${title} illustration`}
                />

                <div className="space-y-2 flex-grow">
                    <h5
                        className="text-xl font-semibold text-gray-700 dark:text-white transition group-hover:text-orange-500"
                    >
                        {title}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-300">
                        {content}
                    </p>
                </div>
                <a href={readMoreLink} className="flex items-center justify-between group-hover:text-orange-500 mt-auto">
                    <span className="text-sm">Read more</span>
                    {iconSvg}
                </a>
            </div>
        </div>
    )
}


export const Features = () => {
    const readMoreIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -translate-x-4 text-2xl opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <path fill-rule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clip-rule="evenodd" />
        </svg>
    );

    return <div id="features">
        <Container>
            <div className="md:w-2/3 lg:w-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-orange-500">
                    <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-2.846-.813a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clip-rule="evenodd" />
                </svg>

                <h2 className="my-8 text-2xl font-bold text-gray-700 dark:text-white md:text-4xl">
                    AI Empowered Technical Mock Interviews Platform
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Leverage the latest AI to master your interviews and land your dream job with confidence.
                </p>
            </div>
            <div
                className="mt-16 grid divide-x divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden rounded-3xl border border-gray-100 text-gray-600 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0 xl:grid-cols-4"
            >
                <FeatureCard
                    title="Carefully Crafted Interview Process"
                    content="We've carefully crafted our problems and interview process to deliver a unique, optimized user experience that sets us apart."
                    imageSrc="https://cdn-icons-png.flaticon.com/512/4341/4341139.png"
                    readMoreLink="#"
                    iconSvg={readMoreIcon}
                />
                <FeatureCard
                    title="Real-Time Adaptive AI Interviewer"
                    content="The AI adjusts questions in real time and offers subtle hints, creating a true-to-life interview flow that balances challenge and support."
                    imageSrc="https://cdn-icons-png.flaticon.com/512/4341/4341160.png"
                    readMoreLink="#"
                    iconSvg={readMoreIcon}
                />
                <FeatureCard
                    title="AI that feels human"
                    content="Realistic, low-latency, seamless conversations to prepare you for the real interview experience."
                    imageSrc="https://cdn-icons-png.flaticon.com/512/4341/4341025.png"
                    readMoreLink="#"
                    iconSvg={readMoreIcon}
                />
                <FeatureCard
                    title="Technical & Behavioral Personalized Evaluation"
                    content="Personalized feedback that adapts to your growth, providing detailed insights to refine both your technical and soft skills"
                    imageSrc="https://cdn-icons-png.flaticon.com/512/4341/4341134.png"
                    readMoreLink="#"
                    iconSvg={readMoreIcon}
                />
                
            </div>
        </Container>
    </div>
}