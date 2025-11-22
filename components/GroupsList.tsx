"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EditGroupDialog,
  DeleteGroupDialog,
} from "@/components/EditGroupDialog";

interface Group {
  id: string;
  name: string;
  waId?: string | null;
  _count: {
    members: number;
    targetEvents: number;
  };
}

interface GroupsListProps {
  groups: Group[];
}

export function GroupsList({ groups }: GroupsListProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setEditDialogOpen(true);
  };

  const handleDelete = (group: Group) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <div className="font-semibold">{group.name}</div>
              <div className="text-sm text-gray-600">
                {group._count.members} חברים • {group._count.targetEvents}{" "}
                אירועים
              </div>
              {group.waId && (
                <div className="text-xs text-gray-500">מזהה WA: {group.waId}</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(group)}
              >
                ערוך
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(group)}
              >
                מחק
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedGroup && (
        <>
          <EditGroupDialog
            group={selectedGroup}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeleteGroupDialog
            group={{
              ...selectedGroup,
              memberCount: selectedGroup._count.members,
              eventCount: selectedGroup._count.targetEvents,
            }}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
}
