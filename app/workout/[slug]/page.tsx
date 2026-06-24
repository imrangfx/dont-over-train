import WorkoutClient from "./workout-client";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <WorkoutClient slug={slug} title={slug} />;
}
