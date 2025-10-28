export type OrgParticipationResponse = {
  // Block A
  totalMembers: number;
  activeHandlersCount: number;
  activeHandlerPercent: number; // 0-100

  // Block B
  activeCasesPerHandler: Array<{
    userId: string;
    name: string;
    openCaseCount: number;
  }>;

  // Block C
  skillCoverage: Array<{
    userId: string;
    name: string;
    skillCount: number;
  }>;

  // Block D
  recentIntakePerHandler: Array<{
    userId: string;
    name: string;
    newCasesLast30d: number;
  }>;
};
