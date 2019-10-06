export const SUBMISSION_ROLE = {
  SUBMITTER: "submitter",
  EDITOR: "editor",
  MANAGER: "manager",
};

export interface Collaborator {
  oid: string;
  name?: string;
  thumbnail?: string;
  roles: string[];
}
