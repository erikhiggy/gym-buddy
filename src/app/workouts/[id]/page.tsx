'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/page-layout';
import { ExerciseItem } from '@/components/exercise-item';
import { useWorkout, useWorkoutMutations } from '@/hooks/useWorkouts';
import {
	ArrowLeft,
	Heart,
	Clock,
	Users,
	Play,
	Edit,
	Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function WorkoutPage({ params }: PageProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const isPreview = searchParams.get('preview') === 'true';

	const [workoutId, setWorkoutId] = useState<string | null>(null);

	// Get workout ID from params
	useEffect(() => {
		params.then(({ id }) => setWorkoutId(id));
	}, [params]);

	const { workout, loading, error, refresh } = useWorkout(workoutId);
	const {
		toggleFavorite,
		completeWorkout,
		loading: mutationLoading,
	} = useWorkoutMutations();

	const handleFavoriteToggle = async () => {
		if (!workout) return;

		try {
			await toggleFavorite(workout.id);
			refresh(); // Refresh to get updated favorite status
			toast.success(
				workout.isFavorite ? 'Removed from favorites' : 'Added to favorites!'
			);
		} catch (error) {
			toast.error('Failed to update favorite');
		}
	};

	const handleStartWorkout = async () => {
		if (!workout) return;

		try {
			await completeWorkout(workout.id);
			toast.success('Workout completed!');
			router.push('/history');
		} catch (error) {
			toast.error('Failed to complete workout');
		}
	};

	// Calculate estimated duration
	const estimatedDuration =
		workout?.exercises?.reduce((total, exercise) => {
			if (exercise.duration) {
				// Extract minutes from duration string
				const match = exercise.duration.match(/(\d+)\s*minutes?/i);
				if (match) {
					return total + parseInt(match[1]);
				}
				// Assume 30 seconds per duration mention if no specific minutes
				return total + 0.5;
			}
			// Estimate 2 minutes per set for strength exercises
			return total + (exercise.sets || 1) * 2;
		}, 0) || 0;

	// Loading state
	if (loading || !workoutId) {
		return (
			<PageLayout>
				<div className='space-y-6'>
					<div className='flex items-center gap-3 mb-4'>
						<Link href='/workouts'>
							<Button variant='ghost' size='sm'>
								<ArrowLeft className='h-4 w-4' />
							</Button>
						</Link>
						<div className='animate-pulse flex-1'>
							<div className='h-6 bg-muted rounded w-48 mb-2'></div>
							<div className='h-4 bg-muted rounded w-32'></div>
						</div>
					</div>

					<div className='grid grid-cols-3 gap-4'>
						{[1, 2, 3].map((i) => (
							<Card key={i} className='animate-pulse'>
								<CardContent className='p-4'>
									<div className='h-8 bg-muted rounded w-full'></div>
								</CardContent>
							</Card>
						))}
					</div>

					<div className='space-y-3'>
						{[1, 2, 3].map((i) => (
							<Card key={i} className='animate-pulse'>
								<CardContent className='p-4'>
									<div className='h-6 bg-muted rounded w-3/4 mb-2'></div>
									<div className='h-4 bg-muted rounded w-1/2'></div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</PageLayout>
		);
	}

	// Error state
	if (error || !workout) {
		return (
			<PageLayout>
				<div className='space-y-6'>
					<div className='flex items-center gap-3 mb-4'>
						<Link href='/workouts'>
							<Button variant='ghost' size='sm'>
								<ArrowLeft className='h-4 w-4' />
							</Button>
						</Link>
					</div>

					<Card>
						<CardContent className='flex flex-col items-center justify-center py-12'>
							<p className='text-destructive mb-4'>
								{error || 'Workout not found'}
							</p>
							<div className='flex gap-3'>
								<Button onClick={refresh} variant='outline'>
									Try Again
								</Button>
								<Link href='/workouts'>
									<Button>Back to Workouts</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex items-center gap-3 mb-4'>
					<Link href='/workouts'>
						<Button variant='ghost' size='sm'>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<div className='flex-1'>
						<h1 className='text-xl font-bold'>{workout.name}</h1>
						{workout.description && (
							<p className='text-sm text-muted-foreground mt-1'>
								{workout.description}
							</p>
						)}
					</div>
					<Button
						variant='ghost'
						size='sm'
						onClick={handleFavoriteToggle}
						disabled={mutationLoading}
						className='p-2'
					>
						<Heart
							className={cn(
								'h-5 w-5 transition-colors',
								workout.isFavorite
									? 'fill-red-500 text-red-500'
									: 'text-muted-foreground hover:text-red-500'
							)}
						/>
					</Button>
				</div>

				{/* Workout Stats */}
				<div className='grid grid-cols-3 gap-4'>
					<Card>
						<CardContent className='flex flex-col items-center justify-center p-4'>
							<Clock className='h-5 w-5 text-primary mb-1' />
							<p className='text-sm font-medium'>
								{Math.round(estimatedDuration)}m
							</p>
							<p className='text-xs text-muted-foreground'>Duration</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='flex flex-col items-center justify-center p-4'>
							<Play className='h-5 w-5 text-primary mb-1' />
							<p className='text-sm font-medium'>
								{workout.exercises?.length || 0}
							</p>
							<p className='text-xs text-muted-foreground'>Exercises</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='flex flex-col items-center justify-center p-4'>
							<Users className='h-5 w-5 text-primary mb-1' />
							<p className='text-sm font-medium'>
								{workout.completionCount || 0}
							</p>
							<p className='text-xs text-muted-foreground'>Completed</p>
						</CardContent>
					</Card>
				</div>

				{/* Category */}
				<div>
					<Badge variant='outline'>{workout.category}</Badge>
				</div>

				{/* Exercises List */}
				<div className='space-y-3'>
					<h2 className='text-lg font-semibold'>Exercises</h2>

					{workout.exercises && workout.exercises.length > 0 ? (
						<div className='space-y-3'>
							{workout.exercises.map((exercise, index) => (
								<ExerciseItem
									key={exercise.id}
									exercise={exercise}
									index={index}
								/>
							))}
						</div>
					) : (
						<Card>
							<CardContent className='flex flex-col items-center justify-center py-8'>
								<Play className='h-8 w-8 text-muted-foreground mb-3' />
								<p className='text-muted-foreground text-center'>
									No exercises found in this workout.
								</p>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Action Buttons */}
				<div className='space-y-3 pb-6'>
					{isPreview ? (
						<Link href={`/workouts/${workout.id}`}>
							<Button size='lg' className='w-full'>
								<Play className='h-5 w-5 mr-2' />
								View Full Workout
							</Button>
						</Link>
					) : (
						<Button
							size='lg'
							className='w-full'
							onClick={handleStartWorkout}
							disabled={mutationLoading}
						>
							{mutationLoading && (
								<Loader2 className='h-4 w-4 mr-2 animate-spin' />
							)}
							<Play className='h-5 w-5 mr-2' />
							Complete Workout
						</Button>
					)}

					<div className='grid grid-cols-2 gap-3'>
						<Link href={`/workouts/${workout.id}/edit`}>
							<Button variant='outline' size='lg' className='w-full'>
								<Edit className='h-4 w-4 mr-2' />
								Edit
							</Button>
						</Link>

						<Button
							variant='outline'
							size='lg'
							onClick={handleFavoriteToggle}
							disabled={mutationLoading}
						>
							<Heart
								className={cn(
									'h-4 w-4 mr-2',
									workout.isFavorite && 'fill-current'
								)}
							/>
							{workout.isFavorite ? 'Unfavorite' : 'Favorite'}
						</Button>
					</div>
				</div>
			</div>
		</PageLayout>
	);
}
