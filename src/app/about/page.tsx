
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
            logo: <Image src="https://www.google.com/images/branding/product/2x/maps_96in128dp.png" alt="Google Maps logo" layout="fill" objectFit="contain" />,
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
