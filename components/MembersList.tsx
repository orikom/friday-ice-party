"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EditMemberDialog,
  DeleteMemberDialog,
} from "@/components/EditMemberDialog";

interface Member {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  city: string | null;
  occupation: string | null;
  description: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
}

interface MembersListProps {
  members: Member[];
}

export function MembersList({ members }: MembersListProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  const handleDelete = (member: Member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <div className="font-semibold">{member.name || member.email}</div>
              <div className="text-sm text-gray-600">
                {member.email} • {member.role}
              </div>
              {member.city && (
                <div className="text-xs text-gray-500">📍 {member.city}</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(member)}
              >
                ערוך
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(member)}
              >
                מחק
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <>
          <EditMemberDialog
            member={selectedMember}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeleteMemberDialog
            member={selectedMember}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
}
