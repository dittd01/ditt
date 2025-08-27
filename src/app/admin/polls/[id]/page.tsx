

'use client';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { allTopics, categories } from '@/lib/data';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Wand2,
  ListChecks,
  ScanSearch,
  ShieldAlert,
  Trash2,
  PlusCircle,
  GripVertical,
  Eye,
  ArrowLeft,
  Sparkles,
  Loader2,
  Edit,
  Save,
  XCircle,
  Send,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/ui/combobox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState, useRef } from 'react';
import { populatePollAction } from '@/app/actions';
import { Label } from '@/components/ui/label';
import type { Topic } from '@/lib/types';
import { currentUser } from '@/lib/user-data';

const pollFormSchema = z.object({
  title: z.string().min(12, 'Title must be at least 12 characters.').max(120, 'Title must be 120 characters or less.'),
  slug: z.string().min(1, 'Slug is required.'),
  language: z.enum(['en', 'no']),
  categoryId: z.string({ required_error: 'Category is required.' }),
  subcategoryId: z.string({ required_error: 'Subcategory is required.' }),
  tags: z.array(z.string()).optional(),
  description_md: z.string().min(20, 'Description must be at least 20 characters.').max(1200),
  background_md: z.string().max(1500).optional(),
  options: z.array(
      z.object({
        id: z.string(),
        label: z.string().min(1, 'Option label cannot be empty.'),
      })
    ).min(2, 'Must have at least 2 options.').max(6, 'Cannot have more than 6 options.'),
  isDefaultOptions: z.boolean(),
  pros: z.array(z.string()).max(7),
  cons: z.array(z.string()).max(7),
  sources: z.array(
    z.object({
      title: z.string().min(1),
      url: z.string().url(),
    })
  ).max(10),
  status: z.enum(['draft', 'review', 'live', 'scheduled', 'archived']),
  goLiveAt: z.date().optional(),
  closeAt: z.date().optional(),
  featureFlags: z.object({
    aiAssist: z.boolean(),
    comments: z.boolean(),
  }),
}).refine(data => {
    if (data.status === 'scheduled' && !data.goLiveAt) {
        return false;
    }
    return true;
}, {
    message: "Go-live date is required for scheduled polls.",
    path: ['goLiveAt'],
}).refine(data => {
    if(data.goLiveAt && data.closeAt) {
        return data.closeAt > data.goLiveAt;
    }
    return true;
}, {
    message: "Closing date must be after the go-live date.",
    path: ['closeAt'],
});

type PollFormValues = z.infer<typeof pollFormSchema>;
type SubmitAction = 'review' | 'publish';

const mockTags = [
    { value: 'economy', label: 'Economy' },
    { value: 'social', label: 'Social' },
    { value: 'environment', label: 'Environment' },
    { value: 'foreign-policy', label: 'Foreign Policy' },
]

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
}

const DEFAULT_POPULATE_POLL_PROMPT = `You are an expert editor and political analyst for a neutral voting platform. Your task is to take a user's poll title and generate a complete, well-structured poll.

Your primary sources of truth for any factual claims, statistics, or financial data are the official Norwegian government budget (Regjeringen.no) and Statistics Norway (SSB.no). Use information from these sites to inform your generated content.
**Crucially, do not invent data.** If you mention a statistic (e.g., "statsgjelden ved utgangen av 2022"), you must provide the real number from your sources. If you do not have the number, do not include the sentence.

- https://www.regjeringen.no/no/id4/
- https://www.ssb.no

Follow these instructions precisely:

1.  **Detect Language**: Analyze the user's title and determine if it is primarily English or Norwegian. Set the 'language' field to 'en' for English or 'no' for Norwegian.
2.  **Generate Content in Detected Language**: All subsequent text fields (title, description, pros, cons) **must** be generated in the language you detected in step 1.
3.  **Refine Title**: Rewrite the user's title to be a clear, neutral, and unbiased question that can be voted on.
4.  **Generate Description**: Write a brief (2-3 sentences), neutral, and encyclopedic background for the topic. Ground any data points in the provided official sources.
5.  **Generate Arguments**: Create exactly three distinct, strong, and concise arguments FOR the proposal (pros) and exactly three distinct, strong, and concise arguments AGAINST it (cons). These should reflect common real-world viewpoints on the issue.
6.  **Categorize**: Based on the provided taxonomy, assign the poll to the most relevant **category** and **subcategory**. Your output for the category and subcategory fields must be the **ID** (e.g., 'taxation', 'wealth_tax'), not the label.
7.  **Generate Tags**: Provide an array of 3 to 5 relevant, single-word, lowercase tags for the topic.
8.  **Generate Background**: Write a more comprehensive (5-15 sentences), neutral, and encyclopedic background for the topic. preferred source: https://www.regjeringen.no/no/id4/ and https://www.ssb.no
9.  **Add Source Links**: If you used any of the official sources provided to generate the background or description, include them in the 'sources' array. Each source should be an object with a 'title' (e.g., "SSB: Public Finances") and a 'url'.

Return ONLY a single, valid JSON object matching the output schema.

**Taxonomy for Categorization:**
{{{taxonomy_json}}}

**User-provided Title:**
"{{{title}}}"
`;

