import cn from "classnames";
import i18next from "i18next";
import React, {
  PureComponent,
  ReactElement,
} from "react";

import Avatar, {
  CORNER,
} from "../../../@nabstudio/uikit/Components/Avatar";
import {
  Menu,
  MenuItem,
} from "../../../@nabstudio/uikit/Components/Menu";
import Table from "../../../@nabstudio/uikit/Components/Table";
import CheckBox from "../../../@nabstudio/uikit/Elements/CheckBox";
import Icon from "../../../@nabstudio/uikit/Elements/Icon";
import {
  I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG,
} from "../../constants/i18n_namespaces";
import { convertRolesToString } from "../../helpers";
import {
  Collaborator,
  SUBMISSION_ROLE,
} from "../../types";
import s from "./AddCollaboratorTable.scss";


export interface Props {
  t: i18next.TFunction;
  collaborators: Collaborator[];
  onRemoveCollaborator: (collaboratorId: string) => void;
  onChangeRoleCollaborator: (collaboratorId: string, { role, checked }: { role: string; checked: boolean }) => void;
  selectedRoles: {
    [key: string]: { [key: string]: boolean };
  };
}

export interface State {
  selectRoleOpenId?: string | null;
}

class AddCollaboratorTable extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      selectRoleOpenId: null,
    };
  }

  _openSelectRoleDialog = (_e: React.MouseEvent<HTMLDivElement, MouseEvent>, collaboratorId: string): void => {
    this.setState(
      {
        selectRoleOpenId: null,
      },
      (): void => {
        this.setState({
          selectRoleOpenId: collaboratorId,
        });
      },
    );
  }

  _onMenuClose = (): void => {
    this.setState({ selectRoleOpenId: null });
  }

  handleRemoveCollaborator = (collaboratorId: string): void => {
    const { onRemoveCollaborator } = this.props;

    if (onRemoveCollaborator) {
      onRemoveCollaborator(collaboratorId);
    }
  }

  handleChangeRole = (collaboratorId: string, { role, checked }: { role: string; checked: boolean }): void => {
    const { onChangeRoleCollaborator } = this.props;

    if (onChangeRoleCollaborator) {
      onChangeRoleCollaborator(
        collaboratorId,
        {
          role: role,
          checked: checked,
        },
      );
    }
  }

  _getRoleLabel = (roles: string[], t: i18next.TFunction): string => {
    let roleLabel: string = (
      t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-add-collaborator-table-select-role-label`)
    );

    if (roles && roles.length > 0) {
      roleLabel = convertRolesToString(roles, t, I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG);
    }

    return roleLabel;
  }

  _renderActionMenu = (): ReactElement | null => {
    const {
      t,
      collaborators,
    } = this.props;

    const {
      selectRoleOpenId,
    } = this.state;

    if (!selectRoleOpenId) {
      return null;
    }

    const item = collaborators.find((collaborator: Collaborator): boolean => collaborator.oid === selectRoleOpenId);

    if (!item) {
      return null;
    }

    const collaboratorId = `add-collaborator-${item.oid}`;
    const menuOpen = selectRoleOpenId === item.oid;

    const visibleRolesMap = this._getVisibleRolesMap(item);

    // ROLE CHECKBOX
    const editorChecked = visibleRolesMap[SUBMISSION_ROLE.EDITOR];
    const managerChecked = visibleRolesMap[SUBMISSION_ROLE.MANAGER];

    return (
      <Menu
        // @ts-ignore
        anchorElement={typeof document !== "undefined" && document.getElementById(collaboratorId)}
        anchorCorner={Menu.Corner.BOTTOM_LEFT}
        anchorMargin={{ left: 24 }}
        open={menuOpen}
        onClose={this._onMenuClose}
      >
        <MenuItem>
          <CheckBox
            checked={!!editorChecked}
            onChange={(e): void => this.handleChangeRole(item.oid, {
              role: SUBMISSION_ROLE.EDITOR,
              checked: e.target.checked,
            })}
            checkBoxId={`collaborator-role-editor-${item.oid}`}
            label={
              t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-collaborator-role-editor`)
            }
          />
        </MenuItem>
        <MenuItem>
          <CheckBox
            checked={!!managerChecked}
            onChange={(e): void => this.handleChangeRole(item.oid, {
              role: SUBMISSION_ROLE.MANAGER,
              checked: e.target.checked,
            })}
            checkBoxId={`collaborator-role-manager-${item.oid}`}
            label={
              t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-collaborator-role-manager`)
            }
          />
        </MenuItem>
      </Menu>
    );
  }

  _getVisibleRolesMap = (item: Collaborator): { [key: string]: boolean | undefined } => {
    const {
      selectedRoles,
    } = this.props;

    const selectRoles = selectedRoles[item.oid];

    // CHECK ROLE CHANGED OR NOT
    const isEditorChanged = selectRoles && selectRoles[SUBMISSION_ROLE.EDITOR] !== undefined;
    const isManagerChanged = selectRoles && selectRoles[SUBMISSION_ROLE.MANAGER] !== undefined;

    // INITIAL ROLE
    const editorInitalChecked = item.roles && item.roles.includes(SUBMISSION_ROLE.EDITOR);
    const managerInitalChecked = item.roles && item.roles.includes(SUBMISSION_ROLE.MANAGER);

    const visibleRolesMap: { [key: string]: boolean | undefined } = {
      [SUBMISSION_ROLE.EDITOR]: isEditorChanged ?
        selectRoles[SUBMISSION_ROLE.EDITOR] :
        editorInitalChecked,
      [SUBMISSION_ROLE.MANAGER]: isManagerChanged ?
        selectRoles[SUBMISSION_ROLE.MANAGER] :
        managerInitalChecked,
    };

    return visibleRolesMap;
  }

  _getVisibleRoles = (item: Collaborator): string[] => {
    // CHECK ROLES LABEL ACTIVE OR NOT
    const visibleRolesMap = this._getVisibleRolesMap(item);

    const visibleRoles: string[] = [];
    Object.keys(visibleRolesMap).forEach((roleKey: string): void => {
      if (visibleRolesMap[roleKey]) {
        visibleRoles.push(roleKey);
      }
    });

    return visibleRoles;
  }

  _isRoleLabelActive = (item: Collaborator): boolean => {
    const visibleRoles = this._getVisibleRoles(item);
    let selectRoleActive = false;
    if (visibleRoles && visibleRoles.length > 0) {
      selectRoleActive = true;
    }

    return selectRoleActive;
  }

  render(): ReactElement {
    const {
      t,
      collaborators: addedCollaborators,
    } = this.props;

    return (
      <div className={s.addCollaboratorContainer}>
        <Table className={s.addCollaboratorTable}>
          <Table.Head sticky>
            <Table.Cell className={s.textCapitalize}>
              {t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-add-collaborator-table-to-be-added`)}
            </Table.Cell>
            <Table.Cell>
              {t(
                `${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-add-collaborator-table-roles-in-submission`,
              )}
            </Table.Cell>
            <Table.Cell> </Table.Cell>
          </Table.Head>
          <Table.Body>
            {
              addedCollaborators && addedCollaborators.map((item: Collaborator): ReactElement => {
                const collaboratorId = `add-collaborator-${item.oid}`;

                // CHECK ROLES LABEL ACTIVE OR NOT
                const visibleRoles = this._getVisibleRoles(item);
                const selectRoleActive = this._isRoleLabelActive(item);

                // ROLE LABEL
                const selectRoleLabel = this._getRoleLabel(visibleRoles, t);

                return (
                  <Table.Row key={collaboratorId} height={60}>
                    <Table.Cell>
                      <div className={s.collaboratorDetail}>
                        <Avatar
                          width={24}
                          src={item.thumbnail}
                          corner={CORNER.ROUNDED}
                        />
                        <div className={s.collaboratorInfo}>
                          <div className={s.collaboratorName}>{item.name}</div>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div
                        id={collaboratorId}
                        className={cn(s.selectRoleLabel, { [s.selectRoleLabelActive]: selectRoleActive })}
                        onClick={
                          (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
                            e.preventDefault();
                            this._openSelectRoleDialog(e, item.oid);
                          }
                        }
                        role="presentation"
                      >
                        <span>
                          {selectRoleLabel}
                        </span>
                        <Icon name="arrow_drop_down" className={s.iconDropdown} />
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div
                        className={s.clickable}
                        onClick={
                          (): void => (
                            this.handleRemoveCollaborator(item.oid)
                          )
                        }
                        role="presentation"
                      >
                        <Icon name="delete" className={s.iconRemove} />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            }
          </Table.Body>
        </Table>

        {/* ACTION MENU */}
        {
          this._renderActionMenu()
        }
      </div>
    );
  }

}

export default AddCollaboratorTable;
