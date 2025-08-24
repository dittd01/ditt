
import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { allTopics, categories } from '@/lib/data';
import type { Topic, Category, Subcategory } from '@/lib/types';
import { VoteCard } from '@/components/VoteCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';
import { TopicFilters } from '@/components/TopicFilters';

type GroupedTopics = {
    [categoryId: string]: {
        category: Category;
        subcategories: {
            [subcategoryId: string]: {
                subcategory: Subcategory;
                topics: Topic[];
            }
        }
    }
}

// Client Component to manage accordion state and user interactions
function AllTopicsContent({ groupedTopics, votedTopicIds, lang }: { groupedTopics: GroupedTopics, votedTopicIds: Set<string>, lang: 'en' | 'nb' }) {
    const [openSubcategories, setOpenSubcategories] = useState<string[]>([]);

    // Memoize the list of all subcategory IDs to avoid recalculating on every render.
    // This is a performance optimization.
    const allSubcategoryIds = useMemo(() => {
        return Object.values(groupedTopics).flatMap(({ subcategories }) => 
            Object.keys(subcategories)
        );
    }, [groupedTopics]);

    // This effect runs once on the client after the initial server render.
    // It sets the initial state of the accordions to be all open, improving discoverability.
    useEffect(() => {
        if (allSubcategoryIds.length > 0) {
            setOpenSubcategories(allSubcategoryIds);
        }
    }, [allSubcategoryIds]);

    const expandAll = () => setOpenSubcategories(allSubcategoryIds);
    const collapseAll = () => setOpenSubcategories([]);
    const toggleAll = () => {
        if (openSubcategories.length === allSubcategoryIds.length) {
            collapseAll();
        } else {
            expandAll();
        }
    };

    return (
         <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold font-headline tracking-tight">{lang === 'nb' ? 'Alle Temaer' : 'All Topics'}</h1>
                <p className="text-lg text-muted-foreground mt-2">{lang === 'nb' ? 'Bla gjennom alle tilgjengelige avstemninger, organisert etter kategori.' : 'Browse every available poll, organized by category.'}</p>
            </div>
            
             <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <TopicFilters categories={categories} />
                <Button variant="outline" onClick={toggleAll} size="sm">
                    <ChevronsUpDown className="mr-2 h-4 w-4" />
                    {openSubcategories.length === allSubcategoryIds.length ? (lang === 'nb' ? 'Skjul Alle' : 'Collapse All') : (lang === 'nb' ? 'Vis Alle' : 'Expand All')}
                </Button>
            </div>
            
            <div className="space-y-8">
                {Object.keys(groupedTopics).length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">{lang === 'nb' ? 'Ingen temaer funnet for de valgte filtrene.' : 'No topics found for the selected filters.'}</p>
                    </div>
                ) : (
                    Object.values(groupedTopics).sort((a,b) => {
                        if (a.category.id === 'election_2025') return -1;
                        if (b.category.id === 'election_2025') return 1;
                        return (lang === 'nb' ? a.category.label_nb : a.category.label).localeCompare(lang === 'nb' ? b.category.label_nb : b.category.label);
                    }).map(({ category, subcategories }) => (
                        <section key={category.id} className="scroll-mt-24" id={category.id}>
                            <h2 className="text-3xl font-bold border-b pb-4 mb-6">{lang === 'nb' ? category.label_nb : category.label}</h2>
                            
                            <Accordion type="multiple" value={openSubcategories} onValueChange={setOpenSubcategories} className="w-full space-y-4">
                               {Object.values(subcategories).sort((a,b) => (lang === 'nb' ? a.subcategory.label_nb : a.subcategory.label).localeCompare(lang === 'nb' ? b.subcategory.label_nb : b.subcategory.label)).map(({ subcategory, topics }) => (
                                   <AccordionItem value={subcategory.id} key={subcategory.id} className="border-none">
                                        <AccordionTrigger className="text-xl font-semibold p-4 border rounded-lg bg-card text-card-foreground shadow-sm hover:no-underline">
                                            {lang === 'nb' ? subcategory.label_nb : subcategory.label}
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                                {topics.map(topic => (
                                                    <VoteCard key={topic.id} topic={topic} hasVoted={votedTopicIds.has(topic.id)} />
                                                ))}
                                            </div>
                                        </AccordionContent>
                                   </AccordionItem>
                               ))}
                            </Accordion>
                        </section>
                    ))
                )}
            </div>
        </div>
    )
}

function AllTopicsPageContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    // This logic remains on the server, ensuring data is processed before sending to the client.
    const categoryFilter = searchParams?.category || 'all';
    const subcategoryFilter = searchParams?.subcategory || 'all';

    const filteredTopics = useMemo(() => {
        return allTopics.filter(topic => {
            const categoryMatch = categoryFilter === 'all' || topic.categoryId === categoryFilter;
            const subcategoryMatch = subcategoryFilter === 'all' || topic.subcategoryId === subcategoryFilter;
            return categoryMatch && subcategoryMatch;
        });
    }, [categoryFilter, subcategoryFilter]);
    
    const groupedTopics = useMemo(() => {
        const groups: GroupedTopics = {};
        const electionPoll = allTopics.find(t => t.voteType === 'election');
        const standardTopics = filteredTopics.filter(t => t.voteType !== 'election');

        if (electionPoll && categoryFilter === 'all') {
            const electionCategory = categories.find(c => c.id === 'election_2025');
            if (electionCategory) {
                groups['election_2025'] = {
                    category: electionCategory,
                    subcategories: {
                        'election': {
                            subcategory: { id: 'election', label: 'National Election', label_nb: 'Stortingsvalg', categoryId: 'election_2025' },
                            topics: [electionPoll]
                        }
                    }
                };
            }
        }

        for (const topic of standardTopics) {
            if (!groups[topic.categoryId]) {
                const category = categories.find(c => c.id === topic.categoryId);
                if (category) {
                    groups[topic.categoryId] = { category, subcategories: {} };
                }
            }
            const group = groups[topic.categoryId];
            if (group && !group.subcategories[topic.subcategoryId]) {
                 const subcategory = group.category.subcategories.find(s => s.id === topic.subcategoryId);
                 if (subcategory) {
                    group.subcategories[topic.subcategoryId] = { subcategory, topics: [] };
                 }
            }
            if(group && group.subcategories[topic.subcategoryId]) {
                group.subcategories[topic.subcategoryId].topics.push(topic);
            }
        }
        return groups;
    }, [filteredTopics, categoryFilter]);
    
    // In a real app, this would also be determined on the server based on the user's session.
    // For the prototype, we pass this logic to the client component to read from localStorage.
    const votedTopicIds = new Set<string>(); // Placeholder, will be populated on client.
    
    // Dummy language for server render, will be corrected on client.
    const lang = 'en';

    return <AllTopicsContent groupedTopics={groupedTopics} votedTopicIds={votedTopicIds} lang={lang} />;
}

// The main export is a Server Component that wraps the logic in a Suspense boundary.
// This allows the client-side search parameters to be used safely.
export default function AllTopicsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AllTopicsPageWrapper />
        </Suspense>
    );
}

// A wrapper component to safely use the useSearchParams hook.
function AllTopicsPageWrapper() {
    const searchParams = useSearchParams();
    // Convert searchParams to a simple object to pass to the server component logic container.
    const params = Object.fromEntries(searchParams.entries());
    return <AllTopicsPageContent searchParams={params} />;
}
