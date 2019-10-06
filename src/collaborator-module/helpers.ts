import i18next from "i18next";

import { SUBMISSION_ROLE } from "./types";


// ROLE HELPERS
export const sortRoles = (roles: string[]): string[] => {
  const roleOrder: { [key: string]: number } = {
    [SUBMISSION_ROLE.SUBMITTER]: 1,
    [SUBMISSION_ROLE.EDITOR]: 2,
    [SUBMISSION_ROLE.MANAGER]: 3,
  };

  if (roles) {
    return roles.sort((a: string, b: string): number => roleOrder[a] - roleOrder[b]);
  }

  return [];
};

export const convertRolesToString = (roles: string[], t: i18next.TFunction, namespace: string): string => {
  const labelMap: { [key: string]: string } = {
    [SUBMISSION_ROLE.SUBMITTER]: (
      t(`${namespace}:detail-settings-collaborator-role-submitter`)
    ),
    [SUBMISSION_ROLE.EDITOR]: t(`${namespace}:detail-settings-collaborator-role-editor`),
    [SUBMISSION_ROLE.MANAGER]: t(`${namespace}:detail-settings-collaborator-role-manager`),
  };

  const sortedRoles = sortRoles(roles);

  return sortedRoles.map((item: string): string => labelMap[item]).join(", ");
};
