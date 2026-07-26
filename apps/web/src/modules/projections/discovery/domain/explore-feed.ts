export type ExploreRepositoryCard = Readonly<{
  description: string;
  href: string;
  label: string;
  topics: readonly string[];
}>;
export type ExploreFeed = Readonly<{
  collections: readonly Readonly<{
    description: string;
    title: string;
  }>[];
  repositories: readonly ExploreRepositoryCard[];
  topics: readonly string[];
}>;
