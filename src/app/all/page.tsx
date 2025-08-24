
'use client';

import { useState, useEffect, useMemo } from 'react';
import { allTopics, categories } from '@/lib/data';
import type { Topic, Category, Subcategory } from '@/lib/types';
import { VoteCard } from '@/components/VoteCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';

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

export default function AllTopicsPage() {
    const [groupedTopics, setGroupedTopics] = useState<GroupedTopics>({});
    const [votedTopicIds, setVotedTopicIds] = useState<Set<string>>(new Set());
    const [openSubcategories, setOpenSubcategories] = useState<string[]>([]);
    
    const allSubcategoryIds = useMemo(() => {
        return Object.values(groupedTopics).flatMap(({ subcategories }) => 
            Object.keys(subcategories)
        );
    }, [groupedTopics]);

    useEffect(() => {
        const groups: GroupedTopics = {};
        const electionPoll = allTopics.find(t => t.voteType === 'election');
        const standardTopics = allTopics.filter(t => t.voteType !== 'election');

        // Handle Election separately
        if (electionPoll) {
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
                    groups[topic.categoryId] = {
                        category,
                        subcategories: {}
                    };
                }
            }
            
            if (groups[topic.categoryId] && !groups[topic.categoryId].subcategories[topic.subcategoryId]) {
                 const category = categories.find(c => c.id === topic.categoryId);
                 const subcategory = category?.subcategories.find(s => s.id === topic.subcategoryId);
                 if (subcategory) {
                    groups[topic.categoryId].subcategories[topic.subcategoryId] = {
                        subcategory,
                        topics: []
                    };
                 }
            }

            if(groups[topic.categoryId] && groups[topic.categoryId].subcategories[topic.subcategoryId]) {
                groups[topic.categoryId].subcategories[topic.subcategoryId].topics.push(topic);
            }
        }

        setGroupedTopics(groups);
         const votedIds = new Set<string>();
        allTopics.forEach(topic => {
            if (localStorage.getItem(`voted_on_${topic.id}`)) {
            votedIds.add(topic.id);
            }
        });
        setVotedTopicIds(votedIds);

    }, []);
    
    useEffect(() => {
        // Initially expand all categories
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
                <h1 className="text-4xl font-bold font-headline tracking-tight">All Topics</h1>
                <p className="text-lg text-muted-foreground mt-2">Browse every available poll, organized by category.</p>
            </div>
            
             <div className="flex justify-end mb-4">
                <Button variant="outline" onClick={toggleAll} size="sm">
                    <ChevronsUpDown className="mr-2 h-4 w-4" />
                    {openSubcategories.length === allSubcategoryIds.length ? 'Collapse All' : 'Expand All'}
                </Button>
            </div>
            
            <div className="space-y-8">
                {Object.values(groupedTopics).sort((a,b) => {
                    if (a.category.id === 'election_2025') return -1;
                    if (b.category.id === 'election_2025') return 1;
                    return a.category.label.localeCompare(b.category.label);
                }).map(({ category, subcategories }) => (
                    <section key={category.id} className="scroll-mt-24" id={category.id}>
                        <h2 className="text-3xl font-bold border-b pb-4 mb-6">{category.label}</h2>
                        
                        <Accordion type="multiple" value={openSubcategories} onValueChange={setOpenSubcategories} className="w-full space-y-4">
                           {Object.values(subcategories).sort((a,b) => a.subcategory.label.localeCompare(b.subcategory.label)).map(({ subcategory, topics }) => (
                               <AccordionItem value={subcategory.id} key={subcategory.id} className="border-none">
                                    <AccordionTrigger className="text-xl font-semibold p-4 border rounded-lg bg-card text-card-foreground shadow-sm hover:no-underline">
                                        {subcategory.label}
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
                ))}
            </div>
        </div>
    );
}
