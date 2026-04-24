import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createOpportunity, updateOpportunity, type Opportunity, type OpportunityType } from "@/services/opportunities";

const TYPES: OpportunityType[] = ["internship", "hackathon", "event", "job", "scholarship", "project", "other"];

interface Props {
  existing?: Opportunity | null;
  onSaved: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function OpportunityFormDialog({ existing, onSaved, trigger, open, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [organization, setOrganization] = useState(existing?.organization ?? "");
  const [type, setType] = useState<OpportunityType>((existing?.type as OpportunityType) ?? "other");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [link, setLink] = useState(existing?.link ?? "");
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title,
        organization: organization || null,
        type,
        description,
        location: location || null,
        link: link || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (existing) {
        await updateOpportunity(existing.id, payload);
        toast.success("Opportunity updated");
      } else {
        await createOpportunity(payload);
        toast.success("Opportunity posted");
      }
      onSaved();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit opportunity" : "Post an opportunity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="org">Organization</Label>
              <Input id="org" value={organization} onChange={(e) => setOrganization(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as OpportunityType)}>
                <SelectTrigger id="type" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote, Berlin…" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="link">Link</Label>
              <Input id="link" type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, design, ai" className="mt-1.5" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="bg-gradient-primary text-primary-foreground shadow-glow">
              {submitting ? "Saving…" : existing ? "Save changes" : "Post opportunity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewOpportunityButton({ onSaved }: { onSaved: () => void }) {
  return (
    <OpportunityFormDialog
      onSaved={onSaved}
      trigger={
        <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow">
          <Plus className="h-4 w-4" /> Post
        </Button>
      }
    />
  );
}
