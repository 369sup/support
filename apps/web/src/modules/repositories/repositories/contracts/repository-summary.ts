export type PublicRepositorySummary = Readonly<{
  repositoryId: string;
  ownerUsername: string;
  name: string;
  description: string;
  visibility: "public";
  lifecycleState: "active";
  updatedAt: string;
}>;
