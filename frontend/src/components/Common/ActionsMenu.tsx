import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";

import type { ItemPublic, UserPublic, HistoryPublic } from "../../client";
import EditUser from "../Admin/EditUser";
import EditItem from "../Items/EditItem";
import Delete from "./DeleteAlert";
import CheckinHistory from "../Histories/CheckinHistory";

interface ActionsMenuProps {
  type: string;
  value: ItemPublic | UserPublic | HistoryPublic;
  disabled?: boolean;
}

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const editUserModal = useDisclosure();
  const deleteModal = useDisclosure();
  const checkinModal = useDisclosure();
  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          {type !== "History" && (
            <MenuItem
              onClick={editUserModal.onOpen}
              icon={<FiEdit fontSize="16px" />}
            >
              编辑 {type}
            </MenuItem>
          )}

          {type === "History" && (
            <MenuItem
              onClick={checkinModal.onOpen}
              icon={<FiEye fontSize="16px" />}
            >
              查看 {type}
            </MenuItem>
          )}

          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            删除 {type}
          </MenuItem>
        </MenuList>
        {type === "User" ? (
          <EditUser
            user={value as UserPublic}
            isOpen={editUserModal.isOpen}
            onClose={editUserModal.onClose}
          />
        ) : (
          <EditItem
            item={value as ItemPublic}
            isOpen={editUserModal.isOpen}
            onClose={editUserModal.onClose}
          />
        )}
        {type === "History" && (
          <CheckinHistory
            history={value as HistoryPublic}
            isOpen={checkinModal.isOpen}
            onClose={checkinModal.onClose}
          />
        )}
        <Delete
          type={type}
          id={value.id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  );
};

export default ActionsMenu;
