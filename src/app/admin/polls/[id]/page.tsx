
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/ui/combobox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { populatePollAction } from '@/app/actions';

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

export default function EditPollPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const pollId = params.id as string;

  const [isAiLoading, setIsAiLoading] = useState(false);
  const isNew = pollId === 'new';
  const pollData = isNew ? null : allTopics.find(p => p.id === pollId);
  
  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: isNew ? {
      title: '',
      slug: '',
      language: 'en',
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
      status: 'draft',
      featureFlags: { aiAssist: true, comments: true },
    } : {
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
  const { fields: sourceFields, append: appendSource, remove: removeSource } = useFieldArray({ control: form.control, name: "sources" });
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

  function onSubmit(data: PollFormValues) {
    console.log(data);
    toast({
      title: "Poll Saved!",
      description: "Your changes have been saved successfully.",
    });
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
        const result = await populatePollAction({ title });
        if (result.success) {
            form.reset({
                ...form.getValues(), // Keep existing values like title, slug etc.
                description_md: result.data.description,
                pros: result.data.pros,
                cons: result.data.cons,
                categoryId: result.data.category,
                subcategoryId: result.data.subcategory,
                tags: result.data.tags,
            });
            replacePros(result.data.pros.map(p => p));
            replaceCons(result.data.cons.map(c => c));

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <PageHeader
          title={isNew ? "Create New Poll" : "Edit Poll"}
          subtitle={isNew ? "Fill in the details for your new poll." : "Modify an existing poll and manage its settings."}
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
            <Button type="submit">Save Draft</Button>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category..."/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {categories.filter(c => c.id !== 'election_2025').map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="subcategoryId" render={({ field }) => (
                         <FormItem>
                            <FormLabel>Subcategory</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!watchCategoryId}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a subcategory..."/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {availableSubcategories.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                 </div>
                  <FormField control={form.control} name="tags" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Tags</FormLabel>
                           <FormControl>
                               <Combobox
                                   options={mockTags}
                                   placeholder="Select tags..."
                                   value={field.value}
                                   onValueChange={field.onChange}
                                />
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
                    <FormControl><Textarea {...field} rows={5} /></FormControl>
                    <FormDescription>A brief, neutral summary of the poll topic. Markdown is supported.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="background_md" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background</FormLabel>
                    <FormControl><Textarea {...field} rows={3} /></FormControl>
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
                <CardTitle>AI Copilot</CardTitle>
                <CardDescription>Tools to help you craft a great poll.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="default" className="w-full justify-start" onClick={handleAutoPopulate} disabled={isAiLoading}>
                    {isAiLoading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                    Auto-populate from Title
                </Button>
                <Separator className="my-2" />
                <Button variant="secondary" className="w-full justify-start"><ScanSearch className="mr-2" /> Duplicate Check</Button>
                <Button variant="secondary" className="w-full justify-start"><ShieldAlert className="mr-2" /> Readability & Bias Audit</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
