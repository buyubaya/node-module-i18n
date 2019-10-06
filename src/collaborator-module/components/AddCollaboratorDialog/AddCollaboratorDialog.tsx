import i18next from "i18next";
import { WithTranslation } from "next-i18next";
// SAMPLE
import getConfig from "next/config";
import React, { PureComponent, ReactElement } from "react";
//  LOCALIZE
import { withTranslation } from "react-i18next";

import { Dialog, DialogActions, DialogContent, DialogTitle } from "../../../@nabstudio/uikit/Components/Dialog";
import Button from "../../../@nabstudio/uikit/Elements/Button";
import TextField from "../../../@nabstudio/uikit/Elements/TextField";
import { fetchData } from "../../../core/fetch";
import {
  I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG,
} from "../../constants/i18n_namespaces";
import { Collaborator } from "../../types";
import AddCollaboratorTable from "../AddCollaboratorTable";
import s from "./AddCollaboratorDialog.scss";


// GET COLLABORATOR BY EMAIL
const { publicRuntimeConfig } = getConfig();
const getCollaboratorEmailUrl = `${publicRuntimeConfig.submissionAppAPI}/users/search`;
export const getCollaboratorByEmail = (email: string): Promise<{
  oid: string;
  name: string;
  email: string;
  thumbnail: string;
}> => (
  fetchData(
    getCollaboratorEmailUrl,
    {
      method: "PUT",
      body: JSON.stringify({
        email: email,
      }),
    },
  )
);


export interface Props extends WithTranslation {
  t: i18next.TFunction;
  currentCollaborators?: Collaborator[];
  onAddCollaborators?: Function;
  showDialog: boolean;
  onCloseDialog?: Function;
}

export interface State {
  searchText: string;
  searchError?: string;

  // COLLABORATOR TABLE
  addedCollaborators: Collaborator[];
  selectedRoles: {
    [key: string]: { [key: string]: boolean };
  };
  isSearchingCollaborator?: boolean;
}

export interface NewCollaborator {
  oid: string;
  name?: string;
  email: string;
  thumbnail?: string;
  roles?: string[];
}