const defaultNewPollValues = {
      title: '',
      slug: '',
      language: 'en' as const,
      categoryId: '',
      subcategoryId: '',
      tags: [],
      description_md: '',
      background_md: '',
      isDefaultOptions: true,
      options: [
        { id: 'yes', label: 'Yes' },
        { id: 'no', label: 'No' },
      ],
      pros: [],
      cons: [],
      sources: [],
      status: 'draft' as const,
      featureFlags: { aiAssist: true, comments: true },
};

export default function EditPollPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const pollId = params.id as string;

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_POPULATE_POLL_PROMPT);
  const submitAction = useRef<SubmitAction>('review');

  const isNew = pollId === 'new';
  const pollData = isNew ? null : allTopics.find(p => p.id === pollId);
  
  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: isNew ? defaultNewPollValues : {
        title: pollData?.question,
        slug: pollData?.slug,
        language: 'en',
        categoryId: pollData?.categoryId,
        subcategoryId: pollData?.subcategoryId,
        tags: ['economy'],
        description_md: pollData?.description,
        background_md: 'This topic has been a subject of public debate for several years, with significant attention from major political parties and media outlets. Recent polling data shows a divided public opinion.',
        isDefaultOptions: pollData?.voteType === 'yesno' || !pollData,
        options: pollData?.options.filter(o => o.id !== 'abstain') || [],
        pros: ["Boosts economic growth by encouraging investment.", "Simplifies the tax code for individuals and businesses.", "Aligns Norway with international tax norms."],
        cons: ["Increases wealth inequality.", "Reduces public revenue for essential services.", "May not significantly impact investment decisions."],
        sources: [{title: 'Statistics Norway - Wealth Distribution Report', url: 'https://www.ssb.no/'}],
        status: pollData?.status || 'draft',
        goLiveAt: undefined,
        closeAt: undefined,
        featureFlags: { aiAssist: true, comments: false },
    }
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({ control: form.control, name: "options" });
  const { fields: sourceFields, append: appendSource, remove: removeSource, replace: replaceSources } = useFieldArray({ control: form.control, name: "sources" });
  const { fields: proFields, append: appendPro, replace: replacePros } = useFieldArray({ control: form.control, name: "pros" });
  const { fields: conFields, append: appendCon, replace: replaceCons } = useFieldArray({ control: form.control, name: "cons" });

  const watchCategoryId = form.watch('categoryId');
  const watchIsDefaultOptions = form.watch('isDefaultOptions');
  const watchStatus = form.watch('status');
  const watchTitle = form.watch('title');

  useEffect(() => {
    if (isNew || form.getValues('slug') === '' || form.getValues('slug') === generateSlug(form.getValues('title'))) {
      const newSlug = generateSlug(watchTitle);
      form.setValue('slug', newSlug, { shouldValidate: true, shouldDirty: true });
    }
  }, [watchTitle, form, isNew]);

  const availableSubcategories = categories.find(c => c.id === watchCategoryId)?.subcategories || [];
  
  const getCategoryLabel = (id: string) => categories.find(c => c.id === id)?.label || id;
  const getSubcategoryLabel = (catId: string, subId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.subcategories.find(s => s.id === subId)?.label || subId;
  };


  function onSubmit(data: PollFormValues) {
    if (isNew) {
      if (submitAction.current === 'publish') {
         publishPoll(data);
      } else {
         submitForReview(data);
      }
    } else {
      updatePoll(data);
    }
  }

  const publishPoll = (data: PollFormValues) => {
      const newTopic: Topic = {
        id: `topic_${Date.now()}`,
        slug: data.slug,
        question: data.title,
        question_en: data.title,
        description: data.description_md,
        description_en: data.description_md,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        imageUrl: 'https://placehold.co/600x400.png',
        aiHint: 'newly created poll',
        status: 'live',
        voteType: data.isDefaultOptions ? 'yesno' : 'ranked',
        votes: { yes: 0, no: 0, abstain: 0 },
        totalVotes: 0, votesLastWeek: 0, votesLastMonth: 0, votesLastYear: 0, history: [],
        averageImportance: 2.5,
        author: currentUser.displayName,
        options: data.isDefaultOptions
          ? [
              { id: 'yes', label: 'Yes', color: 'hsl(var(--chart-2))' },
              { id: 'no', label: 'No', color: 'hsl(var(--chart-1))' },
              { id: 'abstain', label: 'Abstain', color: 'hsl(var(--muted))' }
            ]
          : data.options.map((opt, i) => ({ ...opt, color: `hsl(var(--chart-${i+1}))` })),
      };

      const customTopics = JSON.parse(localStorage.getItem('custom_topics') || '[]');
      customTopics.push(newTopic);
      localStorage.setItem('custom_topics', JSON.stringify(customTopics));
      window.dispatchEvent(new Event('topicAdded'));
      
      toast({
        title: "Poll Published!",
        description: "Your new poll is now live.",
      });
      router.push('/admin/polls');
  }

  const submitForReview = (data: PollFormValues) => {
    const reviewQueue = JSON.parse(localStorage.getItem('manual_review_queue') || '[]');
    const newSuggestion = {
      id: `suggestion_${Date.now()}`,
      text: data.title,
      verdict: 'Admin-Created',
      status: 'Pending',
      created: new Date().toISOString().split('T')[0],
      author: currentUser.displayName,
    };
    reviewQueue.unshift(newSuggestion);
    localStorage.setItem('manual_review_queue', JSON.stringify(reviewQueue));

    window.dispatchEvent(new Event('topicAdded'));

    toast({
        title: "Poll Submitted for Review",
        description: "The poll has been added to the suggestions queue.",
    });
    router.push('/admin/suggestions-queue');
  }

  const updatePoll = (data: PollFormValues) => {
      console.log("Updating existing poll:", data);
      toast({
          title: "Poll Updated!",
          description: "Your changes have been saved successfully.",
      });
  }

  const handleClearForm = () => {
    form.reset(defaultNewPollValues);
    toast({
        title: "Form Cleared",
        description: "All fields have been reset to their default values.",
    })
  }

  const handleAutoPopulate = async () => {
    const title = form.getValues('title');
    if (!title) {
        toast({
            variant: 'destructive',
            title: 'Title is required',
            description: 'Please enter a title before using the AI Copilot.',
        });
        return;
    }
    setIsAiLoading(true);
    try {
        const result = await populatePollAction({ title, customPrompt });
        if (result.success) {
            form.reset({
                ...form.getValues(),
                title: result.data.title,
                description_md: result.data.description,
                background_md: result.data.background_md || '',
                pros: result.data.pros,
                cons: result.data.cons,
                language: result.data.language,
                categoryId: result.data.category,
                subcategoryId: result.data.subcategory,
                tags: result.data.tags,
                sources: result.data.sources || [],
            });
            replacePros(result.data.pros.map(p => p));
            replaceCons(result.data.cons.map(c => c));
            replaceSources(result.data.sources || []);

            toast({
                title: 'Content Generated!',
                description: 'The poll details have been populated by AI.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'AI Generation Failed',
                description: result.message,
            });
        }
    } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'An unexpected error occurred.',
        });
    }
    setIsAiLoading(false);
  }

  const handleToggleEditPrompt = () => {
    if (isEditingPrompt) {
      toast({
        title: 'AI Instructions Saved',
        description: 'Your custom instructions will be used for this session.',
      });
    }
    setIsEditingPrompt(!isEditingPrompt);
  };
  
  const handleFormSubmit = (action: SubmitAction) => {
    submitAction.current = action;
    form.handleSubmit(onSubmit)();
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <PageHeader
          title={isNew ? "Create New Poll" : "Edit Poll"}
          subtitle={isNew ? "Fill in the details for your new poll." : "Modify an existing poll and manage its settings."}
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            {isNew && <Button variant="outline" type="button" onClick={handleClearForm}><XCircle className="mr-2 h-4 w-4" />Clear form</Button>}
            <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
            {isNew ? (
              <>
                <Button variant="secondary" onClick={() => handleFormSubmit('review')}>
                    <Send className="mr-2 h-4 w-4" />
                    Submit for Review
                </Button>
                <Button onClick={() => handleFormSubmit('publish')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Publish
                </Button>
              </>
            ) : (
                 <Button onClick={() => handleFormSubmit('publish')}>Save Changes</Button>
            )}
          </div>
        </PageHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Core Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Core Details</CardTitle>
                <CardDescription>The fundamental information about this poll.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="slug" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                             <FormDescription>This is the URL-friendly version of the title.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="language" render={({ field }) => (
                         <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="no">Norwegian</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <FormField control={form.control} name="categoryId" render={({ field }) => (
                         <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl><Input readOnly value={getCategoryLabel(field.value)} placeholder="Set by AI" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="subcategoryId" render={({ field }) => (
                         <FormItem>
                            <FormLabel>Subcategory</FormLabel>
                            <FormControl><Input readOnly value={getSubcategoryLabel(form.getValues('categoryId'), field.value)} placeholder="Set by AI" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                 </div>
                  <FormField control={form.control} name="tags" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Tags</FormLabel>
                           <FormControl>
                               <Input readOnly value={field.value?.join(', ')} placeholder="Set by AI" />
                           </FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
              </CardContent>
            </Card>

            {/* Content Card */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>The main text voters will see.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="description_md" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormDescription>A brief, neutral summary of the poll topic. Markdown is supported.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="background_md" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                     <FormDescription>Optional. Provide more context, history, or technical details.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            
            {/* Options Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Voting Options</CardTitle>
                        <CardDescription>Configure the choices available to voters.</CardDescription>
                    </div>
                    <FormField control={form.control} name="isDefaultOptions" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel>Use Default (Yes/No)</FormLabel>
                        </FormItem>
                    )} />
                </div>
              </CardHeader>
              <CardContent>
                {!watchIsDefaultOptions ? (
                    <div className="space-y-2">
                        {optionFields.map((field, index) => (
                             <div key={field.id} className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                <FormField
                                    control={form.control}
                                    name={`options.${index}.label`}
                                    render={({ field }) => (
                                        <Input {...field} placeholder={`Option ${index + 1}`} />
                                    )}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendOption({id: `opt_${Date.now()}`, label: ''})} disabled={optionFields.length >= 6}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                        </Button>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Default "Yes", "No", and "Abstain" options will be used.</p>
                )}
              </CardContent>
            </Card>

            {/* Pros & Cons Card */}
            <Card>
                <CardHeader><CardTitle>Pros & Cons</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <FormLabel>Pros</FormLabel>
                        {proFields.map((field, index) => (
                             <FormField key={field.id} control={form.control} name={`pros.${index}`} render={({field}) => <Input {...field} />} />
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendPro('')}><PlusCircle className="mr-2 h-4 w-4" />Add Pro</Button>
                    </div>
                     <div className="space-y-2">
                        <FormLabel>Cons</FormLabel>
                        {conFields.map((field, index) => (
                             <FormField key={field.id} control={form.control} name={`cons.${index}`} render={({field}) => <Input {...field} />} />
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendCon('')}><PlusCircle className="mr-2 h-4 w-4" />Add Con</Button>
                    </div>
                </CardContent>
            </Card>

             {/* Sources Card */}
            <Card>
              <CardHeader><CardTitle>Sources</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  {sourceFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-2 items-start">
                          <FormField control={form.control} name={`sources.${index}.title`} render={({field}) => <Input {...field} placeholder="Source Title"/>} />
                          <FormField control={form.control} name={`sources.${index}.url`} render={({field}) => <Input {...field} placeholder="https://..."/>} />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeSource(index)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendSource({title: '', url: ''})}><PlusCircle className="mr-2"/> Add Source</Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            {/* Visibility Card */}
            <Card>
                <CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="status" render={({ field }) => (
                         <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="review">In Review</SelectItem>
                                    <SelectItem value="live">Live</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                    {watchStatus === 'scheduled' && (
                        <FormField control={form.control} name="goLiveAt" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Go-Live Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                 <FormMessage />
                            </FormItem>
                        )} />
                    )}
                     <FormField control={form.control} name="closeAt" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Closing Date (optional)</FormLabel>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                     )} />
                </CardContent>
                 <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                    <FormField control={form.control} name="featureFlags.comments" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                           <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                           <FormLabel>Enable Comments</FormLabel>
                        </FormItem>
                     )} />
                    <FormField control={form.control} name="featureFlags.aiAssist" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                           <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                           <FormLabel>AI Assist Enabled</FormLabel>
                        </FormItem>
                     )} />
                 </CardFooter>
            </Card>

            {/* AI Copilot Card */}
            <Card className="sticky top-20">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>AI Copilot</CardTitle>
                        <CardDescription>Use AI to generate all poll content from just the title.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleToggleEditPrompt}>
                        {isEditingPrompt ? <Save /> : <Edit />}
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="default" className="w-full" onClick={handleAutoPopulate} disabled={isAiLoading}>
                    {isAiLoading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                    Auto-populate from Title
                </Button>
                 <div className="space-y-2">
                    <Label htmlFor="ai-prompt">AI Instructions</Label>
                    <Textarea 
                        id="ai-prompt"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        readOnly={!isEditingPrompt}
                        className={cn("text-xs text-muted-foreground h-48", !isEditingPrompt && "bg-muted/50 border-dashed")}
                    />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
