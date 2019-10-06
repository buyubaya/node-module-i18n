import React from "react";
import AddCollaboratorDialog from "../collaborator-module/components/AddCollaboratorDialog";


const TestCollaborator = () => {
  const showAddCollaboratorDialog = true;
  const collaborators = [];

  const _closeAddCollaboratorDialog = () => {
    console.log("CLOSE");
  }

  const handleAddCollaborators = () => {
    console.log("CLOSE");
  }

  return(
    <AddCollaboratorDialog
      showDialog={showAddCollaboratorDialog}
      onCloseDialog={_closeAddCollaboratorDialog}
      onAddCollaborators={handleAddCollaborators}
      currentCollaborators={collaborators}
    />
  );
};


export default TestCollaborator;