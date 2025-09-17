"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
interface NotePreviewDialogProps {
  note: Doc<"notes">;
}

export function NotePreviewDialog({ note }: NotePreviewDialogProps) {
  const searchparams = useSearchParams();
  const isOpen = searchparams.get("noteId") === note._id.toString();

  const deleteNote = useMutation(api.notes.deleteNote);
  const [deletePending, setDeletePending] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    if (deletePending) return;
    setDeletePending(true);
    try {
      await deleteNote({ noteId: note._id });
      window.history.pushState(null, "", window.location.pathname);
      toast.success("Note deleted");
    } catch (e) {
      console.error("Failed to delete note", e);
      setDeletePending(false);
      toast.error("Failed to delete note");
    } finally {
      setDeletePending(false);
    }
  }

  function handleClose() {
    if (deletePending) return;
    window.history.pushState(null, "", window.location.pathname);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 whitespace-pre-wrap">{note.body}</div>
        <DialogFooter className="mt-6">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => setEditOpen(true)}
            disabled={deletePending}
          >
            <Pencil size={16} /> Edit
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleDelete}
            disabled={deletePending}
          >
            <Trash2 size={16} />
            {deletePending ? "Deleting..." : "Delete Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <EditNoteDialog open={editOpen} onOpenChange={setEditOpen} note={note} />
    </Dialog>
  );
}

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useAction } from "convex/react";

const editFormSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty." }),
  body: z.string().min(1, { message: "Body cannot be empty." }),
});

function EditNoteDialog({
  open,
  onOpenChange,
  note,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Doc<"notes">;
}) {
  const updateNote = useAction(api.notesActions.updateNote);

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: { title: note.title, body: note.body },
  });

  useEffect(() => {
    if (open) {
      form.reset({ title: note.title, body: note.body });
    }
  }, [open, note._id, note.title, note.body, form]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof editFormSchema>) {
    try {
      await updateNote({ noteId: note._id, ...values });
      toast.success("Note updated");
      onOpenChange(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notes:updated", { detail: { noteId: note._id } }));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update note");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Note body" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
