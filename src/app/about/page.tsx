
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import Image from 'next/image';

const TechCard = ({ logo, title, description, index }: { logo: React.ReactNode, title: string, description: string, index: number }) => (
    <Card className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`}}>
        <CardHeader className="items-center">
            <div className="relative h-16 w-16 mb-2">
                {logo}
            </div>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function AboutUsPage() {
    const technologies = [
        {
            logo: <Image src="https://cdn.worldvectorlogo.com/logos/next-js.svg" alt="Next.js logo" layout="fill" objectFit="contain" />,
            title: 'Next.js & React',
            description: 'For a high-performance, server-rendered user interface that is both fast and scalable.'
        },
        {
            logo: <Image src="https://cdn.worldvectorlogo.com/logos/tailwindcss.svg" alt="Tailwind CSS logo" layout="fill" objectFit="contain" />,
            title: 'Tailwind CSS',
            description: 'For rapid, utility-first styling that creates a modern and responsive design system.'
        },
        {
            logo: <Image src="data:image/png;base64,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" alt="Google Maps logo" layout="fill" objectFit="contain" />,
            title: 'Google Maps Platform',
            description: 'Powers our core features, including live maps, heatmaps, and smart route navigation.'
        },
        {
            logo: <Image src="https://www.gstatic.com/devrel-devsite/prod/v229de41e0508544773a48e7146ce2353b3f94747a16f21272b2203b57a60d53c/firebase/images/lockup.svg" alt="Firebase logo" layout="fill" objectFit="contain" />,
            title: 'Firebase',
            description: 'Provides the backend-as-a-service for data storage, ensuring real-time updates and scalability.'
        },
        {
            logo: <Image src="https://static-00.iconduck.com/assets.00/genkit-icon-2048x2048-s6r5fb2j.png" alt="Genkit logo" layout="fill" objectFit="contain" />,
            title: 'Genkit & Gemini',
            description: 'Drives our AI features, including description enhancement and risk analysis.'
        },
        {
            logo: <Image src="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" alt="Vercel logo" layout="fill" objectFit="contain" />,
            title: 'Vercel',
            description: 'For seamless, continuous deployment and global hosting that ensures our app is always available.'
        },
    ];

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12 animate-fade-in">
            <header className="text-center mb-16">
                <Icons.logo className="h-20 w-20 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold tracking-tight">Our Mission</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    To build smarter, safer, and more responsive communities by connecting citizens directly with the officials who can solve real-world problems.
                </p>
            </header>

            <section className="mb-20">
                <h2 className="text-3xl font-bold text-center mb-10">How We Stand Out</h2>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-semibold">Bridging the Communication Gap</h3>
                        <p className="text-muted-foreground">
                            Traditional methods of reporting civic issues are often slow, opaque, and frustrating. ResolveX cuts through the noise. By allowing citizens to report issues with geo-tagged photos, we provide officials with precise, actionable data.
                        </p>
                        <h3 className="text-2xl font-semibold">Data-Driven Governance</h3>
                         <p className="text-muted-foreground">
                            We empower local authorities with a powerful command center. The live map, risk heatmaps, and analytics dashboards transform scattered complaints into clear, strategic insights. This is about fixing not just one pothole, but understanding where resources are needed most.
                        </p>
                    </div>
                     <div className="relative h-64 w-full animate-fade-in-up" style={{animationDelay: '300ms'}}>
                        <Image src="https://picsum.photos/seed/about/600/400" alt="Community collaboration" layout="fill" className="object-cover rounded-lg" data-ai-hint="collaboration community" />
                    </div>
                </div>
            </section>
            
            <section className="text-center mb-20">
                <h2 className="text-3xl font-bold mb-10">The Technology Behind ResolveX</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
                    We use a modern, powerful, and scalable technology stack to deliver a seamless experience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {technologies.map((tech, index) => (
                        <TechCard key={tech.title} {...tech} index={index} />
                    ))}
                </div>
            </section>

            <footer className="text-center">
                <p className="text-2xl font-semibold text-primary tracking-wider">
                    ResolveX: Your Community, Your Voice, Our Mission.
                </p>
            </footer>
        </div>
    );
}
