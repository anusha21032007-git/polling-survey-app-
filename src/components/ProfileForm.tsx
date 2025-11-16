import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Profile } from '@/hooks/use-profile';
import AvatarUpload from './AvatarUpload';

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters.").max(100, "Full name must be 100 characters or less."),
  email: z.string().email(),
  username: z.string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or less.")
    .regex(/^[a-zA-Z0-9_-]*$/, "Username can only contain letters, numbers, underscores, and dashes.")
    .optional().or(z.literal('')),
  bio: z.string().max(200, "Bio must be 200 characters or less.").optional().or(z.literal('')),
  avatar_url: z.string().url("Invalid URL.").optional().or(z.literal('')),
  organization: z.string().max(100, "Organization must be 100 characters or less.").optional().or(z.literal('')),
  receive_emails: z.boolean().default(true),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: Profile;
  email: string;
  onSubmit: (data: ProfileFormValues) => void;
  isSubmitting: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, email, onSubmit, isSubmitting }) => {
  const navigate = useNavigate();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      email: email,
      username: profile.username || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || '',
      organization: profile.organization || '',
      receive_emails: profile.receive_emails ?? true,
    },
  });

  const handleAvatarUpload = (url: string) => {
    form.setValue('avatar_url', url, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-center block mb-2">Avatar</FormLabel>
                  <FormControl>
                    <AvatarUpload url={field.value || null} onUpload={handleAvatarUpload} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2 space-y-6">
            <FormField control={form.control} name="full_name" render={({ field }) => (
              <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input readOnly disabled {...field} /></FormControl><FormDescription>Email cannot be changed.</FormDescription></FormItem>
            )} />
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem><FormLabel>Username (Optional)</FormLabel><FormControl><Input placeholder="A unique username" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="organization" render={({ field }) => (
              <FormItem><FormLabel>Organization/Class (Optional)</FormLabel><FormControl><Input placeholder="Your organization or class" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem><FormLabel>Bio (Optional)</FormLabel><FormControl><Textarea placeholder="Tell us a little about yourself" className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="receive_emails" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Receive Email Notifications</FormLabel><FormDescription>Allow us to send you important notifications via email.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )} />
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;