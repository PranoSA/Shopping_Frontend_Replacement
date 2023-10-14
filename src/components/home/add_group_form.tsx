import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';





interface GroupDialogProps  {
  clickHandler:React.MouseEventHandler //(e:React.MouseEventHandler) : Promise<void> 
  changeHandleName:React.FormEventHandler
  changeHandleDescription:React.FormEventHandler
}



const GroupDialog:React.FC <GroupDialogProps> = ({clickHandler, changeHandleName, changeHandleDescription}) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose:React.MouseEventHandler = async(e:React.MouseEvent) => {
    e.preventDefault()
    setOpen(false);
  };


  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Add Group (Up to 10)
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a Name And Description For the Added Group
          </DialogContentText>
          <TextField
            error = {false}
            helperText = {""}
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="name"
            fullWidth
            variant="standard"
            onChange={changeHandleName}
          />
        <TextField
            autoFocus
            margin="dense"
            id="description"
            label="Description"
            type="name"
            fullWidth
            variant="standard"
            onChange={changeHandleDescription}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={(e) => {setOpen(false); clickHandler(e)}} > Submit </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


export {
  GroupDialog
}