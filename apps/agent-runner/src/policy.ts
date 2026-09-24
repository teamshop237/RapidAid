export const AGENT_POLICY = {
  phase: "approval-gated-branch-write",
  allowedTools: ["read_project_file", "search_project_files", "git_status", "git_diff", "run_project_check"],
  prohibitedActions: [
    "create_or_merge_branches",
    "install_dependencies",
    "read_environment_variables",
    "network_access",
    "production_access",
    "medical_content_generation",
    "medical_content_approval",
    "medical_content_publication",
    "emergency_directory_mutation",
    "deployment"
  ]
} as const;

export const BRANCH_WRITE_POLICY = {
  branchPrefix: "agent/",
  requiresSdkApproval: true,
  writableRoots: ["apps", "packages", "docs"]
} as const;