class AddCollaboratorDialog extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      searchText: "",

      // COLLABORATOR TABLE
      addedCollaborators: [],
      selectedRoles: {},
      isSearchingCollaborator: false,
    };
  }

  _closeAddDialog = (): void => {
    const {
      onCloseDialog,
    } = this.props;

    this.resetDialog();
    if (onCloseDialog) {
      onCloseDialog();
    }
  };

  handleSearchInputChange = (value: string): void => {
    this.setState({
      searchText: value,
    });
  };

  _isCollaboratorOidExisted = (collaboratorOid: string, currentCollaborators: Collaborator[] = []): boolean => {
    let check = false;

    if (!currentCollaborators) {
      return check;
    }

    currentCollaborators.forEach((collaborator: Collaborator): void => {
      if (collaborator.oid === collaboratorOid) {
        check = true;
      }
    });

    return check;
  }

  _isCollaboratorEmailExisted = (collaboratorEmail: string, addedCollaborators: Collaborator[] = []): boolean => {
    let check = false;

    if (!addedCollaborators) {
      return check;
    }

    addedCollaborators.forEach((collaborator: Collaborator): void => {
      if (collaborator.name === collaboratorEmail) {
        check = true;
      }
    });

    return check;
  }

  handleSearchInputSubmit = async (): Promise<void> => {
    const {
      t,
      currentCollaborators,
    } = this.props;

    const {
      searchText,
      addedCollaborators,
    } = this.state;

    this.setState({ searchError: undefined });

    if (searchText) {
      if (this._isCollaboratorEmailExisted(searchText, addedCollaborators)) {
        this.setState({
          searchError: (
            t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:add-collaborator-dialog-search-email-existed`)
          ),
        });
      } else {
        this.setState({
          isSearchingCollaborator: true,
        });

        try {
          const data: NewCollaborator = await getCollaboratorByEmail(searchText);

          let newCollaboratorName = data.name;
          if (!newCollaboratorName) {
            newCollaboratorName = data.email ? data.email : "";
          }

          const newCollaborator = {
            oid: data.oid,
            name: newCollaboratorName,
            thumbnail: data.thumbnail || "",
            roles: data.roles || [],
          };

          // CHECK IF COLLABORATOR EXISTED IN COLLABORATOR LIST
          if (this._isCollaboratorOidExisted(newCollaborator.oid, currentCollaborators)) {
            this.setState({
              searchError: (
                t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:add-collaborator-dialog-search-email-existed`)
              ),
              isSearchingCollaborator: false,
            });
          } else {
            this.setState(
              (state: State): {
                addedCollaborators: Collaborator[];
                isSearchingCollaborator: boolean;
              } => ({
                addedCollaborators: this._getUniqueCollaborators([
                  ...state.addedCollaborators,
                  newCollaborator,
                ]),
                isSearchingCollaborator: false,
              }),
            );
          }
        } catch (error) {
          this.setState({
            searchError: (
              t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:add-collaborator-dialog-search-email-not-belong`)
            ),
            isSearchingCollaborator: false,
          });
        }
      }
    }
  };

  _getUniqueCollaborators = (collaborators: Collaborator[] = []): Collaborator[] => {
    const existed: { [key: string]: boolean } = {};
    const newCollaborators: Collaborator[] = [];

    collaborators.forEach((item: Collaborator): void => {
      if (existed[item.oid] !== true) {
        newCollaborators.push(item);
      }
      existed[item.oid] = true;
    });

    return newCollaborators;
  }

  addCollaborator = (): void => {
    const {
      currentCollaborators,
      onAddCollaborators,
    } = this.props;

    const {
      addedCollaborators,
      selectedRoles,
    } = this.state;

    this._closeAddDialog();

    if (onAddCollaborators) {
      let newlyAddedCollaborators = this._getNewlyAddedCollaborators(currentCollaborators, addedCollaborators);
      newlyAddedCollaborators = newlyAddedCollaborators.map((collaborator: Collaborator): Collaborator => ({
        ...collaborator,
        roles: this._getAddedCollaboratorRoles(collaborator.roles, selectedRoles[collaborator.oid]),
      }));
      newlyAddedCollaborators = newlyAddedCollaborators.map(
        (
          collaborator: Collaborator,
        ): { oid: string; roles: string[] } => ({
          oid: collaborator.oid,
          roles: collaborator.roles,
        }),
      );

      onAddCollaborators(newlyAddedCollaborators);
    }
  };

  _getNewlyAddedCollaborators = (
    currentCollaborators: Collaborator[] = [],
    addedCollaborators: Collaborator[],
  ): Collaborator[] => {
    const existed: { [key: string]: boolean } = {};
    const newCollaborators: Collaborator[] = [];

    if (currentCollaborators) {
      currentCollaborators.forEach((item: Collaborator): void => {
        existed[item.oid] = true;
      });
    }

    addedCollaborators.forEach((item: Collaborator): void => {
      if (existed[item.oid] !== true) {
        newCollaborators.push(item);
      }
    });

    return newCollaborators;
  }

  _getAddedCollaboratorRoles = (
    roles: string[], selectedRoles: { [key: string]: boolean } = {},
  ): string[] => {
    const initialRoles = roles.filter((role: string): boolean => selectedRoles[role] === undefined);
    const newRoles = Object.keys(selectedRoles).filter((roleKey: string): boolean => selectedRoles[roleKey]);
    const addedRoles = [...initialRoles, ...newRoles];

    return addedRoles;
  }

  // REMOVE COLLABORATOR
  handleRemoveCollaborator = (collaboratorId: string): void => {
    this.setState((state: State): { addedCollaborators: Collaborator[] } => ({
      addedCollaborators: state.addedCollaborators.filter((item: Collaborator): boolean => item.oid !== collaboratorId),
    }));
  }

  // CHANGE ROLE COLLABORATOR
  handleChangeRoleCollaborator = (
    collaboratorId: string, { role, checked }: { role: string; checked: boolean },
  ): void => {
    this.setState((state: State): { selectedRoles: { [key: string]: { [key: string]: boolean } } } => {
      let currentSelectRoles = state.selectedRoles[collaboratorId];
      if (!currentSelectRoles) {
        currentSelectRoles = {};
      }

      currentSelectRoles[role] = checked;

      return ({
        selectedRoles: {
          ...state.selectedRoles,
          [collaboratorId]: currentSelectRoles,
        },
      });
    });
  }

  // CHECK IF IT IS ABLE TO ADD
  isAbleToAdd = (): boolean => {
    const { addedCollaborators, selectedRoles } = this.state;
    let check = true;

    // NO COLLABORATORS ADDED
    if (addedCollaborators && addedCollaborators.length < 1) {
      return false;
    }

    // ONLY DISABLE IF NO NEW ROLES CHECKED
    addedCollaborators.forEach((item: Collaborator): void => {
      if (!this._checkCollaboratorRolesChecked(item.roles, selectedRoles[item.oid])) {
        check = false;
      }
    });

    return check;
  }

  _checkCollaboratorRolesChecked = (roles: string[], selectedRoles: { [key: string]: boolean } = {}): boolean => {
    let check = false;

    const addedRoles = this._getAddedCollaboratorRoles(roles, selectedRoles);

    if (addedRoles && addedRoles.length > 0) {
      check = true;
    }

    return check;
  }

  // RESET DIALOG
  resetDialog = (): void => {
    this.setState({
      addedCollaborators: [],
      selectedRoles: {},
      searchText: "",
      searchError: undefined,
    });
  }

  render(): ReactElement {
    const {
      t,
      showDialog,
    } = this.props;

    const {
      searchText,
      addedCollaborators,
      selectedRoles,
      searchError,
      isSearchingCollaborator,
    } = this.state;

    return (
      <Dialog show={showDialog} onPressEsc={this._closeAddDialog} onOverlayClick={this._closeAddDialog}>
        <DialogTitle className={s.textCapitalize}>
          {t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-add-collaborator-dialog-title`)}
        </DialogTitle>
        <DialogContent>
          <div className={s.addCollaboratorDialogSubtitle}>
            {t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-add-collaborator-dialog-subtitle`)}
          </div>
          <TextField
            name="collaboratorEmail"
            value={searchText}
            onChange={this.handleSearchInputChange}
            placeholder={
              t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-add-collaborator-dialog-select-placeholder`)
            }
            action={
              t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-add-collaborator-dialog-select-label`)
            }
            onClickAction={this.handleSearchInputSubmit}
            className={s.searchInputContainer}
            error={searchError}
            type="email"
            disabled={isSearchingCollaborator}
          />
          {
            addedCollaborators && addedCollaborators.length > 0 &&
            (
              <div className={s.addCollaboratorTableContainer}>
                <AddCollaboratorTable
                  t={t}
                  collaborators={addedCollaborators}
                  onRemoveCollaborator={this.handleRemoveCollaborator}
                  onChangeRoleCollaborator={this.handleChangeRoleCollaborator}
                  selectedRoles={selectedRoles}
                />
              </div>
            )
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={this._closeAddDialog}>
            {t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-add-collaborator-dialog-action-cancel`)}
          </Button>
          <Button onClick={this.addCollaborator} disabled={!this.isAbleToAdd()}>
            {t(`${I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG}:detail-settings-add-collaborator-dialog-action-add`)}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

}


export default withTranslation(
  [I18N_NAMESPACES_ADD_COLLABORATOR_DIALOG],
)(AddCollaboratorDialog);
