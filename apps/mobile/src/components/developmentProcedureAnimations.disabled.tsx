type DevelopmentProcedureAnimationProps = {
  asset: string;
  progress: unknown;
  reducedMotion: boolean;
};

// Metro substitutes this module into production bundles. Development medical
// animation assets are absent from the release graph until they are reviewed.
export function DevelopmentProcedureAnimation(_props: DevelopmentProcedureAnimationProps) {
  return null;
}
