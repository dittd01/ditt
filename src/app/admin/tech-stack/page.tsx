
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const techStack = {
  'Frontend Framework': [
    { name: 'Next.js', version: '15.3.3', description: 'React framework for server-rendered applications, using the App Router.' },
    { name: 'React', version: '18.3.1', description: 'Core UI library for building components.' },
  ],
  'Language': [
    { name: 'TypeScript', version: '5', description: 'Statically typed superset of JavaScript for enhanced code quality.' },
  ],
  'UI & Styling': [
    { name: 'Tailwind CSS', version: '3.4.1', description: 'A utility-first CSS framework for rapid UI development.' },
    { name: 'shadcn/ui', version: 'N/A', description: 'A collection of re-usable UI components built on top of Radix UI and Tailwind.' },
    { name: 'Lucide React', version: '0.475.0', description: 'Library for clean and consistent icons.' },
  ],
  'AI & Generative': [
    { name: 'Genkit', version: '1.14.1', description: 'Google\'s open source framework for building AI-powered features.' },
    { name: 'Google AI (Gemini)', version: '1.14.1', description: 'Plugin for accessing Google\'s Gemini family of models via Genkit.' },
  ],
  'State Management & Forms': [
    { name: 'React Hooks & Context', version: 'N/A', description: 'Native React APIs for managing component state and shared data.' },
    { name: 'React Hook Form', version: '7.54.2', description: 'Performant, flexible, and extensible forms with easy-to-use validation.' },
    { name: 'Zod', version: '3.24.2', description: 'TypeScript-first schema declaration and validation library.' },
  ],
  'Authentication & Security': [
    { name: 'simple-webauthn', version: '10.0.0', description: 'Libraries for implementing WebAuthn (Passkeys) for passwordless authentication.' },
  ],
  'Backend & Database': [
    { name: 'Firebase Admin', version: '12.3.0', description: 'Server-side SDK for interacting with Firebase services like Firestore.' },
    { name: 'Firestore', version: 'N/A', description: 'NoSQL document database for storing application data like feature flags and audit logs.' },
  ],
};


export default function TechStackPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tech Stack"
        subtitle="An overview of the languages, frameworks, and libraries used in this application."
      />

      {Object.entries(techStack).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Technology</TableHead>
                  <TableHead className="w-[100px]">Version</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-semibold">{item.name}</TableCell>
                    <TableCell><Badge variant="secondary">{item.version}</Badge></TableCell>
                    <TableCell>{item.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
