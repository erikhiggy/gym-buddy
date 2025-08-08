import { PageLayout } from '@/components/page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { User } from 'lucide-react'

export default function ProfilePage() {
  return (
    <PageLayout title="Profile" description="Your profile and settings">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Profile page coming soon!
            <br />
            Manage your account and preferences here.
          </p>
        </CardContent>
      </Card>
    </PageLayout>
  )
}