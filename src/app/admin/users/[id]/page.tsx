
'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditUserPage() {
    const params = useParams();
    const { id } = params;
    const isNew = id === 'new';

    return (
        <div className="space-y-8">
            <PageHeader
                title={isNew ? 'Create User' : 'Edit User'}
                subtitle={isNew ? 'Add a new user to the system.' : 'Edit user details and permissions.'}
            />
            <Card>
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>User form will go here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
